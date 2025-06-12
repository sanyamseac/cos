<script lang="ts">
	import { Button } from 'bits-ui'
	import { Clock, ChefHat, ArrowRight } from 'lucide-svelte'
	import type { PageData } from './$types'
	import {} from /* enhance */ '$app/forms'
	import { goto } from '$app/navigation'

	let { data }: { data: PageData } = $props()

	// Function to get canteen status badge
	function getStatusBadge(isOpen: boolean) {
		return isOpen
			? {
					text: 'Open',
					class: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
				}
			: { text: 'Closed', class: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' }
	}

	// Function to get canteen emoji/icon based on name
	function getCanteenEmoji(name: string) {
		const lowerName = name.toLowerCase()
		if (lowerName.includes('cafeteria') || lowerName.includes('main')) return '🍽️'
		if (lowerName.includes('coffee') || lowerName.includes('cafe')) return '☕'
		if (lowerName.includes('italian')) return '🍝'
		if (lowerName.includes('asian')) return '🍜'
		if (lowerName.includes('health') || lowerName.includes('salad')) return '🥗'
		if (lowerName.includes('dessert') || lowerName.includes('sweet')) return '🧁'
		if (lowerName.includes('juice') || lowerName.includes('drink')) return '🥤'
		return '🍴'
	}
</script>

<svelte:head>
	<title>Browse Canteens - IIIT Canteen Ordering System</title>
	<meta
		name="description"
		content="Browse all available canteens and explore their menus at IIIT."
	/>
</svelte:head>

<div
	class="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
>
	<!-- Decorative background elements -->
	<div class="absolute inset-0 opacity-20">
		<div
			class="absolute top-10 left-10 h-32 w-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 blur-3xl"
		></div>
		<div
			class="absolute top-1/3 right-20 h-48 w-48 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 blur-3xl"
		></div>
		<div
			class="absolute bottom-20 left-1/4 h-40 w-40 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 blur-3xl"
		></div>
	</div>

	<div class="relative z-10 space-y-8 p-6">
		<!-- Header Section -->
		<div class="space-y-4 text-center">
			<h1
				class="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent md:text-5xl"
			>
				Browse Canteens
			</h1>
			<p class="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
				Discover delicious meals from our campus canteens. Each location offers unique
				specialties and fresh ingredients.
			</p>
		</div>

		<!-- Canteens Grid -->
		<div class="mx-auto max-w-6xl">
			{#if data.canteens && data.canteens.length > 0}
				<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{#each data.canteens as canteen}
						{@const status = getStatusBadge(canteen.open)}
						<div
							class="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-xl dark:border-gray-700 dark:bg-gray-800"
						>
							<!-- Canteen Header -->
							<div class="p-6 pb-4">
								<div class="mb-4 flex items-start justify-between">
									<div class="flex items-center gap-3">
										<div class="text-3xl">{getCanteenEmoji(canteen.name)}</div>
										<div>
											<h3
												class="text-xl font-bold text-gray-900 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400"
											>
												{canteen.name}
											</h3>
											<span
												class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {status.class}"
											>
												{status.text}
											</span>
										</div>
									</div>
								</div>

								<!-- Description -->
								{#if canteen.description}
									<p
										class="mb-4 line-clamp-2 text-sm text-gray-600 dark:text-gray-300"
									>
										{canteen.description}
									</p>
								{/if}

								<!-- Timings -->
								<div
									class="mb-4 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400"
								>
									<Clock size={16} />
									<span>{canteen.timings}</span>
								</div>
							</div>

							<!-- Action Button -->
							<div class="px-6 pb-6">
								<Button.Root
									class="group/btn w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3 font-semibold text-white transition-all duration-300 hover:from-indigo-600 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
									disabled={!canteen.open}
									onclick={() => goto(`/menu/${canteen.acronym}`)}
								>
									<div class="flex items-center justify-center gap-2">
										<span
											>{canteen.open ? 'View Menu' : 'Currently Closed'}</span
										>
										{#if canteen.open}
											<ArrowRight
												size={16}
												class="transition-transform group-hover/btn:translate-x-1"
											/>
										{/if}
									</div>
								</Button.Root>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<!-- Empty State -->
				<div class="py-16 text-center">
					<div
						class="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800"
					>
						<ChefHat size={32} class="text-gray-400" />
					</div>
					<h3 class="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
						No Canteens Available
					</h3>
					<p class="mx-auto max-w-md text-gray-500 dark:text-gray-400">
						There are currently no canteens available. Please check back later or
						contact support if this seems like an error.
					</p>
				</div>
			{/if}
		</div>
	</div>
</div>
