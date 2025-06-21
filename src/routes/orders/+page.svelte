<script lang="ts">
	import { ChevronRight, Search, X } from 'lucide-svelte'
	import type { PageData } from './$types'
	import { goto, invalidate, invalidateAll } from '$app/navigation'
	import Elements from '$lib/components/Elements.svelte'
	import { formatPrice } from '$lib/utils'
	import NoOrders from './components/NoOrders.svelte'
	import Header from './components/Header.svelte'
	import OrderItem from './components/OrderItem.svelte'
	import SearchBar from './components/SearchBar.svelte'

	let { data }: { data: PageData } = $props()
	let orders = $state(data.orders || [])
	let filteredOrders = $state(data.orders || [])
</script>

<svelte:head>
	<title>orders</title>
	<meta name="description" content="View and manage your orders from various canteens." />
</svelte:head>

<div
	class="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
>
	<Elements num={Math.floor(orders.length / 5) || 3}/>

	<div class="relative z-10 space-y-4 px-4 py-6 md:px-8 md:py-10">
		<Header />
		<div class="mx-auto max-w-6xl">
			{#if data.orders && data.orders.length > 0}
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8">
					{#each filteredOrders as { order, canteen }}
						<OrderItem {order} />
					{/each}
				</div>

				<SearchBar {orders} bind:filteredOrders />
			{:else}
				<NoOrders />
			{/if}
		</div>
	</div>
</div>
