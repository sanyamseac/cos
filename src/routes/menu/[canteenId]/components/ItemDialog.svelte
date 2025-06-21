<script lang="ts">
	import { Button, Dialog, RadioGroup, Checkbox, Label, useId } from 'bits-ui'
	import { Minus, Plus, X as Close, ShoppingBasket, Check } from 'lucide-svelte'
	import { enhance } from '$app/forms'
	import { formatPrice } from '$lib/utils'
	import FoodType from '$lib/components/FoodType.svelte'

	let {
		item = $bindable(),
		addingToCart,
		onClose,
		showCartMessage = $bindable(false),
	}: {
		item: any
		addingToCart?: boolean
		onClose: () => void
		showCartMessage?: boolean
	} = $props()

	let submitting = $state(false)
	let value = $state(item.selectedVariant?.id?.toString() || '')

	const basePrice = $derived(Number(item.price))
	const variantPrice = $derived(item.selectedVariant ? Number(item.selectedVariant.price) : 0)
	const addonsPrice = $derived(
		item.selectedAddons.length > 0
			? item.selectedAddons.reduce((sum: number, addon: any) => sum + Number(addon.price), 0)
			: 0,
	)
	const totalPrice = $derived((basePrice + variantPrice + addonsPrice) * item.quantity)
	const formattedTotalPrice = $derived(totalPrice.toFixed(2))

	function handleValueChange(newValue: string) {
		value = newValue
		const variant = item.variants.find((v: any) => v.id.toString() === newValue)
		if (variant) {
			item.selectedVariant = variant
		}
	}

	function isAddonSelected(addon: any) {
		return item.selectedAddons.some((a: any) => a.id === addon.id)
	}

	function handleAddonChange(addon: any, checked: boolean) {
		if (checked) {
			if (!isAddonSelected(addon)) {
				item.selectedAddons = [...item.selectedAddons, addon]
			}
		} else {
			const index = item.selectedAddons.findIndex((a: any) => a.id === addon.id)
			if (index >= 0) {
				item.selectedAddons = [
					...item.selectedAddons.slice(0, index),
					...item.selectedAddons.slice(index + 1),
				]
			}
		}
	}

	function increaseQuantity() {
		if (item.quantity) {
			item.quantity += 1
		}
	}

	function decreaseQuantity() {
		if (item.quantity > 1) {
			item.quantity -= 1
		}
	}
</script>

<div class="relative">
	<Dialog.Close
		class="absolute top-0 right-0 flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
	>
		<Close size={26} />
	</Dialog.Close>

	<Dialog.Title class="pr-8 text-2xl font-bold text-gray-900 dark:text-white">
		{item.name}
		<FoodType type={item.type} size={24} class="ml-2 inline-block" />
	</Dialog.Title>

	{#if item.description}
		<Dialog.Description class="mt-2 text-gray-600 dark:text-gray-300">
			{item.description}
		</Dialog.Description>
	{/if}

	<div class="mt-6 space-y-6">
		{#if item.variants && item.variants.length > 0}
			<div>
				<h3 class="mb-3 text-lg font-medium text-gray-900 dark:text-white">
					Choose Variant
				</h3>
				<div class="space-y-3">
					<RadioGroup.Root
						class="flex flex-col gap-3"
						bind:value
						onValueChange={handleValueChange}
					>
						{#each item.variants as variant}
							{@const id = useId()}
							<div
								class="flex items-center justify-between rounded-lg border bg-white/80 p-3 backdrop-blur-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800/80 dark:hover:bg-gray-700"
							>
								<div class="flex items-center">
									<RadioGroup.Item
										{id}
										value={variant.id.toString()}
										disabled={!variant.available}
										class="flex h-5 w-5 items-center justify-center rounded-full border-2 border-gray-300 bg-white transition-colors hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-indigo-600 data-[state=checked]:bg-indigo-600 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-gray-500"
									>
										{#snippet children({ checked })}
											{#if checked}
												<div class="h-3 w-3 rounded-full bg-white" />
											{/if}
										{/snippet}
									</RadioGroup.Item>
									<Label.Root
										for={id}
										class="ml-3 cursor-pointer text-gray-900 dark:text-white {!variant.available ||
										!variant.active
											? 'cursor-not-allowed opacity-50'
											: ''}"
									>
										{variant.name}
									</Label.Root>
								</div>
								<span
									class="font-medium text-gray-900 dark:text-white {!variant.available ||
									!variant.active
										? 'opacity-50'
										: ''}"
								>
									{formatPrice(Number(variant.price) + Number(item.price))}
								</span>
							</div>
						{/each}
					</RadioGroup.Root>
				</div>
			</div>
		{/if}

		{#if item.addons && item.addons.length > 0}
			<div>
				<h3 class="mb-3 text-lg font-medium text-gray-900 dark:text-white">Add Extra</h3>
				<div class="space-y-2">
					{#each item.addons as addon}
						<div
							class="flex cursor-pointer items-center justify-between rounded-lg border bg-white/80 p-3 backdrop-blur-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800/80 dark:hover:bg-gray-700 {addon.available
								? ''
								: 'cursor-not-allowed opacity-50'}"
						>
							<Checkbox.Root
								class="flex items-center gap-2"
								checked={isAddonSelected(addon)}
								onCheckedChange={(checked) => handleAddonChange(addon, checked)}
								disabled={!addon.available}
								value={addon.id.toString()}
							>
								{#snippet children({ checked })}
									<div
										class="flex h-5 w-5 items-center justify-center rounded border-2 border-gray-300 bg-white transition-colors hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-indigo-600 data-[state=checked]:bg-indigo-600 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-gray-500"
									>
										{#if checked}
											<Check size={12} class="text-foreground" />
										{/if}
									</div>
									<span class="text-gray-900 dark:text-white">
										{addon.name}
									</span>
									<FoodType type={addon.type} size={16} />
								{/snippet}
							</Checkbox.Root>
							<span class="font-medium text-gray-900 dark:text-white">
								{formatPrice(addon.price)}
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
							showCartMessage = true
							setTimeout(() => {
								showCartMessage = false
							}, 3000)
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
					class="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 py-3 font-medium text-white shadow-sm transition-all hover:bg-green-700 disabled:opacity-70"
					disabled={submitting || addingToCart}
				>
					{#if submitting || addingToCart}
						<div
							class="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"
						></div>
						Adding...
					{:else}
						<ShoppingBasket size={18} />
						Add to Basket
					{/if}
				</Button.Root>
			</form>
		</div>
	</div>
</div>
