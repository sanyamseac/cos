<script lang="ts">
	import type { PageData } from './$types'
	import BasketHeader from './components/BasketHeader.svelte'
	import BasketItem from './components/BasketItem.svelte'
	import PaymentMethodSelector from './components/PaymentMethodSelector.svelte'
	import EmptyBasket from './components/EmptyBasket.svelte'
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte'
	import ShareBasketModal from './components/ShareBasketModal.svelte'
	import JoinBasketModal from './components/JoinBasketModal.svelte'
	import { Trash2, Users, Crown } from 'lucide-svelte'
	import { enhance } from '$app/forms'
	import {
		getWalletBalance,
	} from '$lib/utils/basketUtils'
	import { formatPrice, calculateBasketTotal } from '$lib/utils/priceUtils'
	let { data }: { data: PageData } = $props()	// Flatten all baskets from basketsByCanteen for easier processing
	const allBaskets = $derived(() => {
		return data.basketsByCanteen?.flatMap(canteenGroup => 
			canteenGroup.baskets.map((basket: any) => ({
				...basket,
				canteen: canteenGroup.canteen
			}))
		) || []
	})

	// Get all items from all baskets separated by canteen
	const allItemsGroupedByCanteen = $derived(() => {
		return data.basketsByCanteen?.map(canteenGroup => {
			const allItems = canteenGroup.baskets.flatMap((basket: any) => basket.items)
			return {
				canteen: canteenGroup.canteen,
				baskets: canteenGroup.baskets,
				allItems: allItems,
				totalItems: allItems.length,
				isShared: canteenGroup.isShared,
				accessCode: canteenGroup.accessCode
			}
		}) || []
	})

	// Initialize payment methods for all canteens (one per canteen)
	let paymentMethods = $state({} as Record<number, boolean>)

	// Initialize payment methods when data changes
	$effect(() => {
		const methods: Record<number, boolean> = {}
		data.basketsByCanteen?.forEach(canteenGroup => {
			methods[canteenGroup.canteen.id] = false
		})
		paymentMethods = methods
	})

	// Helper function to get payment method with fallback
	function getPaymentMethod(canteenId: number): boolean {
		return paymentMethods[canteenId] ?? false
	}
	
	// Helper function to set payment method
	function setPaymentMethod(canteenId: number, value: boolean) {
		paymentMethods[canteenId] = value
	}

	// Helper function to check if current user is owner of any basket in canteen group
	function isUserOwnerOfCanteenGroup(canteenGroup: any): boolean {
		// With the refactored logic, check if user owns any basket in the group
		// For shared baskets, only the original sharer (first to create with access code) can place orders
		return canteenGroup.baskets.some((basket: any) => basket.isOwner === true)
	}

	// Helper function to check if canteen group is shared
	function hasSharedBaskets(canteenGroup: any): boolean {
		return canteenGroup.isShared === true
	}

	// Helper function to get owner info from a canteen group
	function getOwnerInfo(canteenGroup: any): any {
		// Find the owner basket (the one with isOwner = true)
		const ownerBasket = canteenGroup.baskets.find((basket: any) => basket.isOwner === true)
		return ownerBasket?.owner || null
	}
	// Calculate grand total across all items
	const grandTotal = $derived(() => {
		return allItemsGroupedByCanteen().reduce((total: number, canteenGroup: any) => {
			return total + calculateBasketTotal(canteenGroup.allItems)
		}, 0)
	})
	// Alert dialog state
	let showOrderConfirm = $state(false)
	let selectedCanteenGroup: any = $state(null)
	let isSubmittingOrder = $state(false)
	let orderError = $state('')

	// Sharing state
	let showShareModal = $state(false)
	let showJoinModal = $state(false)
	let shareAccessCode = $state('')
	function openOrderConfirm(canteenGroup: any) {
		selectedCanteenGroup = canteenGroup
		orderError = '' // Clear any previous errors
		showOrderConfirm = true
	}
	async function confirmOrder() {
		if (selectedCanteenGroup) {
			isSubmittingOrder = true
			orderError = ''

			// Create form data
			const formData = new FormData()
			formData.append('canteenId', selectedCanteenGroup.canteen.id.toString())
			formData.append('accessCode', selectedCanteenGroup.accessCode || 'individual')
			
			// Send payment method as string
			formData.append(
				'paymentMethod',
				getPaymentMethod(selectedCanteenGroup.canteen.id) ? 'wallet' : 'postpaid',
			)

			try {
				// Submit using fetch
				const response = await fetch('?/placeOrder', {
					method: 'POST',
					body: formData,
				})

				const result = await response.json()
				if (response.ok) {
					showOrderConfirm = false
					// Auto-redirect on success
					if (result.redirect) {
						window.location.href = result.redirect
					} else {
						window.location.reload()
					}
				} else {
					orderError = result?.error || 'Failed to place order. Please try again.'
					console.error('Order submission failed:', result)
				}
			} catch (error) {
				orderError = 'Network error. Please check your connection and try again.'
				console.error('Error submitting order:', error)
			} finally {
				isSubmittingOrder = false
			}
		} else {
			showOrderConfirm = false
		}
	}
	async function handleShareBasket(canteenId: number) {
		console.log('handleShareBasket called with canteenId:', canteenId)
		try {
			const formData = new FormData()
			formData.append('canteenId', canteenId.toString())
			console.log('FormData created with canteenId:', formData.get('canteenId'))

			console.log('Sending fetch request to ?/shareBasket')
			const response = await fetch('?/shareBasket', {
				method: 'POST',
				body: formData,
			})
			console.log('Fetch response received, status:', response.status)

			const result = await response.json()
			console.log('Share basket response parsed:', result)
			
			if (response.ok && result.data) {
				// With the refactored backend, accessCode is directly in result.data
				shareAccessCode = result.data.accessCode || result.data
				showShareModal = true
			} else {
				console.error('Response not OK:', response.status, result)
				throw new Error(result.data?.error || 'Failed to share basket')
			}
		} catch (error) {
			console.error('Error sharing basket:', error)
			throw error
		}
	}

	async function handleJoinBasket(accessCode: string) {
		try {
			const formData = new FormData()
			formData.append('accessCode', accessCode)

			const response = await fetch('?/joinBasket', {
				method: 'POST',
				body: formData,
			})

			const result = await response.json()
			if (result.type === 'success') {
				// Reload the page to show the updated basket
				window.location.reload()
			} else {
				throw new Error(result.data?.error || 'Failed to join basket')
			}
		} catch (error) {
			console.error('Error joining basket:', error)
			throw error
		}
	}

	function openShareModal() {
		shareAccessCode = ''
		showShareModal = true
	}

	function openJoinModal() {
		showJoinModal = true
	}
