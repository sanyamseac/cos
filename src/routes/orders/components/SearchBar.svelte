<script lang="ts">
	import { formatPrice } from "$lib/utils/priceUtils"
	import { Search, X } from "lucide-svelte"


    let { orders, filteredOrders=$bindable() } = $props<{ orders: any[], filterOrders?: (orders: any[]) => any[] }>()
    let isSearchOpen = $state(false)
	let searchQuery = $state('')

	$effect(() => {
		if (searchQuery.trim() === '') {
			filteredOrders = orders
		} else {
			filteredOrders = searchOrders(orders, searchQuery)
		}
	})

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('en-IN', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		})
	}

	function calculateFieldScore(fieldValue: string, query: string, isExactField: boolean = false): number {
		if (!fieldValue) return 0
		
		const field = fieldValue.toLowerCase()
		const searchTerm = query.toLowerCase()
		
		if (field === searchTerm) return isExactField ? 1000 : 500
		if (field.startsWith(searchTerm)) return isExactField ? 800 : 400
		if (field.includes(searchTerm)) return isExactField ? 600 : 300
		if (searchTerm.length >= 3) {
			const words = field.split(/\s+/)
			for (const word of words) {
				if (word.startsWith(searchTerm)) return isExactField ? 400 : 200
				if (word.includes(searchTerm)) return isExactField ? 200 : 100
			}
		}
		
		return 0
	}

	function getDateFormats(dateString: string): string[] {
		const date = new Date(dateString)
		const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
		const fullMonths = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
		
		return [
			formatDate(dateString),
			months[date.getMonth()],
			fullMonths[date.getMonth()],
			date.getFullYear().toString(),
			date.getDate().toString(),
			date.toDateString(),
			date.toISOString().split('T')[0],
			`${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`,
			`${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`,
			...(isToday(date) ? ['today'] : []),
			...(isYesterday(date) ? ['yesterday'] : [])
		]
	}

	function isToday(date: Date): boolean {
		const today = new Date()
		return date.toDateString() === today.toDateString()
	}

	function isYesterday(date: Date): boolean {
		const yesterday = new Date()
		yesterday.setDate(yesterday.getDate() - 1)
		return date.toDateString() === yesterday.toDateString()
	}

	function searchOrders(allOrders: any[], query: string) {
		if (!query.trim()) return allOrders
		
		const searchQuery = query.trim()
		const results: Array<{ order: any, score: number }> = []
		
		for (const orderData of allOrders) {
			const { order, canteen } = orderData
			let totalScore = 0
			
			const orderNumberScore = calculateFieldScore(order.orderNumber?.toString() || '', searchQuery, true)
			totalScore += orderNumberScore
			
			const statusScore = calculateFieldScore(order.status || '', searchQuery, true)
			totalScore += statusScore
			
			const amountScore = calculateFieldScore(order.totalAmount?.toString() || '', searchQuery, true)
			totalScore += amountScore
			
			const formattedPrice = formatPrice(order.totalAmount).replace(/[₹,\s]/g, '')
			const priceScore = calculateFieldScore(formattedPrice, searchQuery.replace(/[₹,\s]/g, ''), true)
			totalScore += priceScore
			
			const canteenScore = calculateFieldScore(canteen?.name || '', searchQuery)
			totalScore += canteenScore
			
			const dateFormats = getDateFormats(order.createdAt.toString())
			let maxDateScore = 0
			for (const dateFormat of dateFormats) {
				const dateScore = calculateFieldScore(dateFormat, searchQuery)
				maxDateScore = Math.max(maxDateScore, dateScore)
			}
			totalScore += maxDateScore
			
			if (totalScore > 0) {
				results.push({ order: orderData, score: totalScore })
			}
		}
		
		return results
			.sort((a, b) => {
				if (b.score !== a.score) return b.score - a.score
				return new Date(b.order.order.createdAt).getTime() - new Date(a.order.order.createdAt).getTime()
			})
			.map(result => result.order)
	}

	function toggleSearch() {
		isSearchOpen = !isSearchOpen
		if (!isSearchOpen) {
			searchQuery = ''
		}
	}

	let searchInputElement: HTMLInputElement
	$effect(() => {
		if (isSearchOpen && searchInputElement) {
			setTimeout(() => searchInputElement.focus(), 100)
		}
	})
</script>

<div class="fixed right-3 bottom-20 z-50">					
    <div class="flex items-center">
        {#if isSearchOpen}
            <input
                bind:this={searchInputElement}
                class="h-12 w-64 rounded-l-full border border-gray-200 bg-white/90 px-4 text-sm text-gray-700 shadow-lg backdrop-blur-sm transition-all duration-500 ease-out focus:ring-0 dark:border-gray-600 dark:bg-gray-800/90 dark:text-gray-200 dark:focus:ring-green-400 animate-in slide-in-from-right-2 fade-in-0 duration-500"
                placeholder="Search orders..."
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