<script lang="ts">
	import { Button } from 'bits-ui'
	import { formatPrice } from '$lib/utils'
	import { Lightning } from 'phosphor-svelte'
	import { Plus } from 'lucide-svelte'
	import { goto } from '$app/navigation'
	import { enhance } from '$app/forms'

	interface QuickOrder {
		id: number
		variantId: number
		name: string
		price: number
		canteen: string
		image: string
		canteenAcronym: string
	}

	interface Props {
		quickOrders: QuickOrder[]
	}

	let { quickOrders }: Props = $props()
</script>

<div
>
	<div class="mb-6 flex items-center justify-between">
		<div class="flex items-center gap-3">
			<div class="p-2">
				<Lightning class="text-lg dark:text-white" />
			</div>
			<h3 class="text-lg font-semibold text-gray-800 dark:text-white">Quick Orders</h3>
		</div>
	</div>
	<div class="grid grid-cols-2 md:grid-cols-3 gap-4">
		{#each quickOrders as order, index}
			<div class="group relative">
				<div
					class="flex flex-col items-center p-4 transition-all duration-3000 hover:scale-105 hover:shadow-lg hover:rounded-lg transform"
				>
					<div class="mb-2 text-3xl">
						<img src={order.image} alt={order.name} class="h-20 w-20 rounded cursor-pointer" 
						onclick={() => goto(`/menu/${order.canteenAcronym}#${order.name}`)}/>
					</div>
					<p class="mb-1 text-center text-sm font-medium text-gray-800 dark:text-white">
						{order.name}
					</p>
					<p class="mb-2 text-xs text-gray-500 dark:text-gray-400">{order.canteen}</p>
					<div class="flex w-full items-center justify-between">
						<span class="font-bold text-gray-800 dark:text-white"
							>{formatPrice(order.price)}</span
						>
						<form method="post" action={`/menu/${order.canteenAcronym}?/addToBasket`} use:enhance={() => goto('/basket')}>
							<input type="hidden" name="menuItemId" value={order.id} />
							<input type="hidden" name="variantId" value={order.variantId} />
							<Button.Root
								type="submit"
								class="h-6 rounded cursor-pointer border shadows px-3 text-xs dark:text-white hover:from-indigo-600 hover:to-purple-700"
							>
								<Plus size="15" class="inline-block" />
							</Button.Root>
						</form>
					</div>
				</div>

				{#if index % 2 === 0 && index < quickOrders.length - 1}
					<div class="absolute -right-2 top-1/2 h-20 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent dark:via-gray-600 transform -translate-y-1/2 -translate-y-14 block md:hidden"></div>
				{/if}
				{#if (index + 1) % 3 !== 0 && index < quickOrders.length - 1}
					<div class="absolute -right-2 top-1/2 h-20 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent dark:via-gray-600 transform -translate-y-1/2 -translate-y-14 hidden md:block"></div>
				{/if}

				{#if index < quickOrders.length - 2 && Math.floor(index / 2) < Math.floor((quickOrders.length - 1) / 2)}
					<div class="absolute -bottom-2 left-1/2 w-20 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600 transform -translate-x-1/2 md:hidden"></div>
				{/if}
				{#if index < quickOrders.length - 3 && Math.floor(index / 3) < Math.floor((quickOrders.length - 1) / 3)}
					<div class="absolute -bottom-2 left-1/2 w-20 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600 transform -translate-x-1/2 hidden md:block"></div>
				{/if}
			</div>
		{/each}
	</div>
</div>
