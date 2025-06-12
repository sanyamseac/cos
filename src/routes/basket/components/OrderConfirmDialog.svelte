<script lang="ts">
	import { Button, AlertDialog } from 'bits-ui'
	import { formatPrice, calculateBasketTotal } from '$lib/utils/priceUtils'

	let {
		open = $bindable(),
		basket,
		paymentMethod,
		onConfirm,
		isSubmitting = false,
		error = '',
	}: {
		open: boolean
		basket: any | null
		paymentMethod: boolean
		onConfirm: () => Promise<void>
		isSubmitting?: boolean
		error?: string
	} = $props()

	const basketTotal = $derived(basket ? calculateBasketTotal(basket.items) : 0)
</script>

<AlertDialog.Root bind:open>
	<AlertDialog.Portal>
		<AlertDialog.Overlay
			class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50"
		/>
		<AlertDialog.Content
			class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] fixed top-[50%] left-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border border-gray-200 bg-white p-6 shadow-lg duration-200 dark:border-gray-700 dark:bg-gray-800"
		>
			<div class="flex flex-col space-y-2 text-center sm:text-left">
				<AlertDialog.Title class="text-lg font-semibold text-gray-900 dark:text-white">
					Confirm Order
				</AlertDialog.Title>
				<AlertDialog.Description class="text-sm text-gray-500 dark:text-gray-400">
					{#if basket}
						Are you sure you want to place this order for {basket.canteen.name}? Total
						amount: {formatPrice(basketTotal)}
						{#if paymentMethod}
							(to be paid from wallet)
						{:else}
							(to be paid on pickup)
						{/if}
					{/if}
				</AlertDialog.Description>
				{#if error}
					<div
						class="mt-2 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20"
					>
						<p class="text-sm text-red-600 dark:text-red-400">{error}</p>
					</div>
				{/if}
			</div>
			<div class="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
				<AlertDialog.Cancel>
					{#snippet child({ props })}
						<Button.Root
							{...props}
							class="mt-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
						>
							Cancel
						</Button.Root>
					{/snippet}
				</AlertDialog.Cancel>
				<AlertDialog.Action>
					{#snippet child({ props })}
						<Button.Root
							{...props}
							onclick={onConfirm}
							disabled={isSubmitting}
							class="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{isSubmitting ? 'Processing...' : 'Confirm Order'}
						</Button.Root>
					{/snippet}
				</AlertDialog.Action>
			</div>
		</AlertDialog.Content>
	</AlertDialog.Portal>
</AlertDialog.Root>