</script>

<svelte:head>
	<title>My Basket - IIIT Canteen Ordering System</title>
	<meta name="description" content="Review your basket and place your order." />
</svelte:head>

<div
	class="relative min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
>
	<!-- Decorative background elements -->
	<div class="absolute inset-0 opacity-20">
		<div
			class="absolute top-10 left-10 h-32 w-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 blur-3xl"
		></div>
		<div
			class="absolute top-1/3 right-20 h-48 w-48 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 blur-3xl"
		></div>
		<div
			class="absolute bottom-20 left-1/4 h-40 w-40 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 blur-3xl"
		></div>
	</div>
	<div class="relative z-10 space-y-6 p-4 sm:p-6">		
		<BasketHeader 
			basketCount={allItemsGroupedByCanteen().reduce((total: number, group: any) => total + group.totalItems, 0)} 
			grandTotal={grandTotal()} 
			hasBaskets={allItemsGroupedByCanteen().length > 0}
			onShareBasket={openShareModal}
			onJoinBasket={openJoinModal}
		/>

		{#if allItemsGroupedByCanteen().length === 0}
			<EmptyBasket />
		{:else}			<!-- Basket Items by Canteen -->
			<div class="space-y-6">
				{#each allItemsGroupedByCanteen() as canteenGroup}
					<div class="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">						<!-- Canteen Header -->
						<div class="mb-6 flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
							<div>
								<div class="flex items-center gap-2 mb-1">
									<h2 class="text-xl font-semibold text-gray-900 dark:text-white">
										{canteenGroup.canteen.name}
									</h2>
									{#if isUserOwnerOfCanteenGroup(canteenGroup)}
										<div class="flex items-center gap-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1">
											<Crown size={16} class="text-yellow-600 dark:text-yellow-400" />
											<span class="text-sm font-medium text-yellow-700 dark:text-yellow-300">Owner</span>
										</div>
									{:else if hasSharedBaskets(canteenGroup)}
										<div class="flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-900/30 px-3 py-1">
											<Users size={16} class="text-blue-600 dark:text-blue-400" />
											<span class="text-sm font-medium text-blue-700 dark:text-blue-300">Shared</span>
										</div>
									{/if}
								</div>
								<div class="flex items-center gap-3 mt-1">
									<p class="text-sm text-gray-600 dark:text-gray-300">
										{canteenGroup.totalItems} item{canteenGroup.totalItems !== 1 ? 's' : ''}
									</p>
									{#if canteenGroup.baskets.length > 1}
										<div class="flex items-center gap-1 rounded-full bg-gray-100 dark:bg-gray-700 px-2 py-1">
											<span class="text-xs text-gray-700 dark:text-gray-300">
												{canteenGroup.baskets.length} basket{canteenGroup.baskets.length !== 1 ? 's' : ''}
											</span>
										</div>
									{/if}
									{#if hasSharedBaskets(canteenGroup) && !isUserOwnerOfCanteenGroup(canteenGroup)}
										{@const owner = getOwnerInfo(canteenGroup)}
										{#if owner}
											<div class="flex items-center gap-1 rounded-full bg-orange-100 dark:bg-orange-900/30 px-2 py-1">
												<Crown size={12} class="text-orange-600 dark:text-orange-400" />
												<span class="text-xs text-orange-700 dark:text-orange-300">
													Owned by {owner.name}
												</span>
											</div>
										{/if}
									{/if}
								</div>
								<div class="mt-2 flex items-center gap-4">
									<span class="text-sm text-gray-600 dark:text-gray-300">
										Wallet Balance: <span class="font-medium text-green-600">
											{formatPrice(getWalletBalance(canteenGroup.canteen.id, data.wallets))}
										</span>
									</span>
									{#if getWalletBalance(canteenGroup.canteen.id, data.wallets) < calculateBasketTotal(canteenGroup.allItems)}
										<span class="rounded bg-red-50 px-2 py-1 text-xs text-red-600 dark:bg-red-900 dark:text-red-300">
											Insufficient balance
										</span>
									{/if}
								</div>
							</div>							<div class="flex items-center gap-2">
								<span class="text-lg font-semibold text-gray-900 dark:text-white">
									{formatPrice(calculateBasketTotal(canteenGroup.allItems))}
								</span>
								{#if isUserOwnerOfCanteenGroup(canteenGroup)}
									<form method="POST" action="?/clearBasket" use:enhance>
										<input type="hidden" name="canteenId" value={canteenGroup.canteen.id} />										<button
											type="submit"
											class="flex items-center gap-1 rounded-lg bg-red-100 px-3 py-1 text-sm text-red-600 transition-all hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
										>
											<Trash2 size={14} />
											Clear My Items
										</button>
									</form>
								{/if}
							</div>
						</div>

						<!-- All Items for this Canteen -->
						<div class="space-y-3">
							{#each canteenGroup.allItems as item, index}
								<BasketItem {item} showAddedBy={true} />
								{#if index < canteenGroup.allItems.length - 1}
									<hr class="border-gray-200 dark:border-gray-700" />
								{/if}
							{/each}
						</div>

						<!-- Payment and Order Section -->
						<div class="mt-6 border-t border-gray-200 pt-4 dark:border-gray-700">
							<div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
								<div class="flex-1">
									<p class="text-sm text-gray-600 dark:text-gray-300">
										Total for {canteenGroup.canteen.name}
									</p>
									<p class="text-xl font-bold text-gray-900 dark:text-white">
										{formatPrice(calculateBasketTotal(canteenGroup.allItems))}
									</p>
								</div>								<!-- Payment Method and Order Button -->
								<div class="flex flex-col gap-2 sm:flex-row sm:items-end">
									{#if isUserOwnerOfCanteenGroup(canteenGroup)}
										<PaymentMethodSelector
											canteenId={canteenGroup.canteen.id}
											walletBalance={getWalletBalance(canteenGroup.canteen.id, data.wallets)}
											isWalletPayment={getPaymentMethod(canteenGroup.canteen.id)}
											basketTotal={calculateBasketTotal(canteenGroup.allItems)}
											hasSufficientBalance={getWalletBalance(canteenGroup.canteen.id, data.wallets) >= calculateBasketTotal(canteenGroup.allItems)}
											onPaymentMethodChange={(value) => setPaymentMethod(canteenGroup.canteen.id, value)}
										/>
										<button
											onclick={() => openOrderConfirm(canteenGroup)}
											disabled={getPaymentMethod(canteenGroup.canteen.id) && getWalletBalance(canteenGroup.canteen.id, data.wallets) < calculateBasketTotal(canteenGroup.allItems)}
											class="w-full rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition-all hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
										>
											{getPaymentMethod(canteenGroup.canteen.id) 
												? (getWalletBalance(canteenGroup.canteen.id, data.wallets) >= calculateBasketTotal(canteenGroup.allItems) 
													? 'Place Order (Wallet)' 
													: 'Insufficient Balance'
												)
												: 'Place Order (Pay Later)'
											}
										</button>
									{:else}
									{@const owner = getOwnerInfo(canteenGroup)}
										<div class="flex items-center gap-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 px-4 py-3 border border-orange-200 dark:border-orange-800">
											<Crown size={16} class="text-orange-600 dark:text-orange-400" />
											<div>
												<p class="text-sm font-medium text-orange-800 dark:text-orange-200">
													Only the basket owner can place orders
												</p>
												{#if owner}
													<p class="text-xs text-orange-600 dark:text-orange-400">
														Contact {owner.name} to place this order
													</p>
												{/if}
											</div>
										</div>
									{/if}
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<!-- Order Confirmation Dialog -->
<ConfirmDialog
	bind:open={showOrderConfirm}
	title="Confirm Your Order"	description={selectedCanteenGroup
		? `Place order at ${selectedCanteenGroup.canteen.name} for ${formatPrice(calculateBasketTotal(selectedCanteenGroup.allItems))} (${getPaymentMethod(selectedCanteenGroup.canteen.id) ? 'Pay with Wallet' : 'Pay on Collection'})`
		: ''}
	onConfirm={confirmOrder}
	onClose={() => (showOrderConfirm = false)}
	confirmText={isSubmittingOrder ? 'Processing...' : 'Place Order'}
	loading={isSubmittingOrder}
	variant={orderError ? 'danger' : 'primary'}
/>

<!-- Share Basket Modal -->
<ShareBasketModal
	bind:open={showShareModal}
	accessCode={shareAccessCode}
	onShare={handleShareBasket}
	canteens={data.basketsByCanteen?.map(group => group.canteen) || []}
/>

<!-- Join Basket Modal -->
<JoinBasketModal
	bind:open={showJoinModal}
	onJoin={handleJoinBasket}
/>
