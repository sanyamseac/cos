<script lang="ts">
	import { Button } from 'bits-ui'
	import { Ban, Plus, ShoppingBasket } from 'lucide-svelte'
	import BadgeRoot from '$lib/components/Badge.svelte'
	import FoodType from '$lib/components/FoodType.svelte'
	import { formatPrice } from '$lib/utils/priceUtils'

	const Badge = { Root: BadgeRoot }

	let {
		item,
		onItemClick
	}: {
		item: any
		onItemClick: (item: any) => void
	} = $props()
</script>

<div
	class="group overflow-hidden rounded-lg border border-gray-100 shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-700 bg-white dark:bg-gray-800"
>
	<div class="p-3 sm:p-4 flex items-center justify-between gap-3">
		<img src={item.image} alt={item.name} class="h-12 w-12 md:h-10 md:w-10 rounded" />
		<div class="flex-1 min-w-0">
			<div class="mb-1 sm:mb-2 flex items-center gap-2">
				<h3 class="text-base sm:text-lg font-medium text-gray-900 dark:text-white truncate">
					{item.name}
				</h3>
			</div>

			{#if item.description}
				<p class="mb-2 sm:mb-3 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
					{item.description}
				</p>
			{/if}

			<div class="flex text-base sm:text-lg font-medium text-gray-700 dark:text-gray-300">
				{formatPrice(item.price)} | <FoodType type={item.type} size={20} class="ml-2"/>
			</div>
		</div>

		<Button.Root
			class="flex h-14 w-14 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 transition-all hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-800 flex-shrink-0 self-center"
			onclick={(event: Event) => {
				event.stopPropagation()
				onItemClick(item)
			}}
			title="Add to cart"
			disabled={!item.available}
		>
			<div class="relative">
				<ShoppingBasket size={30} />
				{#if item.available}
					<Plus
						size={16}
						class="absolute -bottom-1 -right-0 bg-indigo-600 text-white rounded-full p-0.5 dark:bg-indigo-400"
					/>
				{:else}
					<Ban
						size={16}
						class="absolute -bottom-1 -right-0 bg-indigo-600 text-white rounded-full p-0.5 dark:bg-indigo-400"
					/>
				{/if}
			</div>
		</Button.Root>
	</div>
</div>
