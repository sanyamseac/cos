<script lang="ts">
	import { Switch } from 'bits-ui'
	import { CreditCard, Wallet } from 'lucide-svelte'
	import { formatPrice } from '$lib/utils/priceUtils'

	let {
		canteenId,
		walletBalance,
		isWalletPayment = $bindable(),
		basketTotal,
		hasSufficientBalance,
	}: {
		canteenId: number
		walletBalance: number
		isWalletPayment: boolean
		basketTotal: number
		hasSufficientBalance: boolean
	} = $props()
</script>

<div class="flex flex-col gap-1">
	<label
		for={'payment-method-switch-' + canteenId}
		class="text-xs font-medium text-gray-600 dark:text-gray-300"
	>
		Payment Method
	</label>
	<div
		class="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
	>
		<div
			class="flex items-center gap-2 text-sm {isWalletPayment
				? 'text-gray-400'
				: 'text-gray-900 dark:text-white'}"
		>
			<CreditCard size={16} />
			<span>Pay Later</span>
		</div>
		<Switch.Root
			id={'payment-method-switch-' + canteenId}
			bind:checked={isWalletPayment}
			class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none data-[state=checked]:bg-green-600"
		>
			<Switch.Thumb
				class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out data-[state=checked]:translate-x-4"
			/>
		</Switch.Root>
		<div
			class="flex items-center gap-2 text-sm {isWalletPayment
				? 'text-gray-900 dark:text-white'
				: 'text-gray-400'}"
		>
			<Wallet size={16} />
			<span>Wallet</span>
			<span class="text-xs text-green-600">
				({formatPrice(walletBalance)})
			</span>
		</div>
	</div>
</div>

<!-- Payment method info -->
{#if isWalletPayment && !hasSufficientBalance}
	<div class="mt-3 rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
		<p class="text-sm text-red-600 dark:text-red-400">
			Insufficient wallet balance. Current balance: {formatPrice(walletBalance)} | Required: {formatPrice(
				basketTotal,
			)}
		</p>
	</div>
{:else if !isWalletPayment}
	<div class="mt-3 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
		<p class="text-sm text-blue-600 dark:text-blue-400">
			<CreditCard size={16} class="mr-1 inline" />
			Payment will be collected when you collect your order.
		</p>
	</div>
{/if}
