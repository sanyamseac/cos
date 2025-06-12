<script lang="ts">
	import { Button } from 'bits-ui'
	import { Trash2 } from 'lucide-svelte'
	import { enhance } from '$app/forms'
	import BasketItem from './BasketItem.svelte'
	import PaymentMethodSelector from './PaymentMethodSelector.svelte'
	import { calculateBasketTotal, formatPrice } from '$lib/utils/priceUtils'

	let {
		basket,
		walletBalance,
		paymentMethod = $bindable(),
		onPlaceOrder,
	}: {
		basket: any
		walletBalance: number
		paymentMethod: boolean
		onPlaceOrder: (basket: any) => void
	} = $props()

	const basketTotal = $derived(calculateBasketTotal(basket.items))
	const hasSufficientBalance = $derived(walletBalance >= basketTotal)
	const canPlaceOrder = $derived(!paymentMethod || (paymentMethod && hasSufficientBalance))

	function getPaymentMethodText(): string {
		if (!paymentMethod) {
			return 'Place Order (Pay Later)'
		}
		return hasSufficientBalance ? 'Place Order (Wallet)' : 'Insufficient Balance'
	}
</script>

<div class="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
	<!-- Canteen Header -->
	<div
		class="mb-4 flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700"
	>
		<div>
			<h2 class="text-xl font-semibold text-gray-900 dark:text-white">
				{basket.canteen.name}
			</h2>
			<p class="text-sm text-gray-600 dark:text-gray-300">
				{basket.items.length} item{basket.items.length !== 1 ? 's' : ''}
			</p>
			<div class="mt-2 flex items-center gap-4">
				<span class="text-sm text-gray-600 dark:text-gray-300">
					Wallet Balance: <span class="font-medium text-green-600">
						{formatPrice(walletBalance)}
					</span>
				</span>
				{#if !hasSufficientBalance}
					<span
						class="rounded bg-red-50 px-2 py-1 text-xs text-red-600 dark:bg-red-900 dark:text-red-300"
					>
						Insufficient balance
					</span>
				{/if}
			</div>
		</div>
		<div class="flex items-center gap-2">
			<span class="text-lg font-semibold text-gray-900 dark:text-white">
				{formatPrice(basketTotal)}
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
			<BasketItem {item} />
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
					{formatPrice(basketTotal)}
				</p>
			</div>

			<!-- Payment Method Switch -->
			<div class="flex flex-col gap-2 sm:flex-row sm:items-end">
				<PaymentMethodSelector
					canteenId={basket.canteen.id}
					{walletBalance}
					bind:isWalletPayment={paymentMethod}
					{basketTotal}
					{hasSufficientBalance}
				/>
				<!-- Place Order Button -->
				<Button.Root
					onclick={() => onPlaceOrder(basket)}
					disabled={!canPlaceOrder}
					class="w-full rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition-all hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
				>
					{getPaymentMethodText()}
				</Button.Root>
			</div>
		</div>
	</div>
</div>
