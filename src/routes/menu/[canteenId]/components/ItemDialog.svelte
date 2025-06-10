<script lang="ts">
	import { Button, Dialog, RadioGroup, Checkbox } from 'bits-ui'
	import { Minus, Plus, X as Close, ShoppingCart } from 'lucide-svelte'
	import { enhance } from '$app/forms'

	let {
		item,
		addingToCart,
		getFoodTypeIcon,
		onClose,
	}: {
		item: any
		addingToCart?: boolean
		getFoodTypeIcon: (type: string) => string
		onClose: () => void
	} = $props()

	let submitting = $state(false)

	// Format price calculations using $derived
	const basePrice = $derived(Number(item.price))
	const variantPrice = $derived(item.selectedVariant ? Number(item.selectedVariant.price) : 0)
	const addonsPrice = $derived(
		item.selectedAddons.length > 0
			? item.selectedAddons.reduce((sum: number, addon: any) => sum + Number(addon.price), 0)
			: 0,
	)
	const totalPrice = $derived((basePrice + variantPrice + addonsPrice) * item.quantity)
	const formattedTotalPrice = $derived(totalPrice.toFixed(2))

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
				<RadioGroup.Root
					class="space-y-2"
					value={item.selectedVariant?.id?.toString()}
					onValueChange={(value) => {
						if (value) {
							const variant = item.variants.find(
								(v: any) => v.id.toString() === value,
							)
							if (variant) selectVariant(variant)
						}
					}}
				>
					{#each item.variants as variant}
						<div
							class="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
						>
							<RadioGroup.Item
								value={variant.id.toString()}
								class="flex items-center gap-2"
							>
								{#snippet children({ checked })}
									<div
										class="h-4 w-4 rounded-full border-2 border-indigo-600 bg-white transition-all duration-200 {checked
											? 'bg-indigo-600 ring-2 ring-indigo-200'
											: ''}"
									>
										{#if checked}
											<div
												class="m-auto mt-0.5 h-2 w-2 rounded-full bg-white"
											></div>
										{/if}
									</div>
									<span class="text-gray-900 dark:text-white">
										{variant.name}
									</span>
								{/snippet}
							</RadioGroup.Item>
							<span class="font-medium text-gray-900 dark:text-white">
								₹{Number(variant.price).toFixed(2)}
							</span>
						</div>
					{/each}
				</RadioGroup.Root>
			</div>
		{/if}

		<!-- Addons selection (if any) -->
		{#if item.addons && item.addons.length > 0}
			<div>
				<h3 class="mb-3 text-lg font-medium text-gray-900 dark:text-white">Add Extra</h3>
				<div class="space-y-2">
					{#each item.addons as addon}
						<div
							class="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
						>
							<Checkbox.Root
								class="flex items-center gap-2"
								checked={isAddonSelected(addon)}
								onCheckedChange={() => toggleAddon(addon)}
							>
								{#snippet children({ checked })}
									<div
										class="flex h-4 w-4 items-center justify-center rounded border-2 border-indigo-600 bg-white data-[state=checked]:bg-indigo-600 data-[state=checked]:text-white"
									>
										{#if checked}
											<svg
												width="12"
												height="12"
												viewBox="0 0 15 15"
												fill="none"
												xmlns="http://www.w3.org/2000/svg"
											>
												<path
													d="m11.4669 3.72684c.1-4.5-.1-.9-.7636-.3966L6.50002 8.50106l-1.42662-1.42671c-.39289-.39289-.88323-.39289-1.27586 0-.39289.39289-.39289.88323 0 1.27586l2.85355 2.85355c.39289.39289.88323.39289 1.27586 0l5.50006-5.50006c.3929-.39289.3929-.88323 0-1.27586z"
													fill="currentColor"
												/>
											</svg>
										{/if}
									</div>
									<span class="mr-1">{getFoodTypeIcon(addon.type)}</span>
									<span class="text-gray-900 dark:text-white">
										{addon.name}
									</span>
								{/snippet}
							</Checkbox.Root>
							<span class="font-medium text-gray-900 dark:text-white">
								+₹{Number(addon.price).toFixed(2)}
							</span>
						</div>
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

			<form
				method="POST"
				action="?/addToBasket"
				use:enhance={() => {
					submitting = true
					return async ({ result, update }) => {
						submitting = false
						if (result.type === 'success') {
							onClose()
						}
						await update()
					}
				}}
			>
				<input type="hidden" name="menuItemId" value={item.id} />
				<input type="hidden" name="quantity" value={item.quantity} />
				{#if item.selectedVariant}
					<input type="hidden" name="variantId" value={item.selectedVariant.id} />
				{/if}
				{#each item.selectedAddons as addon}
					<input type="hidden" name="addonIds" value={addon.id} />
				{/each}

				<Button.Root
					type="submit"
					class="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-3 font-medium text-white shadow-sm transition-all hover:bg-indigo-700 disabled:opacity-70"
					disabled={submitting || addingToCart}
				>
					{#if submitting || addingToCart}
						<div
							class="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"
						></div>
						Adding...
					{:else}
						<ShoppingCart size={18} />
						Add to Cart
					{/if}
				</Button.Root>
			</form>
		</div>
	</div>
</div>
