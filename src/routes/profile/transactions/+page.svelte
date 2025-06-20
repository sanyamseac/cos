<script lang="ts">
	import Elements from '$lib/components/Elements.svelte'
	import { formatPrice } from '$lib/utils'
	import { Button } from 'bits-ui'
	import type { PageData } from './$types'
	import { ArrowLeft, ChevronLeft, Search, X } from 'lucide-svelte'
	import { goto } from '$app/navigation'

	let { data }: { data: PageData } = $props()
	let searchQuery = $state('')
	let isSearchOpen = $state(false)

	function toggleSearch() {
		isSearchOpen = !isSearchOpen
		if (!isSearchOpen) {
			searchQuery = ''
		}
	}

	// Fuzzy string matching function
	function fuzzyMatch(str: string, pattern: string): boolean {
		if (!pattern) return true

		const strLower = str.toLowerCase()
		const patternLower = pattern.toLowerCase()

		// Direct substring match (highest priority)
		if (strLower.includes(patternLower)) return true

		// Fuzzy matching for typos - allows skipping characters
		let patternIndex = 0
		let strIndex = 0

		while (patternIndex < patternLower.length && strIndex < strLower.length) {
			if (patternLower[patternIndex] === strLower[strIndex]) {
				patternIndex++
			}
			strIndex++
		}

		// Allow match if most characters are found in order
		return patternIndex >= Math.max(1, patternLower.length * 0.7)
	}

	// Enhanced search function with multiple criteria and fuzzy matching
	function matchesSearch({ transaction, canteen }, query: string) {
		if (!query.trim()) return true

		const searchTerm = query.toLowerCase().trim()
		const transactionAmount = parseFloat(transaction.amount)
		const transactionDate = new Date(transaction.createdAt)

		// Create searchable fields array with various formats
		const searchableFields = [
			// Basic fields
			canteen?.name || '',
			transaction.reference || '',
			formatPrice(Math.abs(transactionAmount)),
			Math.abs(transactionAmount).toString(),

			// Date in various formats
			transactionDate.toLocaleDateString('en-IN'), // DD/MM/YYYY
			transactionDate.toLocaleDateString('en-US'), // MM/DD/YYYY
			transactionDate.toISOString().split('T')[0], // YYYY-MM-DD
			transactionDate.getFullYear().toString(),
			transactionDate.getMonth() + 1, // Month number
			transactionDate.getDate().toString(), // Day

			// Month names
			transactionDate.toLocaleDateString('en-IN', { month: 'long' }), // January
			transactionDate.toLocaleDateString('en-IN', { month: 'short' }), // Jan

			// Day names
			transactionDate.toLocaleDateString('en-IN', { weekday: 'long' }), // Monday
			transactionDate.toLocaleDateString('en-IN', { weekday: 'short' }), // Mon

			// Combined date formats
			transactionDate.toLocaleDateString('en-IN', {
				year: 'numeric',
				month: 'long',
				day: 'numeric',
			}), // 15 January 2024

			transactionDate.toLocaleDateString('en-IN', {
				month: 'short',
				day: 'numeric',
			}), // Jan 15

			// Time formats
			transactionDate.toLocaleTimeString('en-IN', {
				hour: '2-digit',
				minute: '2-digit',
			}), // 14:30

			transactionDate.toLocaleTimeString('en-IN', {
				hour: 'numeric',
				minute: '2-digit',
				hour12: true,
			}), // 2:30 PM

			// Relative terms that users might search
			...(isToday(transactionDate) ? ['today', 'टुडे'] : []),
			...(isYesterday(transactionDate) ? ['yesterday', 'कल'] : []),
			...(isThisWeek(transactionDate) ? ['this week', 'week'] : []),
			...(isThisMonth(transactionDate) ? ['this month', 'month'] : []),

			// Transaction type
			transactionAmount > 0
				? ['credit', 'received', 'added', 'deposit']
				: ['debit', 'spent', 'paid', 'withdraw'],
		]

		// Check each field with both exact and fuzzy matching
		return searchableFields.some((field) => {
			const fieldStr = field.toString()
			return (
				fuzzyMatch(fieldStr, searchTerm) ||
				fieldStr.toLowerCase().includes(searchTerm) ||
				// Also check if search term is contained in field (reverse check)
				searchTerm.includes(fieldStr.toLowerCase())
			)
		})
	}

	// Calculate relevance score for search results
	function calculateRelevanceScore({ transaction, canteen }, query: string): number {
		if (!query.trim()) return 0

		const searchTerm = query.toLowerCase().trim()
		const transactionAmount = parseFloat(transaction.amount)
		const transactionDate = new Date(transaction.createdAt)

		let score = 0

		// Create weighted searchable fields
		const weightedFields = [
			// High priority fields (weight: 10)
			{ text: canteen?.name || '', weight: 10 },
			{ text: transaction.reference || '', weight: 10 },

			// Medium priority fields (weight: 7)
			{ text: formatPrice(Math.abs(transactionAmount)), weight: 7 },
			{ text: Math.abs(transactionAmount).toString(), weight: 7 },

			// Date fields (weight: 5)
			{ text: transactionDate.toLocaleDateString('en-IN'), weight: 5 },
			{ text: transactionDate.toLocaleDateString('en-US'), weight: 5 },
			{ text: transactionDate.getFullYear().toString(), weight: 5 },
			{ text: transactionDate.toLocaleDateString('en-IN', { month: 'long' }), weight: 5 },
			{ text: transactionDate.toLocaleDateString('en-IN', { month: 'short' }), weight: 5 },

			// Low priority fields (weight: 3)
			{ text: transactionDate.getDate().toString(), weight: 3 },
			{ text: transactionDate.toLocaleDateString('en-IN', { weekday: 'long' }), weight: 3 },
			{ text: transactionDate.toLocaleDateString('en-IN', { weekday: 'short' }), weight: 3 },

			// Very low priority (weight: 1)
			...(isToday(transactionDate)
				? [
						{ text: 'today', weight: 1 },
						{ text: 'टुडे', weight: 1 },
					]
				: []),
			...(isYesterday(transactionDate)
				? [
						{ text: 'yesterday', weight: 1 },
						{ text: 'कल', weight: 1 },
					]
				: []),
			...(transactionAmount > 0
				? [
						{ text: 'credit', weight: 1 },
						{ text: 'received', weight: 1 },
					]
				: [
						{ text: 'debit', weight: 1 },
						{ text: 'spent', weight: 1 },
					]),
		]

		// Calculate score for each field
		weightedFields.forEach((field) => {
			const fieldText = field.text.toLowerCase()

			// Exact match (highest score)
			if (fieldText === searchTerm) {
				score += field.weight * 100
			}
			// Starts with search term
			else if (fieldText.startsWith(searchTerm)) {
				score += field.weight * 50
			}
			// Contains search term
			else if (fieldText.includes(searchTerm)) {
				score += field.weight * 25
			}
			// Fuzzy match
			else if (fuzzyMatch(fieldText, searchTerm)) {
				const fuzzyScore = calculateFuzzyScore(fieldText, searchTerm)
				score += field.weight * fuzzyScore
			}
		})

		// Bonus for recent transactions
		const daysSinceTransaction = Math.floor(
			(Date.now() - transactionDate.getTime()) / (1000 * 60 * 60 * 24),
		)
		if (daysSinceTransaction < 7) {
			score += 5
		} else if (daysSinceTransaction < 30) {
			score += 2
		}

		return score
	}

	// Calculate fuzzy match score (0-10)
	function calculateFuzzyScore(str: string, pattern: string): number {
		const strLower = str.toLowerCase()
		const patternLower = pattern.toLowerCase()

		let matches = 0
		let patternIndex = 0

		for (let i = 0; i < strLower.length && patternIndex < patternLower.length; i++) {
			if (strLower[i] === patternLower[patternIndex]) {
				matches++
				patternIndex++
			}
		}

		const matchRatio = matches / patternLower.length
		const lengthPenalty =
			Math.abs(strLower.length - patternLower.length) /
			Math.max(strLower.length, patternLower.length)

		return Math.max(0, matchRatio * 10 - lengthPenalty * 5)
	}

	// Get filtered and sorted transactions
	let filteredTransactions = $derived(
		data.Transactions.filter((item) => matchesSearch(item, searchQuery))
			.map((item) => ({
				...item,
				relevanceScore: calculateRelevanceScore(item, searchQuery),
			}))
			.sort((a, b) => {
				if (searchQuery.trim()) {
					// Sort by relevance score when searching
					return b.relevanceScore - a.relevanceScore
				} else {
					// Sort by date when not searching (newest first)
					return (
						new Date(b.transaction.createdAt).getTime() -
						new Date(a.transaction.createdAt).getTime()
					)
				}
			}),
	)

	// Helper functions for date matching
	function isToday(date: Date): boolean {
		const today = new Date()
		return date.toDateString() === today.toDateString()
	}

	function isYesterday(date: Date): boolean {
		const yesterday = new Date()
		yesterday.setDate(yesterday.getDate() - 1)
		return date.toDateString() === yesterday.toDateString()
	}

	function isThisWeek(date: Date): boolean {
		const today = new Date()
		const startOfWeek = new Date(today)
		startOfWeek.setDate(today.getDate() - today.getDay())
		return date >= startOfWeek && date <= today
	}

	function isThisMonth(date: Date): boolean {
		const today = new Date()
		return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()
	}
