<script lang="ts">
	import Greeting from './components/Greeting.svelte'
	import StatsCard from './components/StatsCard.svelte'
	import QuickOrdersCard from './components/QuickOrdersCard.svelte'
	import CanteenStatsCard from './components/CanteenStatsCard.svelte'
	import { formatPrice } from '$lib/utils'
	import Elements from '$lib/components/Elements.svelte'
	import { Button } from 'bits-ui'
	import { ChartNoAxesColumn } from 'lucide-svelte'
	import { goto } from '$app/navigation'

	let { data } = $props()

	const { stats, quickOrders = [], canteenStats = [] } = data
	const displayStats = {
		totalSpent: stats?.totalSpent || 0,
		ordersThisMonth: stats?.ordersThisMonth || 0,
		favoriteCanteen: stats?.favoriteCanteen || 'Start ordering to see your favorite!',
		spentTrend: stats?.spentTrend || { value: '0', isUp: true },
		ordersTrend: stats?.ordersTrend || { value: 0, isUp: true },
	}
</script>

<div
	class="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
>
	<Elements />

	<div class="relative z-10 space-y-8 px-4 py-6">
		<div class="flex-row">
			<div class="flex items-center justify-between pb-4">
				<div>
					<h1
						class="text-4xl font-sensation text-gray-800 dark:text-white sm:text-5xl md:text-6xl"
					>
						dashboard
					</h1>
				</div>
				<div>
					<Button.Root
						class="px-2"
						onclick={() => goto('/leaderboard')}
					>
						<ChartNoAxesColumn class="ml-3 mt-0.5 h-7 w-7" />
					</Button.Root>
				</div>
			</div>
			<Greeting
					userName={data.user.name}
					class="text-lg text-gray-700 dark:text-gray-500"
				/>
		</div>

	</div>

	<div class="relative z-10 space-y-4 px-4 py-6 md:px-8 md:py-10">

		<div class="lg:col-span-2">
			<QuickOrdersCard {quickOrders} />
		</div>
		<hr class="mt-6 mb-7 border-gray-400 dark:border-gray-500" />

		<div class="grid grid-cols-2 gap-4 md:gap-8">
			<StatsCard
				title="Spent This Month"
				value={formatPrice(displayStats.totalSpent, 0)}
				trend="{displayStats.spentTrend.isUp ? '+' : ''}{displayStats.spentTrend
					.value}% from last month"
				trendUp={displayStats.spentTrend.isUp}
				size="medium"
				gradient="emerald"
			/>
			<StatsCard
				title="Orders This Month"
				value={displayStats.ordersThisMonth.toString()}
				trend="{displayStats.ordersTrend.isUp ? '+' : ''}{displayStats.ordersTrend
					.value} from last month"
				trendUp={displayStats.ordersTrend.isUp}
				size="medium"
				gradient="blue"
			/>
		</div>

		<div>
			<StatsCard
				title="Favorite Canteen"
				value={displayStats.favoriteCanteen}
				size="wide"
				gradient="purple"
			/>
		</div>

		<hr class="mt-6 mb-7 border-gray-400 dark:border-gray-500" />

		<div class="lg:col-span-1">
			<CanteenStatsCard {canteenStats} />
		</div>
	</div>
</div>
