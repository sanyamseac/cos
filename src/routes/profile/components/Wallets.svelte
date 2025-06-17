<script lang="ts">
    import { goto } from '$app/navigation'
    import { formatPrice } from '$lib/utils'
    import { Button, ScrollArea } from 'bits-ui'
    import { ChevronRight, ReceiptIndianRupee, Wallet } from 'lucide-svelte'
    import { CashRegister } from 'phosphor-svelte'

    let {data}: { data: any} = $props();
</script>

{#if data.wallets && data.wallets.length > 0}
    <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div class="mb-6 flex items-center gap-3">
                <div class="rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 p-2">
                    <Wallet />
                </div>
                <h3 class="text-lg font-semibold text-gray-800 dark:text-white">
                    Wallet Balances
                </h3>
            </div>
            <div class="space-y-3">
                {#each data.wallets as { wallet, canteen }}
                    <div class="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
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
                <div class="mt-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-900">
                    <div class="flex items-center justify-between">
                        <span class="font-medium text-blue-800 dark:text-blue-200">Total Balance</span>
                        <span class="text-xl font-bold text-blue-800 dark:text-blue-200">
                            {formatPrice(data.wallets.reduce((sum:any, w:any) => sum + parseFloat(w.wallet.balance), 0))}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div class="mb-6 flex items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                    <div class="rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 p-2">
                        <ReceiptIndianRupee/>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-white">
                        Recent Transactions
                    </h3>
                </div> 
                <Button.Root 
                    onclick={() => goto('/profile/transactions')} 
                    class="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:border-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:border-gray-500"
                >
                    View All
                    <ChevronRight size={16} />
                </Button.Root>
            </div>
            <div class="space-y-4">
                {#if data.recentTransactions && data.recentTransactions.length > 0}
                    <ScrollArea.Root
                        class="relative overflow-hidden"
                        >
                        <ScrollArea.Viewport class="h-full max-h-[300px] w-full space-y-2">
                        {#each data.recentTransactions as { transaction, canteen }}
                            <div class="flex mb-3 items-center justify-between rounded-lg border border-gray-100 p-3 dark:border-gray-600 mr-4">
                                <div class="flex-1">
                                    <p class="font-medium text-gray-800 dark:text-white">
                                        {canteen?.name || 'Unknown Canteen'}
                                    </p>
                                    <p class="text-sm text-gray-600 dark:text-gray-400">
                                        {transaction.reference || 'No reference'}
                                    </p>
                                    <p class="text-xs text-gray-500">
                                        {new Date(transaction.createdAt).toLocaleDateString('en-IN', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                                <div class="text-right">
                                    <p class="font-bold {parseFloat(transaction.amount) > 0 ? 'text-green-600' : 'text-red-700'}">
                                        {formatPrice(Math.abs(parseFloat(transaction.amount)))}
                                    </p>
                                </div>
                            </div>
                        {/each}
                        </ScrollArea.Viewport>
                        <ScrollArea.Scrollbar
                            orientation="vertical"
                            class="hover:bg-dark-100 data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out-0 data-[state=visible]:fade-in-0 flex w-2.5 touch-none select-none rounded-full border-l border-l-transparent p-px transition-all duration-200 hover:w-3"
                        >
                            <ScrollArea.Thumb class="bg-muted-foreground flex-1 rounded-full" />
                        </ScrollArea.Scrollbar>
                        <ScrollArea.Scrollbar
                            orientation="horizontal"
                            class="bg-muted hover:bg-dark-10 flex h-2.5 touch-none select-none rounded-full border-t border-t-transparent p-px transition-all duration-200 hover:h-3 "
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
    </div>
{:else}
    <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div class="py-8 text-center">
            <div class="mx-auto mb-4 w-fit rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 p-3">
                <div class="h-6 w-6 font-bold text-white">₹</div>
            </div>
            <h3 class="mb-2 text-lg font-semibold text-gray-800 dark:text-white">
                No Wallet Found
            </h3>
            <p class="text-gray-600 dark:text-gray-400">
                Your wallet will be created when you make your first transaction.
            </p>
        </div>
    </div>
{/if}