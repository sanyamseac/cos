<script lang="ts">
    import BasketItem from './BasketItem.svelte'
	import { Trash2, UserMinus, Users, Share, CreditCard, Wallet, Share2, Ellipsis } from 'lucide-svelte'
	import { goto, invalidateAll } from '$app/navigation'
	import { enhance } from '$app/forms'
    import { formatPrice, calculateBasketTotal } from '$lib/utils/priceUtils'
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte'
	import { Switch } from 'bits-ui'
	import ShareBasket from './ShareBasket.svelte'
    import { DropdownMenu } from "bits-ui";

    let { canteenGroup, wallet, form }: { canteenGroup: any, wallet: any, form:any} = $props() 

    if  (wallet === undefined) {
        wallet = { balance: 0 }
    }

    let paymentMethod = $state(wallet.balance >= calculateBasketTotal(canteenGroup.allItems))
    let showOrderConfirm = $state(false)
    let formRef: HTMLFormElement
    let Error: any = $state(null)
    let showShareModal = $state(false)
    let clearBasket: HTMLFormElement
    let shareBasket: HTMLFormElement
    let unShareBasket: HTMLFormElement

    function openOrderConfirm(canteenGroup: any) {
		showOrderConfirm = true
	}

    function orderConfirm() {
        if (formRef) {
            formRef.requestSubmit()
        }
    }

    const allItemsAvailable = $derived(
        canteenGroup.allItems.filter((item: any) => item.menuItem.available === false
            || item.variant?.available === false
            || item.addons?.filter((addon:any) => addon.available === false).length > 0).length === 0
    )
