<script lang="ts">
	import type { PageData } from './$types'
	import BasketHeader from './components/BasketHeader.svelte'
	import BasketItem from './components/BasketItem.svelte'
	import PaymentMethodSelector from './components/PaymentMethodSelector.svelte'
	import EmptyBasket from './components/EmptyBasket.svelte'
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte'
	import ShareBasketModal from './components/ShareBasketModal.svelte'
	import JoinBasketModal from './components/JoinBasketModal.svelte'
	import Elements from '$lib/components/Elements.svelte'
	import {  UserMinus, Trash2, Users, EyeOff, Eye } from 'lucide-svelte'
	import { enhance } from '$app/forms'
	import { getWalletBalance } from '$lib/utils/basketUtils'
	import { formatPrice, calculateBasketTotal } from '$lib/utils/priceUtils'
	import { goto, invalidateAll } from '$app/navigation'
	import { Toggle } from 'bits-ui'

	let { data }: { data: PageData } = $props()

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

	let paymentMethods = $state({} as Record<number, boolean>)
	let showPin = $state(false)

	$effect(() => {
		const methods: Record<number, boolean> = {}
		data.basketsByCanteen?.forEach(canteenGroup => {
			methods[canteenGroup.canteen.id] = false
		})
		paymentMethods = methods
	})

	function getPaymentMethod(canteenId: number): boolean {
		return paymentMethods[canteenId] ?? false
	}

	function setPaymentMethod(canteenId: number, value: boolean) {
		paymentMethods[canteenId] = value
	}

	function hasSharedBaskets(canteenGroup: any): boolean {
		return canteenGroup.isShared === true
	}

	const grandTotal = $derived(() => {
		return allItemsGroupedByCanteen().reduce((total: number, canteenGroup: any) => {
			return total + calculateBasketTotal(canteenGroup.allItems)
		}, 0)
	})
	let showOrderConfirm = $state(false)
	let selectedCanteenGroup: any = $state(null)

	let showShareModal = $state(false)
	let showJoinModal = $state(false)

	let orderFormRef: HTMLFormElement | null = $state(null)

	function openOrderConfirm(canteenGroup: any) {
		selectedCanteenGroup = canteenGroup
		showOrderConfirm = true
	}

	function submitOrderForm(canteenGroup: any) {
		selectedCanteenGroup = canteenGroup
		if (orderFormRef) {
			const canteenIdInput = orderFormRef.querySelector('input[name="canteenId"]') as HTMLInputElement
			const accessCodeInput = orderFormRef.querySelector('input[name="accessCode"]') as HTMLInputElement
			const paymentMethodInput = orderFormRef.querySelector('input[name="paymentMethod"]') as HTMLInputElement
			
			if (canteenIdInput) canteenIdInput.value = canteenGroup.canteen.id.toString()
			if (accessCodeInput) accessCodeInput.value = canteenGroup.accessCode || 'individual'
			if (paymentMethodInput) {
				paymentMethodInput.value = getPaymentMethod(canteenGroup.canteen.id) ? 'wallet' : 'postpaid'
			}
			
			orderFormRef.requestSubmit()
		}
	}

	function openShareModal() {
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
	class="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
>
	<Elements />

	<div class="relative z-10 space-y-8 px-4 py-6 md:px-8 md:py-10">	
		<BasketHeader 
			basketCount={allItemsGroupedByCanteen().reduce((total: number, group: any) => total + group.totalItems, 0)} 
			grandTotal={grandTotal()} 
			hasBaskets={allItemsGroupedByCanteen().length > 0}
			onShareBasket={openShareModal}
			onJoinBasket={openJoinModal}
		/>

		{#if allItemsGroupedByCanteen().length === 0}
			<EmptyBasket />
		{:else}
			<div class="space-y-6">
				{#each allItemsGroupedByCanteen() as canteenGroup}
					<div class="rounded-xl bg-white p-4 md:p-6 shadow-sm dark:bg-gray-800">	
						<div class="mb-4 flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
							<div>
								<div class="flex items-center gap-2 mb-1">
									<h2 class="text-xl font-semibold text-gray-900 dark:text-white">
										{canteenGroup.canteen.name}
									</h2>
									{#if hasSharedBaskets(canteenGroup)}
										<div class="flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-900/30 px-3 py-1">
											<Users size={16} class="text-blue-600 dark:text-blue-400" />
											<span class="hidden text-sm font-medium text-blue-700 dark:text-blue-300 md:inline">Shared</span>
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
								</div>
							</div>							
							<div class="flex items-center gap-2">
								{#if hasSharedBaskets(canteenGroup)}
									<form method="POST" action="?/leaveBasket" use:enhance>
										<input type="hidden" name="canteenId" value={canteenGroup.canteen.id} />
										<button
											onclick={() => invalidateAll()}
											class="flex items-center gap-1 rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-600 transition-all hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
										>
											<UserMinus size={20} />
										</button>
									</form>
								{/if}
								<form method="POST" action="?/clearBasket" use:enhance>
									<input type="hidden" name="canteenId" value={canteenGroup.canteen.id} />
									<button
										type="submit"
										class="flex items-center gap-1 rounded-lg bg-red-100 px-3 py-1 text-sm text-red-600 transition-all hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
									>
										<Trash2 size={20} />
									</button>
								</form>
							</div>
						</div>
						{#if canteenGroup.accessCode}
							<div class="border-b border-gray-200 pb-4 dark:border-gray-700 mb-6">
								<div class="flex flex-row justify-between gap-3">
									<h3 class="font-medium text-base text-gray-900 dark:text-white">AccessCode</h3>
									<div class="flex items-center gap-2">
										<span class="font-mono text-base font-bold text-gray-900 dark:text-white">
											{showPin ? canteenGroup.accessCode : '••••••••'}
										</span>
										<Toggle.Root
											class="rounded p-1 hover:bg-gray-200 dark:hover:bg-gray-600"
											bind:pressed={showPin}
											aria-label="Toggle PIN visibility"
										>
											{#if showPin}
												<EyeOff size={16} class="text-gray-500" />
											{:else}
												<Eye size={16} class="text-gray-500" />
											{/if}
										</Toggle.Root>
									</div>
								</div>
							</div>
						{/if}

						<div class="space-y-3">
							{#each canteenGroup.allItems as item, index}
								<BasketItem {item} showAddedBy={hasSharedBaskets(canteenGroup)} />
							{/each}
						</div>

						<div class="mt-6 border-t border-gray-200 pt-4 dark:border-gray-700">
							<div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
								<div class="flex-1">
									<p class="text-sm text-gray-600 dark:text-gray-300">
										Total for {canteenGroup.canteen.name}
									</p>
									<p class="text-xl font-bold text-gray-900 dark:text-white">
										{formatPrice(calculateBasketTotal(canteenGroup.allItems))}
									</p>
								</div>
								<div class="flex flex-col gap-2 sm:flex-row sm:items-end">
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
										disabled={(getPaymentMethod(canteenGroup.canteen.id) && getWalletBalance(canteenGroup.canteen.id, data.wallets) < calculateBasketTotal(canteenGroup.allItems)) || !canteenGroup.canteen.open}
										class="w-full rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition-all hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
									>
										{canteenGroup.canteen.open ?
											getPaymentMethod(canteenGroup.canteen.id) 
												? (getWalletBalance(canteenGroup.canteen.id, data.wallets) >= calculateBasketTotal(canteenGroup.allItems) 
													? 'Place Order (Wallet)' 
													: 'Insufficient Balance'
												)
												: 'Place Order (Pay Later)'
											: 'Canteen Closed'
										}
									</button>
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}	</div>
</div>

<!-- Hidden form for order submission -->
<form 
	bind:this={orderFormRef} 
	method="POST" 
	action="?/placeOrder" 
	use:enhance={() => {
		return async ({ result }) => {
			showOrderConfirm = false
			if (result.type === 'success' && result.data) {
				if (result.data?.redirect && typeof result.data.redirect === 'string') {
					goto(result.data.redirect)
				} else {
					goto('/orders')
				}
			} else if (result.type === 'failure' && result.data) {
				alert(result.data?.error || 'Failed to place order')
			} else if (result.type === 'redirect') {
				goto(result.location)
			}
		}
	}}
	class="hidden"
>
	<input type="hidden" name="canteenId" />
	<input type="hidden" name="accessCode" />
	<input type="hidden" name="paymentMethod" />
</form>

<ConfirmDialog
	bind:open={showOrderConfirm}
	title="Confirm Your Order"
	description={selectedCanteenGroup
		? `Place order at ${selectedCanteenGroup.canteen.name} for ${formatPrice(calculateBasketTotal(selectedCanteenGroup.allItems))} (${getPaymentMethod(selectedCanteenGroup.canteen.id) ? 'Pay with Wallet' : 'Pay on Collection'})`
		: ''}
	onConfirm={() => submitOrderForm(selectedCanteenGroup)}
	onClose={() => (showOrderConfirm = false)}
	confirmText="Place Order"
	variant="primary"
/>

<ShareBasketModal
	bind:open={showShareModal}
	canteens={data.basketsByCanteen?.map(group => group.canteen) || []}
/>

<JoinBasketModal
	bind:open={showJoinModal}
/>
