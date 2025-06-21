<script lang="ts">
	import { Button } from 'bits-ui'
	import { Ban, Plus, ShoppingBasket } from 'lucide-svelte'
	import BadgeRoot from '$lib/components/Badge.svelte'
	import FoodType from '$lib/components/FoodType.svelte'
	import { formatPrice } from '$lib/utils/priceUtils'

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
	class="group overflow-hidden rounded-xl border shadow-lg transition-all duration-300 hover:shadow-xl dark:border-gray-700"
>
	<div class="flex items-center justify-between gap-3 p-4">
		<img src={item.image} alt={item.name} class="h-12 w-12 rounded md:h-10 md:w-10" />
		<div class="min-w-0 flex-1">
			<div class="mb-1 flex items-center gap-2 sm:mb-2">
				<h3 class="truncate text-base font-medium text-gray-900 sm:text-lg dark:text-white">
					{item.name}
				</h3>
			</div>

			{#if item.description}
				<p class="mb-2 line-clamp-2 text-sm text-gray-600 sm:mb-3 dark:text-gray-300">
					{item.description}
				</p>
			{/if}

			<div class="flex text-base font-medium text-gray-700 sm:text-lg dark:text-gray-300">
				{formatPrice(item.price)} | <FoodType type={item.type} size={20} class="ml-2" />
			</div>
		</div>

		<Button.Root
			class="flex h-14 w-14 flex-shrink-0 items-center justify-center self-center rounded-full bg-indigo-100 text-indigo-600 transition-all hover:bg-indigo-200 sm:h-8 sm:w-8 dark:bg-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-800"
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
						class="absolute -right-0 -bottom-1 rounded-full bg-indigo-600 p-0.5 text-white dark:bg-indigo-400"
					/>
				{:else}
					<Ban
						size={16}
						class="absolute -right-0 -bottom-1 rounded-full bg-indigo-600 p-0.5 text-white dark:bg-indigo-400"
					/>
				{/if}
			</div>
		</Button.Root>
	</div>
</div>
