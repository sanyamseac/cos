<script lang="ts">
	import { Button } from 'bits-ui'
	import { Minus, Plus, Trash2, User } from 'lucide-svelte'
	import { enhance } from '$app/forms'
	import { getFoodTypeIcon } from '$lib/utils/foodTypeUtils'
	import { calculateBasketItemTotal, formatPrice } from '$lib/utils/priceUtils'

	let {
		item,
		showAddedBy = false,
	}: {
		item: any
		showAddedBy?: boolean
	} = $props()

	const itemTotal = $derived(calculateBasketItemTotal(item))
	const canEdit = $derived(item.canEdit !== false) // Default to true for backward compatibility
</script>

<div class="flex items-start gap-4 rounded-lg border border-gray-100 p-4 dark:border-gray-700">
	<div class="flex-1">
		<!-- Item Name and Type -->
		<div class="mb-2 flex items-center gap-2">
			<span class="text-sm">
				{item.menuItem ? getFoodTypeIcon(item.menuItem.type) : ''}
			</span>
			<h3 class="font-medium text-gray-900 dark:text-white">
				{item.menuItem?.name || 'Unknown Item'}
			</h3>
			{#if showAddedBy && item.addedByUser}
				<div class="flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-900/30 px-2 py-1">
					<User size={12} class="text-blue-600 dark:text-blue-400" />
					<span class="text-xs text-blue-700 dark:text-blue-300">{item.addedByUser.name}</span>
				</div>
			{/if}
			{#if !canEdit}
				<span class="rounded bg-gray-100 dark:bg-gray-700 px-2 py-1 text-xs text-gray-600 dark:text-gray-400">
					Read only
				</span>
			{/if}
		</div>

		<!-- Variant -->
		{#if item.variant}
			<p class="text-sm text-gray-600 dark:text-gray-300">
				Variant: {item.variant.name} (+{formatPrice(item.variant.price)})
			</p>
		{/if}

		<!-- Addons -->
		{#if item.addons.length > 0}
			<p class="text-sm text-gray-600 dark:text-gray-300">
				Add-ons: {item.addons
					.map((addon) => `${addon.name} (+${formatPrice(addon.price)})`)
					.join(', ')}
			</p>
		{/if}

		<!-- Price breakdown -->
		<div class="mt-2 text-sm text-gray-600 dark:text-gray-300">
			<div>
				Base: {item.menuItem ? formatPrice(item.menuItem.price) : formatPrice(0)}
			</div>
			{#if item.variant}
				<div>Variant: +{formatPrice(item.variant.price)}</div>
			{/if}
			{#if item.addons.length > 0}
				<div>
					Add-ons: +{formatPrice(
						item.addons.reduce((sum, addon) => sum + Number(addon.price), 0),
					)}
				</div>
			{/if}
		</div>
	</div>

	<div class="flex flex-col items-end gap-2">
		<!-- Item Total -->
		<div class="font-medium text-gray-900 dark:text-white">
			{formatPrice(itemTotal)}
		</div>

		<!-- Quantity Controls -->
		<div class="flex items-center gap-2">
			<form method="POST" action="?/updateQuantity" use:enhance>
				<input type="hidden" name="basketItemId" value={item.id} />
				<input type="hidden" name="quantity" value={item.quantity - 1} />
				<Button.Root
					type="submit"
					class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition-all hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
					disabled={item.quantity <= 1 || !canEdit}
				>
					<Minus size={14} />
				</Button.Root>
			</form>

			<span class="w-8 text-center text-sm font-medium text-gray-900 dark:text-white">
				{item.quantity}
			</span>

			<form method="POST" action="?/updateQuantity" use:enhance>
				<input type="hidden" name="basketItemId" value={item.id} />
				<input type="hidden" name="quantity" value={item.quantity + 1} />
				<Button.Root
					type="submit"
					class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition-all hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
					disabled={item.quantity >= 10 || !canEdit}
				>
					<Plus size={14} />
				</Button.Root>
			</form>
		</div>

		<!-- Remove Item -->
		{#if canEdit}
			<form method="POST" action="?/removeItem" use:enhance>
				<input type="hidden" name="basketItemId" value={item.id} />
				<Button.Root
					type="submit"
					class="flex items-center gap-1 rounded-lg bg-red-100 px-2 py-1 text-xs text-red-600 transition-all hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
				>
					<Trash2 size={12} />
					Remove
				</Button.Root>
			</form>
		{/if}
	</div>
</div>
