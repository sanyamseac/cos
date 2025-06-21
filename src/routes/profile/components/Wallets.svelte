<script lang="ts">
	import { goto } from '$app/navigation'
	import { formatPrice } from '$lib/utils'
	import { Button, ScrollArea } from 'bits-ui'
	import { ChevronRight, ReceiptIndianRupee, Wallet } from 'lucide-svelte'
	import { CashRegister } from 'phosphor-svelte'

	let { data }: { data: any } = $props()
</script>

{#if data.wallets && data.wallets.length > 0}
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div>
			<div class="mb-6 flex items-center gap-3 border-b dark:border-gray-600 w-max">
				<h3 class="text-lg font-semibold text-gray-800 dark:text-white">Wallet Balances</h3>
			</div>
			<div class="space-y-3">
				{#each data.wallets as { wallet, canteen }}
					<div
						class="flex items-center justify-between rounded-lg px-2"
					>
						<div>
							<p class="font-medium text-gray-800 dark:text-white">
								{canteen?.name || 'Unknown Canteen'}
							</p>
							<p class="text-sm text-gray-600 dark:text-gray-400">
								{canteen?.acronym || ''}
							</p>
						</div>
						<div class="text-right">
							<p class="font-bold text-green-600 dark:text-green-400">
								{formatPrice(wallet.balance)}
							</p>
							<p class="text-xs text-gray-500">
								Updated: {new Date(wallet.updatedAt).toLocaleDateString()}
							</p>
						</div>
					</div>
				{/each}
				<div class="mt-4 rounded-lg bg-green-100 p-3 dark:bg-green-700">
					<div class="flex items-center justify-between">
						<span class="font-medium text-blue-800 dark:text-blue-200"
							>Total Balance</span
						>
						<span class="text-xl font-bold text-blue-800 dark:text-blue-200">
							{formatPrice(
								data.wallets.reduce(
									(sum: any, w: any) => sum + parseFloat(w.wallet.balance),
									0,
								),
							)}
						</span>
					</div>
				</div>
			</div>
		</div>

		<div>
			<div class="flex items-center justify-between mb-6">
				<div class="flex items-center gap-3 border-b dark:border-gray-600 w-max">
					<h3 class="text-lg font-semibold text-gray-800 dark:text-white">Recent Transactions</h3>
				</div>
				<Button.Root
					onclick={() => goto('/profile/transactions')}
					class="flex items-center gap-2 rounded-lg border border-gray-300 shadow px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:bg-gray-700"
				>
					View All
					<ChevronRight size={16} />
				</Button.Root>
			</div>
			{#if data.recentTransactions && data.recentTransactions.length > 0}
				<ScrollArea.Root class="relative overflow-hidden">
					<ScrollArea.Viewport class="rounded-xl h-full max-h-[300px] w-full space-y-2 bg-white py-2 px-4 dark:bg-gray-800 shadow-sm">
						{#each data.recentTransactions as { transaction, canteen }}
							<div
								class="mb-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 py-2 last:border-0"
							>
								<div class="flex-1">
									<p class="font-medium text-gray-800 dark:text-white">
										{canteen?.name || 'Unknown Canteen'}
									</p>
									<p class="text-sm text-gray-600 dark:text-gray-400">
										{transaction.reference || 'No reference'}
									</p>
									<p class="text-xs text-gray-500">
										{new Date(transaction.createdAt).toLocaleDateString(
											'en-IN',
											{
												year: 'numeric',
												month: 'short',
												day: 'numeric',
												hour: '2-digit',
												minute: '2-digit',
											},
										)}
									</p>
								</div>
								<div class="text-right">
									<p
										class="font-bold {parseFloat(transaction.amount) > 0
											? 'text-green-600'
											: 'text-red-700'}"
									>
										{formatPrice(Math.abs(parseFloat(transaction.amount)))}
									</p>
								</div>
							</div>
						{/each}
					</ScrollArea.Viewport>
					<ScrollArea.Scrollbar
						orientation="vertical"
						class="hover:bg-dark-100 data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out-0 data-[state=visible]:fade-in-0 flex w-2.5 touch-none rounded-full border-l border-l-transparent p-px transition-all duration-200 select-none hover:w-3"
					>
						<ScrollArea.Thumb class="bg-muted-foreground flex-1 rounded-full" />
					</ScrollArea.Scrollbar>
					<ScrollArea.Scrollbar
						orientation="horizontal"
						class="bg-muted hover:bg-dark-10 flex h-2.5 touch-none rounded-full border-t border-t-transparent p-px transition-all duration-200 select-none hover:h-3 "
					>
						<ScrollArea.Thumb class="bg-muted-foreground rounded-full" />
					</ScrollArea.Scrollbar>
					<ScrollArea.Corner />
				</ScrollArea.Root>
			{:else}
				<div class="py-8 text-center text-gray-500">
					<p>No transactions found</p>
				</div>
			{/if}
		</div>
	</div>	
{:else}
	<div class="text-center">
		<ReceiptIndianRupee size={50} class="text-gray-400 mx-auto mt-16 mb-8" />
		<h3 class="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Your wallets found</h3>
		<p class="text-gray-600 dark:text-gray-300">
			Wallet will be created when you make your first transaction.
		</p>
	</div>
{/if}
