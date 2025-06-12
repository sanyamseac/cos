<script lang="ts">
	import { Button } from 'bits-ui'
	import { formatPrice } from '$lib/utils';
	import { Lightning } from 'phosphor-svelte'
	import { Plus } from 'lucide-svelte'

	interface QuickOrder {
		id: number
		name: string
		price: number
		canteen: string
		image: string
	}

	interface Props {
		quickOrders: QuickOrder[]
	}

	let { quickOrders }: Props = $props()
</script>

<div
	class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
>
	<div class="mb-6 flex items-center justify-between">
		<div class="flex items-center gap-3">
			<div class="rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 p-2">
				<Lightning class="text-lg text-white" />
			</div>
			<h3 class="text-lg font-semibold text-gray-800 dark:text-white">Quick Orders</h3>
		</div>
	</div>
	<div class="grid grid-cols-2 gap-4">
		{#each quickOrders as order}
			<div class="group cursor-pointer">
				<div
					class="flex flex-col items-center rounded-xl bg-gray-50 p-4 transition-all duration-200 hover:scale-105 hover:bg-gray-100 dark:bg-gray-700/50 dark:hover:bg-gray-700"
				>
					<div class="mb-2 text-3xl">{order.image}</div>
					<p class="mb-1 text-center text-sm font-medium text-gray-800 dark:text-white">
						{order.name}
					</p>
					<p class="mb-2 text-xs text-gray-500 dark:text-gray-400">{order.canteen}</p>
					<div class="flex w-full items-center justify-between">
						<span class="font-bold text-gray-800 dark:text-white">{formatPrice(order.price)}</span>
						<Button.Root
							class="h-6 border-0 rounded bg-gradient-to-r from-indigo-500 to-purple-600 px-3 text-xs text-white hover:from-indigo-600 hover:to-purple-700"
						>
							<Plus size=15 class="inline-block" />
						</Button.Root>
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>
