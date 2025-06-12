<script lang="ts">
	import type { PageData } from './$types'
	import BasketHeader from './components/BasketHeader.svelte'
	import BasketCanteenSection from './components/BasketCanteenSection.svelte'
	import EmptyBasket from './components/EmptyBasket.svelte'
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte'
	import {
		calculateGrandTotal,
		initializePaymentMethods,
		getWalletBalance,
	} from '$lib/utils/basketUtils'
	import { formatPrice, calculateBasketTotal } from '$lib/utils/priceUtils'

	let { data }: { data: PageData } = $props()

	// Initialize payment methods for all baskets
	let paymentMethods = $state(initializePaymentMethods(data.baskets))

	// Calculate grand total
	const grandTotal = $derived(calculateGrandTotal(data.baskets))

	// Alert dialog state
	let showOrderConfirm = $state(false)
	let selectedBasket: any = $state(null)
	let isSubmittingOrder = $state(false)
	let orderError = $state('')

	function openOrderConfirm(basket: any) {
		selectedBasket = basket
		orderError = '' // Clear any previous errors
		showOrderConfirm = true
	}

	async function confirmOrder() {
		if (selectedBasket) {
			isSubmittingOrder = true
			orderError = ''

			// Create form data
			const formData = new FormData()
			formData.append('canteenId', selectedBasket.canteen.id.toString())
			// Send payment method as string
			formData.append(
				'paymentMethod',
				paymentMethods[selectedBasket.canteen.id] ? 'wallet' : 'postpaid',
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
		<BasketHeader basketCount={data.baskets.length} {grandTotal} />

		{#if data.baskets.length === 0}
			<EmptyBasket />
		{:else}
			<!-- Basket Items -->
			<div class="space-y-6">
				{#each data.baskets as basket}
					<BasketCanteenSection
						{basket}
						walletBalance={getWalletBalance(basket.canteen.id, data.wallets)}
						bind:paymentMethod={paymentMethods[basket.canteen.id]}
						onPlaceOrder={openOrderConfirm}
					/>
				{/each}
			</div>
		{/if}
	</div>
</div>

<!-- Order Confirmation Dialog -->
<ConfirmDialog
	bind:open={showOrderConfirm}
	title="Confirm Your Order"
	description={selectedBasket
		? `Place order at ${selectedBasket.canteen.name} for ${formatPrice(calculateBasketTotal(selectedBasket.items))} (${paymentMethods[selectedBasket.canteen.id] ? 'Pay with Wallet' : 'Pay on Collection'})`
		: ''}
	onConfirm={confirmOrder}
	onClose={() => (showOrderConfirm = false)}
	confirmText={isSubmittingOrder ? 'Processing...' : 'Place Order'}
	loading={isSubmittingOrder}
	variant={orderError ? 'danger' : 'primary'}
/>
