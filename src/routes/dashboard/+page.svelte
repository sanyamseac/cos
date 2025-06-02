<script lang="ts">
import Greeting from './components/Greeting.svelte';
import StatsCard from './components/StatsCard.svelte';
import QuickOrdersCard from './components/QuickOrdersCard.svelte';
import CanteenStatsCard from './components/CanteenStatsCard.svelte';
import { Button } from "bits-ui";

let { data } = $props();

// Demo data
const demoStats = {
	totalSpent: 2450.50,
	ordersThisMonth: 23,
	favoriteCanteen: "Main Cafeteria"
};

const quickOrders = [
	{ id: 1, name: "Chicken Sandwich", price: 8.99, canteen: "Main Cafeteria", image: "🥪" },
	{ id: 2, name: "Caesar Salad", price: 12.50, canteen: "Health Corner", image: "🥗" },
	{ id: 3, name: "Coffee & Muffin", price: 6.75, canteen: "Coffee Shop", image: "☕" },
	{ id: 4, name: "Pizza Slice", price: 4.99, canteen: "Italian Corner", image: "🍕" },
	{ id: 5, name: "Fish & Chips", price: 14.25, canteen: "Main Cafeteria", image: "🐟" },
	{ id: 6, name: "Veggie Wrap", price: 9.50, canteen: "Health Corner", image: "🌯" }
];

const canteenStats = [
	{ name: "Main Cafeteria", spent: 890.25, orders: 12, rating: 4.5 },
	{ name: "Health Corner", spent: 445.80, orders: 6, rating: 4.8 },
	{ name: "Italian Corner", spent: 325.50, orders: 4, rating: 4.3 },
	{ name: "Asian Kitchen", spent: 788.95, orders: 1, rating: 4.6 }
];
</script>

<div class="min-h-screen pb-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
	<!-- Decorative background elements -->
	<div class="absolute inset-0 opacity-20">
		<div class="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full blur-3xl"></div>
		<div class="absolute top-1/3 right-20 w-48 h-48 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full blur-3xl"></div>
		<div class="absolute bottom-20 left-1/4 w-40 h-40 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full blur-3xl"></div>
	</div>
	
	<div class="relative z-10 p-6 space-y-8">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-4xl font-bold mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Dashboard</h1>
				<Greeting userName={data.user.name} class="text-lg text-gray-700 dark:text-gray-300" />
			</div>
			<Button.Root class="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 rounded-xl font-semibold">
				View All Orders
			</Button.Root>
		</div>	<!-- Top Stats Row - Total Spent & Orders -->
	<div class="grid grid-cols-2 gap-6">
		<StatsCard 
			title="Total Spent" 
			value="${demoStats.totalSpent.toFixed(2)}" 
			trend="+12% from last month"
			trendUp={true}
			size="medium"
			gradient="emerald"
		/>
		<StatsCard 
			title="Orders This Month" 
			value="{demoStats.ordersThisMonth}" 
			trend="+5 from last month"
			trendUp={true}
			size="medium"
			gradient="blue"
		/>
	</div>

	<!-- Favorite Canteen - Full Width -->
	<div>
		<StatsCard 
			title="Favorite Canteen" 
			value="{demoStats.favoriteCanteen}"
			size="wide"
			gradient="purple"
		/>
	</div>

	<!-- App Dashboard Content -->
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<!-- Quick Orders - Main focus -->
		<div class="lg:col-span-2">
			<QuickOrdersCard {quickOrders} />
		</div>
		
		<!-- Canteen Stats - Side panel -->
		<div class="lg:col-span-1">
			<CanteenStatsCard {canteenStats} />
		</div>	</div>
	</div>
</div>