<script lang="ts">
	import { Clock, ChefHat } from 'lucide-svelte'
	import type { PageData } from './$types'
	import { goto } from '$app/navigation'
	import Elements from '$lib/components/Elements.svelte'

	let { data }: { data: PageData } = $props()
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
	<Elements />

	<div class="relative z-10 space-y-4 px-4 py-6 md:px-8 md:py-10">
		<div>
			<h1
				class="font-sensation text-4xl text-gray-800 sm:text-5xl md:text-6xl dark:text-white"
			>
				menu
			</h1>
		</div>

		{#if data.canteens && data.canteens.length > 0}
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
				{#each data.canteens as canteen}
					<div
						class="group cursor-pointer overflow-hidden rounded-xl border shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl dark:border-gray-700"
						onclick={() => canteen.open && goto(`/menu/${canteen.acronym}`)}
					>
						<div class="flex items-center justify-between gap-3 p-4">
							<div class="flex items-center gap-4">
								<div class="text-3xl">
									<img
										src={canteen.image}
										alt={canteen.name}
										class="h-12 w-12 rounded"
									/>
								</div>
								<div>
									<h3
										class="text-xl font-bold text-gray-900 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400"
									>
										{canteen.name}
									</h3>
									<div
										class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400"
									>
										<Clock size={14} />
										<span>{canteen.timings}</span>
									</div>
								</div>
							</div>
							<div
								class="flex items-center gap-2 text-sm {canteen.open
									? 'text-green-600 dark:text-green-400'
									: 'text-red-600 dark:text-red-400'}"
							>
								<ChefHat size={16} />
								<span>{canteen.open ? 'Open Now' : 'Currently Closed'}</span>
							</div>
						</div>

						{#if canteen.description}
							<div class="px-4 pb-4">
								<p class="line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
									{canteen.description}
								</p>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{:else}
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
					There are currently no canteens available. Please check back later or contact
					support if this seems like an error.
				</p>
			</div>
		{/if}
	</div>
</div>
