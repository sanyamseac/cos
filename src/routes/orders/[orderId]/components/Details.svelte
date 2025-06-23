<script lang="ts">
	import { formatPrice } from "$lib/utils/priceUtils"
	import { Toggle } from "bits-ui"
	import { Calendar, CreditCard, Eye, EyeOff, MapPin, Receipt, Wallet } from "lucide-svelte"
	import { onMount } from "svelte"
	import { fly } from "svelte/transition"

    let { data } = $props()
    let showPin = $state(false)
    let currentDate = $state(new Date().getTime())

    function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('en-IN', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		})
	}

    let totalWaitingTimeLeft = $derived(Math.ceil(data.order.totalWaitingTime/60) - Math.floor((currentDate - data.order.createdAt) / (1000 * 60)))
    let waitingTimeLeft = $derived(Math.ceil(data.order.waitingTime/60) - Math.floor((currentDate - data.order.preparingAt) / (1000 * 60)))

    onMount(() => {
        const interval = setInterval(() => {
            currentDate = new Date().getTime()
        }, 10000)

        return () => clearInterval(interval)
    })
</script>

<div
    class="transition-all duration-300 dark:border-gray-700"
    in:fly={{ y: 20, duration: 300 }}
>
    <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
            <div
                class="grid grid-cols-1 gap-3 text-sm text-gray-600 md:grid-cols-2 dark:text-gray-300"
            >
                <div class="flex items-center gap-2">
                    <MapPin size={16} class="text-gray-400" />
                    {data.canteen?.name || 'Unknown Canteen'}
                </div>
                <div class="flex items-center gap-2">
                    <Calendar size={16} class="text-gray-400" />
                    {formatDate(data.order.createdAt.toString())}
                </div>
                <div class="flex items-center gap-2">
                    {#if data.order.prepaid}
                        <Wallet size={16} class="text-gray-400" />
                        Wallet
                    {:else}
                        <CreditCard size={16} class="text-gray-400" />
                        Pay on Delivery
                    {/if}
                </div>
                <div class="flex items-center gap-2">
                    <Receipt size={16} class="text-gray-400" />
                    <span class="font-semibold text-gray-900 dark:text-white">
                        {formatPrice(data.order.totalAmount)}
                    </span>
                </div>
                <div class="flex items-center gap-2">
                    <span class="font-semibold text-gray-900 dark:text-white">
                        {#if data.order.status === 'completed'}
                            Completed
                        {:else if data.order.status === 'cancelled'}
                            Cancelled
                        {:else if data.order.status === 'ready'}
                            Ready for Pickup
                        {:else if waitingTimeLeft > 1 && data.order.status === 'preparing'}
                            {waitingTimeLeft} mins
                        {:else if data.order.status === 'preparing'}
                            Almost Ready
                        {:else if totalWaitingTimeLeft > 2 && ['pending', 'confirmed'].includes(data.order.status)}
                            {totalWaitingTimeLeft} mins remaining
                        {:else if totalWaitingTimeLeft > 0 && ['pending', 'confirmed'].includes(data.order.status)}
                            2 mins
                        {:else if totalWaitingTimeLeft > -2 && ['pending', 'confirmed'].includes(data.order.status)}
                            1 min
                        {:else if totalWaitingTimeLeft <= -2 && totalWaitingTimeLeft > -20 && ['pending', 'confirmed'].includes(data.order.status)}
                            Delayed
                        {:else if ['pending', 'confirmed'].includes(data.order.status)}
                            The order is too delayed, please contact canteen (A complaint will automatically be created with Stall Comm)
                        {:else}
                            Unknown Status
                        {/if}
                    </span>
                </div>
            </div>
        </div>

        <div>
            <div class="flex items-center gap-3">
                <h3 class="font-medium text-gray-900 dark:text-white">
                    Pickup PIN
                </h3>
                <div class="flex items-center gap-2">
                    <span
                        class="font-mono text-lg font-bold text-gray-900 dark:text-white"
                    >
                        {showPin ? data.order.otp : '••••'}
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
    </div>
</div>