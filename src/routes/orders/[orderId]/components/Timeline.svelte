<script lang="ts">
	import OrderStatus from "$lib/components/OrderStatus.svelte"
	import { fly } from "svelte/transition"

    let { data, order } = $props()

    function getTimelineSteps(currentStatus: string, order: any) {
		const allSteps = [
			{
				status: 'pending',
				label: 'Order Placed',
				description: 'Your order has been placed successfully',
				timestamp: order.createdAt,
				completed: true,
			},
			{
				status: 'confirmed',
				label: 'Order Confirmed',
				description: 'Your order has been confirmed by the canteen',
				timestamp: order.confirmedAt,
				completed: ['confirmed', 'preparing', 'ready', 'completed'].includes(currentStatus),
			},
			{
				status: 'preparing',
				label: 'Preparing',
				description: 'Your order is being prepared',
				timestamp: order.preparedAt,
				completed: ['preparing', 'ready', 'completed'].includes(currentStatus),
			},
			{
				status: 'ready',
				label: 'Ready for Pickup',
				description: 'Your order is ready for pickup',
				timestamp: order.readyAt,
				completed: ['ready', 'completed'].includes(currentStatus),
			},
			{
				status: 'completed',
				label: 'Order Completed',
				description: 'Your order has been delivered/picked up',
				timestamp: order.completedAt,
				completed: currentStatus === 'completed',
			},
		]

		if (currentStatus === 'cancelled') {
			return [
				allSteps[0],
				{
					status: 'cancelled',
					label: 'Order Cancelled',
					description: 'Your order has been cancelled',
					timestamp: order.cancelledAt,
					completed: true,
				},
			]
		}

		return allSteps
	}

	const timelineSteps = $derived(getTimelineSteps(order.status, data.order))

    function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('en-IN', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		})
	}
</script>
<div class="lg:col-span-1">
    <div
        class="transition-all duration-300 dark:border-gray-700"
        in:fly={{ y: 20, delay: 100, duration: 300 }}
    >
        <div class="">
            <div class="">
                {#each timelineSteps as step, index}
                    <div class="flex gap-3">
                        <div class="flex flex-col items-center">
                            <div
                                class="flex h-8 w-8 items-center justify-center rounded-full {step.completed
                                    ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300'
                                    : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'}"
                            >
                                <OrderStatus status={step.status} size={14} />
                            </div>
                            {#if index < timelineSteps.length - 1}
                                <div
                                    class="h-14 w-px {step.completed
                                        ? 'bg-green-200 dark:bg-green-800'
                                        : 'bg-gray-200 dark:bg-gray-600'}"
                                ></div>
                            {/if}
                        </div>
                        <div class="min-w-0 flex-1 pb-4">
                            <h4
                                class="text-sm font-medium {step.completed
                                    ? 'text-gray-900 dark:text-white'
                                    : 'text-gray-500 dark:text-gray-400'}"
                            >
                                {step.label}
                            </h4>
                            <p class="text-xs text-gray-500 dark:text-gray-400">
                                {step.description}
                            </p>
                            {#if step.timestamp}
                                <p
                                    class="mt-1 text-xs text-gray-400 dark:text-gray-500"
                                >
                                    {formatDate(step.timestamp)}
                                </p>
                            {/if}
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    </div>
</div>