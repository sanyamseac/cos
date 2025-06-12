<script lang="ts">
	import MenuItemCard from './MenuItemCard.svelte'

	let {
		category,
		items,
		onItemClick,
	}: {
		category: string
		items: any[]
		onItemClick: (item: any) => void
	} = $props()

	// Filter only active and available items
	const availableItems = $derived(items.filter((item) => item.active && item.available))
</script>

{#if availableItems.length > 0}
	<div>
		<div class="mb-4">
			<h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200">
				{category}
			</h2>
		</div>

		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each availableItems as item}
				<MenuItemCard {item} {onItemClick} />
			{/each}
		</div>
	</div>
{/if}