</script>
<div>
    <div
        class="mb-4 flex items-center justify-between pb-4"
    >
        <div>
            <div class="mb-1 flex items-center gap-2">
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
                    {canteenGroup.canteen.name}
                </h2>
                {#if canteenGroup.isShared}
                    <span
                        class="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-500/30 dark:text-green-500"
                    >
                        <Users size={14} />
                        <span class="hidden sm:inline">Shared Basket</span>
                    </span>
                {/if}
            </div>
            <div class="mt-1 flex items-center gap-3">
                <p class="text-sm text-gray-600 dark:text-gray-300">
                    {canteenGroup.totalItems} item{canteenGroup.totalItems !== 1
                        ? 's'
                        : ''}
                </p>
                {#if canteenGroup.baskets.length > 1}
                    <div
                        class="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 dark:bg-gray-700"
                    >
                        <span class="text-xs text-gray-700 dark:text-gray-300">
                            {canteenGroup.baskets.length} basket{canteenGroup
                                .baskets.length !== 1
                                ? 's'
                                : ''}
                        </span>
                    </div>
                {/if}
            </div>
        </div>
        <div class="flex items-center gap-2">
            <DropdownMenu.Root>
                <DropdownMenu.Trigger
                    class="text-foreground hover:bg-gray-700 inline-flex h-10 w-10 select-none items-center justify-center rounded-lg text-sm font-medium active:scale-[0.98]"
                >
                    <Ellipsis class="text-foreground h-6 w-6" />
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                    <DropdownMenu.Content
                    class="z-40 bg-gray-100 dark:bg-gray-700 shadow-popover outline-hidden focus-visible:outline-hidden w-max rounded-xl border px-1 mr-4 py-1.5"
                    sideOffset={8}
                    >
                    {#if canteenGroup.isShared}
                        <DropdownMenu.Item
                            class="rounded-button outline-none data-highlighted:bg-gray-800 ring-0! ring-transparent! flex h-10 select-none items-center py-3 px-3 text-sm font-medium focus-visible:outline-none hover:bg-gray-400 dark:hover:bg-gray-800"
                        >
                            <button
                                onclick={() => unShareBasket?.requestSubmit()}
                                class="flex items-center text-base gap-3 outline-none"
                            >
                                <UserMinus size={20} />
                                Leave Basket
                            </button>
                        </DropdownMenu.Item>
                    {/if}
                    <DropdownMenu.Item
                        class="rounded-button data-highlighted:bg-gray-800 ring-0! ring-transparent! flex h-10 select-none items-center py-3 px-3 text-sm font-medium focus-visible:outline-none hover:bg-gray-400 dark:hover:bg-gray-800"
                    >
                        <button
                            onclick={() => canteenGroup.isShared
                                ? (showShareModal = true)
                                : shareBasket?.requestSubmit()}
                            class="flex items-center text-base gap-3 outline-none"
                        >
                            <Share2 size={20} />
                            Share Basket
                        </button>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                        class="rounded-button data-highlighted:bg-gray-800 ring-0! ring-transparent! flex h-10 select-none items-center py-3 px-3 text-sm font-medium focus-visible:outline-none hover:bg-gray-400 dark:hover:bg-gray-800"
                    >
                        <button
                            onclick={() => clearBasket?.requestSubmit()}
                            class="flex items-center text-base gap-3 outline-none"
                        >
                            <Trash2 size={20} />
                            Clear Basket
                        </button>
                    </DropdownMenu.Item>
                </DropdownMenu.Content>
                </DropdownMenu.Portal>
            </DropdownMenu.Root>
        </div>
    </div>

    <form bind:this={unShareBasket} method="POST" action="?/leaveBasket" use:enhance={() => invalidateAll()}>
        <input
            type="hidden"
            name="canteenId"
            value={canteenGroup.canteen.id}
        />
    </form>

    <form bind:this={shareBasket} method="POST" action="?/shareBasket" use:enhance=
        {() => {
            return async ({ result }) => {
                if (result.type === 'success') {
                    invalidateAll()
                    showShareModal = true
                } else if (result.type === 'failure' && result.data) {
                    alert(result.data?.error || 'Failed to share basket')
                }
            }
        }}
    >
        <input
            type="hidden"
            name="canteenId"
            value={canteenGroup.canteen.id}
        />
    </form>

    <form bind:this={clearBasket} method="POST" action="?/clearBasket" use:enhance={() => invalidateAll()}>
        <input
            type="hidden"
            name="canteenId"
            value={canteenGroup.canteen.id}
        />
    </form>

    <div class="space-y-3">
        {#each canteenGroup.allItems as item, index}
            <BasketItem {item} showAddedBy={canteenGroup.isShared} />
        {/each}
    </div>

    <div class="mt-6 pt-4">
        <div
            class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
            <div class="flex flex-row items-center justify-between md:flex-col md:gap-1">
                <p class="text-sm text-gray-600 dark:text-gray-300">
                    Total for {canteenGroup.canteen.name}
                </p>
                <p class="text-xl font-bold text-gray-900 dark:text-white">
                    {formatPrice(calculateBasketTotal(canteenGroup.allItems))}
                </p>
            </div>
            <div class="flex flex-col gap-2 sm:flex-row sm:items-end">
                <div class="flex flex-col gap-1">
                    <div
                        class="flex items-center gap-3 rounded-lg"
                    >
                        <div
                            class="flex items-center gap-2 text-sm {paymentMethod
                                ? 'text-gray-400'
                                : 'text-gray-900 dark:text-white'}"
                        >
                            <span>Pay Later</span>
                        </div>
                        <Switch.Root
                            id={'payment-method-switch-' + canteenGroup.canteen.id}
                            bind:checked={paymentMethod}
                            class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none data-[state=checked]:bg-green-600"
                        >
                            <Switch.Thumb
                                class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out data-[state=checked]:translate-x-4"
                            />
                        </Switch.Root>
                        <div
                            class="flex items-center gap-2 text-sm {paymentMethod
                                ? 'text-gray-900 dark:text-white'
                                : 'text-gray-400'}"
                        >
                            <span>Wallet</span>
                            <span class="text-xs text-green-600">
                                ({formatPrice(wallet.balance)})
                            </span>
                        </div>
                    </div>
                </div>
                <button
                    onclick={() => openOrderConfirm(canteenGroup)}
                    disabled={(paymentMethod &&
                        wallet.balance < calculateBasketTotal(canteenGroup.allItems)) ||
                        !canteenGroup.canteen.open ||
                        !allItemsAvailable
                        }
                    class="w-full rounded-lg bg-green-500 dark:bg-green-700 px-4 mt-4 py-2 font-medium transition-all hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                    {canteenGroup.canteen.open
                        ? allItemsAvailable
                            ? paymentMethod
                                ? wallet.balance >= calculateBasketTotal(canteenGroup.allItems)
                                    ? 'Place Order (Wallet)'
                                    : 'Insufficient Balance'
                                : 'Place Order (Pay Later)'
                            : 'Some items are unavailable'
                        : 'Canteen Closed'}
                </button>
            </div>
        </div>
    </div>
</div>

<form bind:this={formRef} method="POST" action="?/placeOrder" use:enhance={() => {
        return async ({ result }) => {
            if (result.type === 'success') {
                goto('/orders')
            } else if (result.type === 'failure' && result.data) {
                Error= result.data.error || 'Failed to place order'
            }
        }}}
    >
    <input type="hidden" name="canteenId" value={canteenGroup.canteen.id} />
    <input type="hidden" name="paymentMethod" value={paymentMethod ? 'wallet' : 'postpaid'} />
    <input type="hidden" name="accessCode" value={canteenGroup.accessCode} />
</form>

{#if Error}
    <div class="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
        <p class="text-sm text-red-700 dark:text-red-300">{Error}</p>
    </div>
{/if}

<ConfirmDialog
	bind:open={showOrderConfirm}
	title="Confirm Your Order"
	description={canteenGroup
		? `Place order at ${canteenGroup.canteen.name} for ${formatPrice(calculateBasketTotal(canteenGroup.allItems))} (${paymentMethod ? 'Pay with Wallet' : 'Pay on Collection'})`
		: ''}
	onConfirm={() => orderConfirm()}
	onClose={() => (showOrderConfirm = false)}
	confirmText="Place Order"
	variant="primary"
/>

<ShareBasket
	bind:open={showShareModal}
	canteenName={canteenGroup.canteen.name}
	accessCode={canteenGroup.accessCode}
	error={form?.error || ''}
/>