</script>

<svelte:head>
    <title>Transactions</title>
    <meta name="description" content="View and search your transaction history." />
</svelte:head>

<div
	class="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-green-50 to-purple-50 pb-20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
>
	<Elements />

	<div class="relative z-10 space-y-8 px-4 py-6">
        <div>
            <h1
                class="text-4xl font-sensation text-gray-800 dark:text-white sm:text-5xl md:text-6xl"
            >
                transactions
            </h1>
        </div>

		{#each filteredTransactions as { transaction, canteen }, index (transaction.id)}
			<div
				class="group m-0 border-b px-2 py-6 backdrop-blur-sm"
				style="animation-delay: {index * 50}ms; animation-fill-mode: backwards;"
			>
				<div class="flex items-center justify-between">
					<div class="flex-1">
						<p class="font-medium text-gray-800 dark:text-white">
							{canteen?.name || 'Unknown Canteen'}
						</p>
						<p class="text-sm text-gray-600 dark:text-gray-400">
							{transaction.reference || 'No reference'}
						</p>
						<p class="text-xs text-gray-500">
							{new Date(transaction.createdAt).toLocaleDateString('en-IN', {
								year: 'numeric',
								month: 'short',
								day: 'numeric',
								hour: '2-digit',
								minute: '2-digit',
							})}
						</p>
					</div>
					<div class="text-right">
						<p
							class="font-bold {parseFloat(transaction.amount) > 0
								? 'text-green-600'
								: 'text-red-700'}"
						>
							{formatPrice(Math.abs(parseFloat(transaction.amount)))}
						</p>
					</div>
				</div>
			</div>
		{/each}
	</div>

	<!-- Floating Search Button/Bar -->
    <div class="fixed right-3 bottom-20 z-50">
        <div class="flex items-center">
            {#if isSearchOpen}
                <input
                    class="h-12 w-64 rounded-l-full border border-gray-200 bg-white/90 px-4 text-sm text-gray-700 shadow-lg backdrop-blur-sm transition-all duration-500 ease-out focus:ring-0 dark:border-gray-600 dark:bg-gray-800/90 dark:text-gray-200 dark:focus:ring-green-400 animate-in slide-in-from-right-2 fade-in-0 duration-500"
                    placeholder="Search transactions..."
                    bind:value={searchQuery}
                />
            {/if}
            <button
                onclick={toggleSearch}
                class="flex h-12 w-12 items-center justify-center {isSearchOpen
                    ? 'rounded-r-full'
                    : 'rounded-full'} bg-green-700 shadow-lg transition-all duration-500 ease-out"
            >
                <div
                    class="transition-transform duration-500 ease-out {isSearchOpen
                        ? 'rotate-90'
                        : 'rotate-0'}"
                >
                    {#if isSearchOpen}
                        <X size={24} color="white" />
                    {:else}
                        <Search size={24} color="white" />
                    {/if}
                </div>
            </button>
        </div>
    </div>
</div>