<script lang="ts">
	import { Button } from 'bits-ui'
	import { Minus, Plus, Trash2, User } from 'lucide-svelte'
	import { enhance } from '$app/forms'
	import { calculateBasketItemTotal, formatPrice } from '$lib/utils/priceUtils'
	import FoodType from '$lib/components/FoodType.svelte'

	let {
		item,
		showAddedBy = false,
	}: {
		item: any
		showAddedBy?: boolean
	} = $props()

	const itemTotal = $derived(calculateBasketItemTotal(item))
	const canEdit = $derived(item.canEdit !== false)
</script>

<div
	class="border-b border-gray-500 p-4"
>
	<div class="mb-3 flex items-start justify-between gap-4">
		<div class="flex items-start gap-2">
			<img
				src={item.menuItem?.image || '/default-item.png'}
				alt={item.menuItem?.name || 'Unknown Item'}
				class="h-12 w-12 rounded"
			/>
			<div class="min-w-0 flex-1">
				<div class="mb-1 flex items-center gap-2">
					<h3
						class="ml-1 truncate text-base font-semibold text-gray-900 sm:text-lg dark:text-white"
					>
						{item.menuItem?.name || 'Unknown Item'}
						{#if item.menuItem?.available === false}
							<span class="text-xs text-red-500 dark:text-red-400">Unavailable</span>
						{/if}
					</h3>
					<FoodType type={item.menuItem.type} size={16} />
				</div>

				{#if showAddedBy && item.addedByUser}
					<div
						class="mb-2 flex w-max items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 dark:bg-blue-900/30"
					>
						<User size={10} class="text-blue-600 dark:text-blue-400" />
						<span class="text-xs text-blue-700 dark:text-blue-300"
							>{item.addedByUser?.name || 'Unknown User'}</span
						>
					</div>
				{/if}
			</div>
		</div>

		<div class="flex-shrink-0 text-right">
			<div class="text-lg font-bold text-gray-900 dark:text-white">
				{formatPrice(itemTotal)}
			</div>
			<div class="text-xs text-gray-500 dark:text-gray-400">
				{item.quantity} × {formatPrice(itemTotal / item.quantity)}
			</div>
		</div>
	</div>

	<div class="mb-4 space-y-2">
		{#if item.variant}
			<div class="flex items-center justify-between text-sm">
				<div class="flex items-center gap-2">
				<span class="text-gray-600 dark:text-gray-300">{item.variant.name}</span>
				{#if item.variant.available === false}
					<span class="text-xs text-red-500 dark:text-red-400">Unavailable</span>
				{/if}
				</div>
				<span class="font-medium text-gray-900 dark:text-white">
					{formatPrice(Number(item.menuItem.price) + Number(item.variant.price))}
				</span>
			</div>
		{/if}

		{#if item.addons.length > 0}
			<div class="text-sm">
				<span class="mb-1 block text-gray-600 dark:text-gray-300">Add-ons:</span>
				<div class="space-y-1 border-l-2 border-gray-200 pl-2 dark:border-gray-600">
					{#each item.addons as addon}
						<div class="flex items-center justify-between">
							<div>
								<span class="text-gray-700 dark:text-gray-300">{addon.name}</span>
								{#if addon.available === false}
									<span class="text-xs text-red-500 dark:text-red-400">Unavailable</span>
								{/if}
								<FoodType type={addon.type} size={10} class="inline" />
							</div>
							<span class="font-medium text-gray-900 dark:text-white">
								{formatPrice(addon.price)}
							</span>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>

	<div
		class="flex items-center justify-between gap-4 pt-3"
	>
		<div class="flex items-center gap-3">
			<span class="text-sm text-gray-600 dark:text-gray-300">Quantity:</span>
			<div class="flex items-center gap-2">
				<form method="POST" action="?/updateQuantity" use:enhance>
					<input type="hidden" name="basketItemId" value={item.id} />
					<input type="hidden" name="quantity" value={item.quantity - 1} />
					<Button.Root
						type="submit"
						class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-700 transition-all hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
						disabled={item.quantity <= 1 || !canEdit}
					>
						<Minus size={14} />
					</Button.Root>
				</form>

				<span class="w-8 text-center text-sm font-semibold text-gray-900 dark:text-white">
					{item.quantity}
				</span>

				<form method="POST" action="?/updateQuantity" use:enhance>
					<input type="hidden" name="basketItemId" value={item.id} />
					<input type="hidden" name="quantity" value={item.quantity + 1} />
					<Button.Root
						type="submit"
						class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-700 transition-all hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
						disabled={item.quantity >= 10 || !canEdit}
					>
						<Plus size={14} />
					</Button.Root>
				</form>
			</div>
		</div>

		{#if canEdit}
			<form method="POST" action="?/removeItem" use:enhance>
				<input type="hidden" name="basketItemId" value={item.id} />
				<Button.Root
					type="submit"
					class="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
				>
					<Trash2 size={14} />
					<span class="rs:inline hidden">Remove</span>
				</Button.Root>
			</form>
		{/if}
	</div>
</div>
