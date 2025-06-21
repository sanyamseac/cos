<script lang="ts">
    import { goto } from '$app/navigation';
    import { formatPrice } from '$lib/utils/priceUtils';
    import { ChevronRight } from 'lucide-svelte';

    let { order } = $props()
    function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('en-IN', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		})
	}
</script>
<div
    class="cursor-pointer border-b transition-all duration-300 hover:shadow-xl dark:border-gray-500"
    onclick={() => goto(`/orders/${order.id}`)}
>
    <div
        class="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between"
    >
        <div class="flex-1">
            <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h3
                    class="text-lg font-semibold text-gray-900 dark:text-white"
                >
                    Order {order.orderNumber}
                </h3>
                <ChevronRight
                    class="h-7 w-7 text-gray-500 transition-transform duration-200 group-hover:translate-x-1"
                />
            </div>
            <div class="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                <span
                    class="font-bold capitalize"
                >
                    {order.status}
                </span>
                <p class="flex items-center gap-2 mt-1">
                    <span class="font-medium">Amount:</span>
                    <span
                        class="font-semibold text-gray-900 dark:text-white"
                    >
                    {order.totalAmount}
                        {formatPrice(order.totalAmount)}
                    </span>
                </p>
                <p class="flex items-center gap-2">
                    {formatDate(order.createdAt.toString())}
                </p>
            </div>
        </div>
    </div>
</div>