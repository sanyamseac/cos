<script lang="ts">
	import type { PageData } from './$types'
	import Header from './components/Header.svelte'
	import EmptyBasket from './components/EmptyBasket.svelte'
	import JoinBasketModal from './components/JoinBasket.svelte'
	import Tabs from './components/Tabs.svelte'

	import Elements from '$lib/components/Elements.svelte'

	let { data, form }: { data: PageData, form: any } = $props()

	const allItemsGroupedByCanteen = $derived(() => {
		return (
			data.basketsByCanteen?.map((canteenGroup) => {
				const allItems = canteenGroup.baskets.flatMap((basket: any) => basket.items)
				return {
					canteen: canteenGroup.canteen,
					baskets: canteenGroup.baskets,
					allItems: allItems,
					totalItems: allItems.length,
					isShared: canteenGroup.isShared,
					accessCode: canteenGroup.accessCode,
				}
			}) || []
		)
	})

	let showJoinModal = $state(false)
</script>

<svelte:head>
	<title>My Basket - IIIT Canteen Ordering System</title>
	<meta name="description" content="Review your basket and place your order." />
</svelte:head>

<div
	class="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
>
	<Elements />

	<div class="relative z-10 space-y-4 px-4 py-6 md:px-8 md:py-10">

		<Header />

		{#if allItemsGroupedByCanteen().length === 0}
			<EmptyBasket />
		{:else}
			<Tabs {allItemsGroupedByCanteen} wallets={data.wallets} {form} />
		{/if}
	</div>
</div>

<JoinBasketModal bind:open={showJoinModal} />
