<script lang="ts">
	import { Button, Dialog } from 'bits-ui'
	import { Minus, Plus, X as Close, ShoppingCart } from 'lucide-svelte'

	// Define props
	export let item: any
	export let onAddToCart: (item: any) => void
	export let addingToCart: boolean = false
	export let getFoodTypeIcon: (type: string) => string

	// Format price calculations
	$: basePrice = Number(item.price)

	$: variantPrice = item.selectedVariant ? Number(item.selectedVariant.price) : 0

	$: addonsPrice =
		item.selectedAddons.length > 0
			? item.selectedAddons.reduce((sum: number, addon: any) => sum + Number(addon.price), 0)
			: 0

	$: totalPrice = (basePrice + variantPrice + addonsPrice) * item.quantity
	$: formattedTotalPrice = totalPrice.toFixed(2)

	// Handle variant selection
	function selectVariant(variant: any) {
		item.selectedVariant = variant
	}

	// Handle addon toggle
	function toggleAddon(addon: any) {
		const index = item.selectedAddons.findIndex((a: any) => a.id === addon.id)
		if (index >= 0) {
			// Remove addon
			item.selectedAddons = [
				...item.selectedAddons.slice(0, index),
				...item.selectedAddons.slice(index + 1),
			]
		} else {
			// Add addon
			item.selectedAddons = [...item.selectedAddons, addon]
		}
	}

	// Check if addon is selected
	function isAddonSelected(addon: any) {
		return item.selectedAddons.some((a: any) => a.id === addon.id)
	}

	// Quantity functions
	function increaseQuantity() {
		if (item.quantity < 10) {
			item.quantity += 1
		}
	}

	function decreaseQuantity() {
		if (item.quantity > 1) {
			item.quantity -= 1
		}
	}
</script>

<!-- Item Details Dialog Content -->
<div class="relative">
	<!-- Close button -->
	<Dialog.Close
		class="absolute top-0 right-0 flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
	>
		<Close size={18} />
	</Dialog.Close>

	<Dialog.Title class="pr-8 text-2xl font-bold text-gray-900 dark:text-white">
		<span class="mr-1">{getFoodTypeIcon(item.type)}</span>
		{item.name}
	</Dialog.Title>

	{#if item.description}
		<Dialog.Description class="mt-2 text-gray-600 dark:text-gray-300">
			{item.description}
		</Dialog.Description>
	{/if}

	<div class="mt-6 space-y-6">
		<!-- Variants selection (if any) -->
		{#if item.variants && item.variants.length > 0}
			<div>
				<h3 class="mb-3 text-lg font-medium text-gray-900 dark:text-white">
					Choose Variant
				</h3>
				<div class="space-y-2">
					{#each item.variants as variant}
						<label
							class="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
						>
							<div class="flex items-center gap-2">
								<input
									type="radio"
									name="variant"
									value={variant.id}
									checked={item.selectedVariant?.id === variant.id}
									on:change={() => selectVariant(variant)}
									class="h-4 w-4 accent-indigo-600"
								/>
								<span class="text-gray-900 dark:text-white">
									{variant.name}
								</span>
							</div>
							<span class="font-medium text-gray-900 dark:text-white">
								₹{Number(variant.price).toFixed(2)}
							</span>
						</label>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Addons selection (if any) -->
		{#if item.addons && item.addons.length > 0}
			<div>
				<h3 class="mb-3 text-lg font-medium text-gray-900 dark:text-white">Add Extra</h3>
				<div class="space-y-2">
					{#each item.addons as addon}
						<label
							class="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
						>
							<div class="flex items-center gap-2">
								<input
									type="checkbox"
									checked={isAddonSelected(addon)}
									on:change={() => toggleAddon(addon)}
									class="h-4 w-4 accent-indigo-600"
								/>
								<span class="mr-1">{getFoodTypeIcon(addon.type)}</span>
								<span class="text-gray-900 dark:text-white">
									{addon.name}
								</span>
							</div>
							<span class="font-medium text-gray-900 dark:text-white">
								+₹{Number(addon.price).toFixed(2)}
							</span>
						</label>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Quantity selector -->
		<div class="mt-6">
			<div class="flex items-center justify-between">
				<span class="text-lg font-medium text-gray-900 dark:text-white">Quantity</span>
				<div class="flex items-center gap-3">
					<Button.Root
						class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition-all hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
						onclick={decreaseQuantity}
						disabled={item.quantity <= 1}
					>
						<Minus size={14} />
					</Button.Root>

					<span class="w-6 text-center text-lg font-medium text-gray-900 dark:text-white"
						>{item.quantity}</span
					>

					<Button.Root
						class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition-all hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
						onclick={increaseQuantity}
						disabled={item.quantity >= 10}
					>
						<Plus size={14} />
					</Button.Root>
				</div>
			</div>
		</div>

		<!-- Add to Cart button and total -->
		<div class="mt-6 flex flex-col gap-4 pt-4">
			<div
				class="flex items-center justify-between text-lg font-bold text-gray-900 dark:text-white"
			>
				<span>Total Price:</span>
				<span>₹{formattedTotalPrice}</span>
			</div>

			<Button.Root
				class="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-3 font-medium text-white shadow-sm transition-all hover:bg-indigo-700 disabled:opacity-70"
				onclick={() => onAddToCart(item)}
				disabled={addingToCart}
			>
				{#if addingToCart}
					<div
						class="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"
					></div>
					Adding...
				{:else}
					<ShoppingCart size={18} />
					Add to Cart
				{/if}
			</Button.Root>
		</div>
	</div>
</div>
