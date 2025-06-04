<script lang="ts">
	import { Button } from 'bits-ui'
	import { ShoppingCart, Minus, Plus, Trash2, ArrowLeft } from 'lucide-svelte'
	import type { PageData } from './$types'
	import { goto } from '$app/navigation'
	import { enhance } from '$app/forms'

	let { data }: { data: PageData } = $props()

	// Calculate total for a basket
	function calculateBasketTotal(items: any[]) {
		return items.reduce((total, item) => {
			const basePrice = Number(item.menuItem.price)
			const variantPrice = item.variant ? Number(item.variant.price) : 0
			const addonsPrice = item.addons.reduce((sum: number, addon: any) => sum + Number(addon.price), 0)
			return total + (basePrice + variantPrice + addonsPrice) * item.quantity
		}, 0)
	}

	// Calculate item total
	function calculateItemTotal(item: any) {
		const basePrice = Number(item.menuItem.price)
		const variantPrice = item.variant ? Number(item.variant.price) : 0
		const addonsPrice = item.addons.reduce((sum: number, addon: any) => sum + Number(addon.price), 0)
		return (basePrice + variantPrice + addonsPrice) * item.quantity
	}

	// Get food type icon
	function getFoodTypeIcon(type: string) {
		if (type === 'veg') return '🟢'
		if (type === 'non-veg') return '🔴'
		if (type === 'egg') return '🟠'
		return ''
	}

	// Calculate grand total
	let grandTotal = 0
	$effect(() => {
		grandTotal = data.baskets.reduce((total, basket) => 
			total + calculateBasketTotal(basket.items), 0
		)
	})
</script>

<svelte:head>
	<title>My Basket - IIIT Canteen Ordering System</title>
	<meta name="description" content="Review your basket and place your order." />
</svelte:head>

