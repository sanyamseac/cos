<script lang="ts">
	import { Clock, ChefHat } from 'lucide-svelte'
	import type { PageData } from './$types'
	import { goto } from '$app/navigation'
	import Elements from '$lib/components/Elements.svelte'
	import Header from './components/Header.svelte'
	import Canteen from './components/Canteen.svelte'
	import NoCanteen from './components/NoCanteen.svelte'

	let { data }: { data: PageData } = $props()
</script>

<svelte:head>
	<title>Browse Canteens - IIIT Canteen Ordering System</title>
	<meta
		name="description"
		content="Browse all available canteens and explore their menus at IIIT."
	/>
</svelte:head>

<div
	class="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
>
	<Elements />
	<div class="relative z-10 space-y-4 px-4 py-6 md:px-8 md:py-10">
		<Header />

		{#if data.canteens && data.canteens.length > 0}
			<div class="py-5 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
				{#each data.canteens as canteen}
					<Canteen {canteen} />
				{/each}
			</div>
		{:else}
			<NoCanteen />
		{/if}
	</div>
</div>
