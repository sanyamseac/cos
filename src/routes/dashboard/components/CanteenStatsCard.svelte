<script lang="ts">
	import { formatPrice } from "$lib/utils"
	import { ChartColumnBig } from "lucide-svelte"

	interface CanteenStat {
		name: string
		spent: number
		orders: number
		rating: number
	}

	interface Props {
		canteenStats: CanteenStat[]
	}

	let { canteenStats }: Props = $props()
</script>

<div
	class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
>
	<div class="mb-6 flex items-center gap-3">
		<div class="rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 p-2">
			<ChartColumnBig class="text-lg text-white" />
		</div>
		<div>
			<h3 class="text-lg font-semibold text-gray-800 dark:text-white">Spending Overview</h3>
			<p class="text-xs text-gray-500 dark:text-gray-400">By location</p>
		</div>
	</div>

	<div class="space-y-3">
		{#each canteenStats as canteen}
			<div
				class="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50"
			>
				<div class="flex-1">
					<p class="text-sm font-medium text-gray-800 dark:text-white">{canteen.name}</p>
					<div
						class="mt-1 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400"
					>
						<span>{canteen.orders} orders</span>
						<!-- <span>⭐ {canteen.rating}</span> -->
					</div>
				</div>
				<div class="text-right">
					<p class="font-bold text-gray-800 dark:text-white">
						{formatPrice(canteen.spent)}
					</p>
					<p class="text-xs text-gray-500 dark:text-gray-400">
						{formatPrice(canteen.spent / canteen.orders)}/order
					</p>
				</div>
			</div>
		{/each}
	</div>
</div>
