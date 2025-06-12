<script lang="ts">
	import Greeting from './components/Greeting.svelte'
	import StatsCard from './components/StatsCard.svelte'
	import QuickOrdersCard from './components/QuickOrdersCard.svelte'
	import CanteenStatsCard from './components/CanteenStatsCard.svelte'
	import { Button } from 'bits-ui'
	import { formatPrice } from '$lib/utils'

	let { data } = $props()

	const { stats, quickOrders = [], canteenStats = [] } = data
	const displayStats = {
		totalSpent: stats?.totalSpent || 0,
		ordersThisMonth: stats?.ordersThisMonth || 0,
		favoriteCanteen: stats?.favoriteCanteen || 'Start ordering to see your favorite!',
		spentTrend: stats?.spentTrend || { value: '0', isUp: true },
		ordersTrend: stats?.ordersTrend || { value: 0, isUp: true }
	}
</script>

<div
	class="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
>
	<!-- Decorative background elements -->
	<div class="absolute inset-0 opacity-20">
		<div
			class="absolute top-10 left-10 h-32 w-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 blur-3xl"
		></div>
		<div
			class="absolute top-1/3 right-20 h-48 w-48 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 blur-3xl"
		></div>
		<div
			class="absolute bottom-20 left-1/4 h-40 w-40 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 blur-3xl"
		></div>
	</div>

	<div class="relative z-10 space-y-8 p-6">
		<div class="flex items-center justify-between">
			<div>
				<h1
					class="mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent"
				>
					Dashboard
				</h1>
				<Greeting
					userName={data.user.name}
					class="text-lg text-gray-700 dark:text-gray-500"
				/>
			</div>
		</div>

		<div class="lg:col-span-2">
			<QuickOrdersCard {quickOrders} />
		</div>

		<div class="grid grid-cols-2 gap-6">
			<StatsCard
				title="Spent This Month"
				value="{formatPrice(displayStats.totalSpent, 0)}"
				trend="{displayStats.spentTrend.isUp ? '+' : ''}{displayStats.spentTrend.value}% from last month"
				trendUp={displayStats.spentTrend.isUp}
				size="medium"
				gradient="emerald"
			/>
			<StatsCard
				title="Orders This Month"
				value={displayStats.ordersThisMonth.toString()}
				trend="{displayStats.ordersTrend.isUp ? '+' : ''}{displayStats.ordersTrend.value} from last month"
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

		<div class="lg:col-span-1">
			<CanteenStatsCard {canteenStats} />
		</div>
	</div>
</div>
