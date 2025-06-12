<script lang="ts">
	import { Button } from 'bits-ui'
	import { Plus } from 'lucide-svelte'
	import BadgeRoot from '$lib/components/Badge.svelte'
	import { getFoodTypeIcon } from '$lib/utils/foodTypeUtils'
	import { formatPrice } from '$lib/utils/priceUtils'

	// Create Badge object to match the existing usage pattern
	const Badge = { Root: BadgeRoot }

	let {
		item,
		onItemClick,
	}: {
		item: any
		onItemClick: (item: any) => void
	} = $props()
</script>

<div
	class="group overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
>
	<div class="p-4">
		<!-- Item header with food type and name -->
		<div class="mb-2 flex items-start justify-between">
			<div class="flex-1">
				<div class="mb-1 flex items-center gap-2">
					<span class="mr-1 inline-block" title={item.type}>
						{getFoodTypeIcon(item.type)}
					</span>
					<h3 class="text-lg font-medium text-gray-900 dark:text-white">
						{item.name}
					</h3>
					<!-- Status badges -->
					{#if !item.available}
						<Badge.Root
							class="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
						>
							Unavailable
						</Badge.Root>
					{:else if !item.active}
						<Badge.Root
							class="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
						>
							Inactive
						</Badge.Root>
					{:else}
						<Badge.Root
							class="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
						>
							Available
						</Badge.Root>
					{/if}
				</div>
			</div>

			<!-- Add to Cart Button -->
			<Button.Root
				class="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 transition-all hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-800"
				onclick={(event: Event) => {
					event.stopPropagation()
					onItemClick(item)
				}}
				title="Add to cart"
			>
				<Plus size={16} />
			</Button.Root>
		</div>

		<!-- Item description -->
		{#if item.description}
			<p class="mb-3 text-sm text-gray-600 dark:text-gray-300">
				{item.description}
			</p>
		{/if}

		<!-- Price -->
		<div class="font-medium text-gray-900 dark:text-white">
			{formatPrice(item.price)}
		</div>
	</div>
</div>
