<script lang="ts">
	import FoodType from "$lib/components/FoodType.svelte"
	import { formatPrice } from "$lib/utils"
	import { fly } from "svelte/transition"

    let { data } = $props();
</script>
<div class="lg:col-span-2">
    <div
        class="transition-all duration-300"
        in:fly={{ y: 20, delay: 200, duration: 300 }}
    >
        <div class="">
            <div class="space-y-4">
                {#each data.orderItems || [] as item, index}
                    <div
                        class="border-b border-gray-200 dark:border-gray-700"
                    >
                        <div
                            class="mb-3 flex items-start justify-between gap-4"
                        >
                            <div class="flex items-center items-start gap-2">
                                <img
                                    src={item.menuItem?.image ||
                                        '/default-item.png'}
                                    alt={item.menuItem?.name || 'Unknown Item'}
                                    class="h-12 w-12 rounded"
                                />
                                <div class="min-w-0 flex-1">
                                    <div class="mt-3 mb-1 flex items-center gap-2">
                                        <h3
                                            class="ml-1 truncate text-base font-semibold text-gray-900 sm:text-lg dark:text-white"
                                        >
                                            {item.menuItem?.name || 'Unknown Item'}
                                        </h3>
                                        <FoodType
                                            type={item.menuItem?.type}
                                            size={20}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div class="flex-shrink-0 text-right">
                                <div
                                    class="text-lg font-bold text-gray-900 dark:text-white"
                                >
                                    {formatPrice(item.orderItem.subtotal)}
                                </div>
                                <div
                                    class="text-xs text-gray-500 dark:text-gray-400"
                                >
                                    {item.orderItem.quantity} × {formatPrice(
                                        Number(item.orderItem.subtotal) /
                                            item.orderItem.quantity,
                                    )}
                                </div>
                            </div>
                        </div>

                        <div class="mb-4 space-y-2">
                            {#if item.variant}
                                <div
                                    class="flex items-center justify-between text-sm"
                                >
                                    <span class="text-gray-600 dark:text-gray-300"
                                        >{item.variant.name}</span
                                    >
                                    <span
                                        class="font-medium text-gray-900 dark:text-white"
                                    >
                                        {formatPrice(
                                            Number(item.menuItem?.price) +
                                                Number(item.variant.price),
                                        )}
                                    </span>
                                </div>
                            {/if}

                            {#if item.addons.length > 0}
                                <div class="text-sm">
                                    <span
                                        class="mb-1 block text-gray-600 dark:text-gray-300"
                                        >Add-ons:</span
                                    >
                                    <div
                                        class="space-y-1 border-l-2 border-gray-200 pl-2 dark:border-gray-600"
                                    >
                                        {#each item.addons as addon}
                                            <div
                                                class="flex items-center justify-between"
                                            >
                                                <div>
                                                    <span
                                                        class="text-gray-700 dark:text-gray-300"
                                                        >{addon.addon?.name}</span
                                                    >
                                                    <FoodType
                                                        type={addon.addon?.type}
                                                        size={14}
                                                        class="inline"
                                                    />
                                                </div>
                                                <span
                                                    class="font-medium text-gray-900 dark:text-white"
                                                >
                                                    {formatPrice(
                                                        addon.addon?.price || 0,
                                                    )}
                                                </span>
                                            </div>
                                        {/each}
                                    </div>
                                </div>
                            {/if}
                        </div>
                    </div>
                {/each}
            </div>

            <div class="mt-6 pt-4">
                <div
                    class="flex justify-between text-lg font-bold text-gray-900 dark:text-white"
                >
                    <span>Total Amount</span>
                    <span>{formatPrice(data.order.totalAmount)}</span>
                </div>
            </div>
        </div>
    </div>
</div>