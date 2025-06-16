<script lang="ts">
	import { Button } from 'bits-ui'
	import { Trash2, Users, Crown } from 'lucide-svelte'
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
	const isSharedBasket = $derived(
		basket.basketAccess?.members && basket.basketAccess.members.length > 1,
	)

	const itemsByUser = $derived(() => {
		if (!isSharedBasket) return []

		const userGroups = basket.items.reduce((groups: any, item: any) => {
			const userId = item.addedByUser?.id || 'unknown'
			if (!groups[userId]) {
				groups[userId] = {
					user: item.addedByUser || { id: 'unknown', name: 'Unknown User' },
					items: [],
					total: 0,
				}
			}
			groups[userId].items.push(item)
			groups[userId].total += calculateBasketTotal([item])
			return groups
		}, {})

		return Object.values(userGroups)
	})

	function getPaymentMethodText(): string {
		if (!paymentMethod) {
			return 'Place Order (Pay Later)'
		}
		return hasSufficientBalance ? 'Place Order (Wallet)' : 'Insufficient Balance'
	}

	function isOwner(userId: string): boolean {
		return (
			basket.basketAccess?.members?.find((m: any) => m.user.id === userId)?.isOwner || false
		)
	}
</script>

<div class="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
	<div
		class="mb-4 flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700"
	>
		<div>
			<h2 class="text-xl font-semibold text-gray-900 dark:text-white">
				{basket.canteen.name}
			</h2>
			<div class="mt-1 flex items-center gap-3">
				<p class="text-sm text-gray-600 dark:text-gray-300">
					{basket.items.length} item{basket.items.length !== 1 ? 's' : ''}
				</p>
				{#if isSharedBasket}
					<div
						class="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 dark:bg-blue-900/30"
					>
						<Users size={14} class="text-blue-600 dark:text-blue-400" />
						<span class="text-xs text-blue-700 dark:text-blue-300">
							{basket.basketAccess.members.length} member{basket.basketAccess.members
								.length !== 1
								? 's'
								: ''}
						</span>
					</div>
				{/if}
			</div>
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

	<div class="space-y-4">
		{#if isSharedBasket}
			{#each itemsByUser as userGroup}
				<div class="border-l-4 border-indigo-200 pl-4 dark:border-indigo-700">
					<div class="mb-3 flex items-center gap-2">
						{#if isOwner(userGroup.user.id)}
							<Crown size={16} class="text-yellow-500" />
						{/if}
						<h4 class="font-medium text-gray-900 dark:text-white">
							{userGroup.user.name}
							{#if isOwner(userGroup.user.id)}
								<span class="text-xs text-yellow-600 dark:text-yellow-400"
									>(Owner)</span
								>
							{/if}
						</h4>
						<span class="text-sm text-gray-500 dark:text-gray-400">
							• {formatPrice(userGroup.total)}
						</span>
					</div>
					<div class="space-y-2">
						{#each userGroup.items as item}
							<BasketItem {item} showAddedBy={false} />
						{/each}
					</div>
				</div>
			{/each}
		{:else}
			{#each basket.items as item}
				<BasketItem {item} />
			{/each}
		{/if}
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

			<div class="flex flex-col gap-2 sm:flex-row sm:items-end">
				<PaymentMethodSelector
					canteenId={basket.canteen.id}
					{walletBalance}
					bind:isWalletPayment={paymentMethod}
					{basketTotal}
					{hasSufficientBalance}
				/>
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
