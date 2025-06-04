<script lang="ts">
	import { Button, Switch } from 'bits-ui'
	import { ShoppingCart, Minus, Plus, Trash2, ArrowLeft, CreditCard, Wallet } from 'lucide-svelte'
	import type { PageData } from './$types'
	import { goto } from '$app/navigation'
	import { enhance } from '$app/forms'

	let { data }: { data: PageData } = $props()

	// Calculate total for a basket
	function calculateBasketTotal(items: any[]) {
		return items.reduce((total, item) => {
			if (!item.menuItem) return total
			const basePrice = Number(item.menuItem.price)
			const variantPrice = item.variant ? Number(item.variant.price) : 0
			const addonsPrice = item.addons.reduce((sum: number, addon: any) => sum + Number(addon.price), 0)
			return total + (basePrice + variantPrice + addonsPrice) * item.quantity
		}, 0)
	}

	// Calculate item total
	function calculateItemTotal(item: any) {
		if (!item.menuItem) return 0
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
	let grandTotal = $state(0)
	$effect(() => {
		grandTotal = data.baskets.reduce((total, basket) => 
			total + calculateBasketTotal(basket.items), 0
		)
	})

	// Get wallet balance for a canteen
	function getWalletBalance(canteenId: number) {
		const wallet = data.wallets?.find(w => w.wallet.canteenId === canteenId)
		return wallet ? parseFloat(wallet.wallet.balance) : 0
	}

	// Check if user has sufficient balance for a basket
	function hasSufficientBalance(canteenId: number, basketTotal: number) {
		return getWalletBalance(canteenId) >= basketTotal
	}

	let paymentMethods: Record<number, boolean> = $state({})
    data.baskets.forEach(basket => {
        // Always set a default value to avoid undefined
        paymentMethods[basket.canteen.id] = false
    })

	// Check if order can be placed (either sufficient wallet balance for prepaid or postpaid selected)
	function canPlaceOrder(canteenId: number, basketTotal: number) {
		const isWalletPayment = paymentMethods[canteenId] ?? false
		return !isWalletPayment || (isWalletPayment && hasSufficientBalance(canteenId, basketTotal))
	}

	// Get payment method display text
	function getPaymentMethodText(canteenId: number, basketTotal: number) {
		const isWalletPayment = paymentMethods[canteenId] ?? false
		if (!isWalletPayment) {
			return 'Place Order (Pay Later)'
		}
		return hasSufficientBalance(canteenId, basketTotal) ? 'Place Order (Wallet)' : 'Insufficient Balance'
	}
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
								<div class="mt-2 flex items-center gap-4">
									<span class="text-sm text-gray-600 dark:text-gray-300">
										Wallet Balance: <span class="font-medium text-green-600">₹{getWalletBalance(basket.canteen.id).toFixed(2)}</span>
									</span>
									{#if !hasSufficientBalance(basket.canteen.id, calculateBasketTotal(basket.items))}
										<span class="text-xs text-red-600 bg-red-50 px-2 py-1 rounded dark:bg-red-900 dark:text-red-300">
											Insufficient balance
										</span>
									{/if}
								</div>
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
											<span class="text-sm">{item.menuItem ? getFoodTypeIcon(item.menuItem.type) : ''}</span>
											<h3 class="font-medium text-gray-900 dark:text-white">
												{item.menuItem?.name || 'Unknown Item'}
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
											<div>Base: ₹{item.menuItem ? Number(item.menuItem.price).toFixed(2) : '0.00'}</div>
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

						<!-- Place Order Button for this canteen -->
						<div class="mt-6 border-t border-gray-200 pt-4 dark:border-gray-700">
							<div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
								<div class="flex-1">
									<p class="text-sm text-gray-600 dark:text-gray-300">
										Total for {basket.canteen.name}
									</p>
									<p class="text-xl font-bold text-gray-900 dark:text-white">
										₹{calculateBasketTotal(basket.items).toFixed(2)}
									</p>
								</div>

								<!-- Payment Method Switch -->
								<div class="flex flex-col gap-2 sm:flex-row sm:items-end">
									<div class="flex flex-col gap-1">
										<label class="text-xs font-medium text-gray-600 dark:text-gray-300">
											Payment Method
										</label>
										{#if paymentMethods[basket.canteen.id] !== undefined}
											<div class="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-800">
												<div class="flex items-center gap-2 text-sm {paymentMethods[basket.canteen.id] ? 'text-gray-400' : 'text-gray-900 dark:text-white'}">
													<CreditCard size={16} />
													<span>Pay Later</span>
												</div>
												<Switch.Root
													bind:checked={paymentMethods[basket.canteen.id]}
													class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 data-[state=checked]:bg-green-600"
												>
													<Switch.Thumb class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out data-[state=checked]:translate-x-4" />
												</Switch.Root>
												<div class="flex items-center gap-2 text-sm {paymentMethods[basket.canteen.id] ? 'text-gray-900 dark:text-white' : 'text-gray-400'}">
													<Wallet size={16} />
													<span>Wallet</span>
													<span class="text-xs text-green-600">
														(₹{getWalletBalance(basket.canteen.id).toFixed(2)})
													</span>
												</div>
											</div>
										{/if}
									</div>

									<!-- Place Order Button -->
										<form method="POST" action="?/placeOrder" use:enhance={({ formData, submitter }) => {
											return async ({ result, update }) => {
												if (result.type === 'success') {
													// Redirect to orders page on successful order placement
													goto('/orders')
												} else {
													await update()
												}
											}
										}}>
											<input type="hidden" name="canteenId" value={basket.canteen.id} />
											<input type="hidden" name="paymentMethod" value={paymentMethods[basket.canteen.id]} />
											<Button.Root
												type="submit"
												disabled={!canPlaceOrder(basket.canteen.id, calculateBasketTotal(basket.items))}
												class="w-full rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition-all hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
											>
												{getPaymentMethodText(basket.canteen.id, calculateBasketTotal(basket.items))}
											</Button.Root>
										</form>
								</div>
							</div>

							<!-- Payment method info -->
								{#if paymentMethods[basket.canteen.id] && !hasSufficientBalance(basket.canteen.id, calculateBasketTotal(basket.items))}
									<div class="mt-3 rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
										<p class="text-sm text-red-600 dark:text-red-400">
											Insufficient wallet balance. Current balance: ₹{getWalletBalance(basket.canteen.id).toFixed(2)} | Required: ₹{calculateBasketTotal(basket.items).toFixed(2)}
										</p>
									</div>
								{:else if !paymentMethods[basket.canteen.id]}
									<div class="mt-3 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
										<p class="text-sm text-blue-600 dark:text-blue-400">
											<CreditCard size={16} class="inline mr-1" />
											Payment will be collected when you collect your order.
										</p>
									</div>
								{/if}
						</div>
					</div>
				{/each}

				<!-- Grand Total Display -->
				{#if grandTotal > 0}
					<div class="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
						<div class="text-center">
							<p class="text-sm text-gray-600 dark:text-gray-300">Grand Total Across All Canteens</p>
							<p class="text-2xl font-bold text-gray-900 dark:text-white">
								₹{grandTotal.toFixed(2)}
							</p>
							<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
								Place orders individually for each canteen above
							</p>
						</div>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>
