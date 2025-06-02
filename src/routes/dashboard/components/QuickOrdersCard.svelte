<script lang="ts">
import { Button } from "bits-ui";

interface QuickOrder {
	id: number;
	name: string;
	price: number;
	canteen: string;
	image: string;
}

interface Props {
	quickOrders: QuickOrder[];
}

let { quickOrders }: Props = $props();
</script>

<div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
	<div class="flex items-center justify-between mb-6">
		<div class="flex items-center gap-3">
			<div class="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
				<span class="text-white text-lg">⚡</span>
			</div>
			<h3 class="text-lg font-semibold text-gray-800 dark:text-white">Quick Orders</h3>
		</div>
		<Button.Root variant="outline" size="sm" class="text-xs">View Menu</Button.Root>
	</div>
		<div class="grid grid-cols-2 gap-4">
		{#each quickOrders as order}
			<div class="group cursor-pointer">
				<div class="flex flex-col items-center p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105">
					<div class="text-3xl mb-2">{order.image}</div>
					<p class="font-medium text-center text-gray-800 dark:text-white text-sm mb-1">{order.name}</p>
					<p class="text-xs text-gray-500 dark:text-gray-400 mb-2">{order.canteen}</p>
					<div class="flex items-center justify-between w-full">
						<span class="font-bold text-gray-800 dark:text-white">${order.price}</span>
						<Button.Root size="sm" class="h-6 px-3 text-xs bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0">
							+
						</Button.Root>
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>