<div class="relative min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
	<!-- Decorative background elements -->
	<div class="absolute inset-0 opacity-20">
		<div class="absolute top-10 left-10 h-32 w-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 blur-3xl"></div>
		<div class="absolute top-1/3 right-20 h-48 w-48 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 blur-3xl"></div>
		<div class="absolute bottom-20 left-1/4 h-40 w-40 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 blur-3xl"></div>
	</div>

	<div class="relative z-10 space-y-6 p-4 sm:p-6">
		<!-- Header -->
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-4">
				<Button.Root
					class="flex items-center gap-1 rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
					onclick={() => goto('/menu')}
				>
					<ArrowLeft size={16} />
					<span>Back to Menu</span>
				</Button.Root>
			</div>

			<h1 class="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent">
				My Basket
			</h1>

			<div class="w-24"></div> <!-- Spacer for centering -->
		</div>

		{#if data.baskets.length === 0}
			<!-- Empty Basket -->
			<div class="mx-auto max-w-md rounded-xl bg-white p-8 text-center shadow-sm dark:bg-gray-800">
				<div class="mb-4 flex justify-center">
					<div class="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
						<ShoppingCart size={32} class="text-gray-400" />
					</div>
				</div>
				<h2 class="mb-2 text-xl font-semibold text-gray-900 dark:text-white">Your basket is empty</h2>
				<p class="mb-6 text-gray-600 dark:text-gray-300">Start adding items from the menu to get started!</p>
				<Button.Root
					class="w-full rounded-lg bg-indigo-600 py-3 font-medium text-white transition-all hover:bg-indigo-700"
					onclick={() => goto('/menu')}
				>
					Browse Menu
				</Button.Root>
			</div>
		{:else}
			<!-- Basket Items -->
			<div class="space-y-6">
				{#each data.baskets as basket}
					<div class="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
						<!-- Canteen Header -->
						<div class="mb-4 flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
							<div>
								<h2 class="text-xl font-semibold text-gray-900 dark:text-white">
									{basket.canteen.name}
								</h2>
								<p class="text-sm text-gray-600 dark:text-gray-300">
									{basket.items.length} item{basket.items.length !== 1 ? 's' : ''}
								</p>
							</div>
							<div class="flex items-center gap-2">
								<span class="text-lg font-semibold text-gray-900 dark:text-white">
									₹{calculateBasketTotal(basket.items).toFixed(2)}
								</span>
								<form method="POST" action="?/clearBasket" use:enhance>
									<input type="hidden" name="canteenId" value={basket.canteen.id} />
									<Button.Root
										type="submit"
										class="flex items-center gap-1 rounded-lg bg-red-100 px-3 py-1 text-sm text-red-600 transition-all hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
									>
										<Trash2 size={14} />
										Clear
									</Button.Root>
								</form>
							</div>
						</div>

						<!-- Basket Items -->
						<div class="space-y-4">
							{#each basket.items as item}
								<div class="flex items-start gap-4 rounded-lg border border-gray-100 p-4 dark:border-gray-700">
									<div class="flex-1">
										<!-- Item Name and Type -->
										<div class="mb-2 flex items-center gap-2">
											<span class="text-sm">{getFoodTypeIcon(item.menuItem.type)}</span>
											<h3 class="font-medium text-gray-900 dark:text-white">
												{item.menuItem.name}
											</h3>
										</div>

										<!-- Variant -->
										{#if item.variant}
											<p class="text-sm text-gray-600 dark:text-gray-300">
												Variant: {item.variant.name} (+₹{Number(item.variant.price).toFixed(2)})
											</p>
										{/if}

										<!-- Addons -->
										{#if item.addons.length > 0}
											<p class="text-sm text-gray-600 dark:text-gray-300">
												Add-ons: {item.addons.map(addon => `${addon.name} (+₹${Number(addon.price).toFixed(2)})`).join(', ')}
											</p>
										{/if}

										<!-- Price breakdown -->
										<div class="mt-2 text-sm text-gray-600 dark:text-gray-300">
											<div>Base: ₹{Number(item.menuItem.price).toFixed(2)}</div>
											{#if item.variant}
												<div>Variant: +₹{Number(item.variant.price).toFixed(2)}</div>
											{/if}
											{#if item.addons.length > 0}
												<div>Add-ons: +₹{item.addons.reduce((sum, addon) => sum + Number(addon.price), 0).toFixed(2)}</div>
											{/if}
										</div>
									</div>

									<div class="flex flex-col items-end gap-2">
										<!-- Item Total -->
										<div class="font-medium text-gray-900 dark:text-white">
											₹{calculateItemTotal(item).toFixed(2)}
										</div>

										<!-- Quantity Controls -->
										<div class="flex items-center gap-2">
											<form method="POST" action="?/updateQuantity" use:enhance>
												<input type="hidden" name="basketItemId" value={item.id} />
												<input type="hidden" name="quantity" value={item.quantity - 1} />
												<Button.Root
													type="submit"
													class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition-all hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
													disabled={item.quantity <= 1}
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
													disabled={item.quantity >= 10}
												>
													<Plus size={14} />
												</Button.Root>
											</form>
										</div>

										<!-- Remove Item -->
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
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/each}

				<!-- Grand Total and Checkout -->
				{#if grandTotal > 0}
					<div class="sticky bottom-4 rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
						<div class="flex items-center justify-between">
							<div>
								<p class="text-sm text-gray-600 dark:text-gray-300">Total Amount</p>
								<p class="text-2xl font-bold text-gray-900 dark:text-white">
									₹{grandTotal.toFixed(2)}
								</p>
							</div>
							<Button.Root
								class="rounded-lg bg-indigo-600 px-8 py-3 font-medium text-white transition-all hover:bg-indigo-700"
								onclick={() => {
									// TODO: Implement checkout functionality
									alert('Checkout functionality coming soon!')
								}}
							>
								Proceed to Checkout
							</Button.Root>
						</div>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>
