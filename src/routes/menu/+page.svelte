<script lang="ts">
	import { Button } from 'bits-ui'
	import { Clock, ChefHat, ArrowRight } from 'lucide-svelte'
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

	<div class="relative z-10 space-y-8 px-4 py-6">
		<div class="relative z-10 space-y-8">
			<h1
				class="mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent"
			>
				Menu
			</h1>
		</div>

		<div class="mx-auto max-w-6xl">
			{#if data.canteens && data.canteens.length > 0}
				<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{#each data.canteens as canteen}
						<div
							class="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-xl dark:border-gray-700 dark:bg-gray-800"
						>
							<div class="p-6 pb-4">
								<div class="mb-4 flex items-start justify-between">
									<div class="flex items-center gap-4">
										<div class="text-3xl">
											<img src={canteen.image} alt={canteen.name} class="h-12 w-12 rounded" />
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
								</div>

								{#if canteen.description}
									<p
										class="mb-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-300"
									>
										{canteen.description}
									</p>
								{/if}
							</div>

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
