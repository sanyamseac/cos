<script lang="ts">
	import { Button, Dialog } from 'bits-ui'
	import { Clock, ChefHat, ArrowLeft } from 'lucide-svelte'
	import type { PageData } from './$types'
	import ItemDialog from './components/ItemDialog.svelte'
	import MenuCategorySection from './components/MenuCategorySection.svelte'
	import CartNotification from './components/CartNotification.svelte'
	import Elements from '$lib/components/Elements.svelte'
	import Header from './components/Header.svelte'
	import Details from './components/Details.svelte'

	let { data }: { data: PageData } = $props()

	let selectedItem: any = $state(null)
	let isDialogOpen = $state(false)
	let addingToCart = $state(false)
	let showCartMessage = $state(false)

	function handleItemClick(item: any) {
		if (!item.available || !item.active) return

		const itemVariants = item.variants
		const itemAddons = item.addons

		selectedItem = {
			...item,
			variants: itemVariants,
			addons: itemAddons,
			selectedVariant: itemVariants.length > 0 ? itemVariants[0] : null,
			selectedAddons: [],
			quantity: 1,
		}

		isDialogOpen = true
	}

	function closeDialog() {
		isDialogOpen = false
		selectedItem = null
	}
</script>

<svelte:head>
	<title>{data.canteen?.name || 'Canteen Menu'} - IIIT Canteen Ordering System</title>
	<meta
		name="description"
		content="Browse the menu and place your order at {data.canteen?.name || 'our canteen'}."
	/>
</svelte:head>

<div
	class="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
>
	<Elements />
	<div class="relative z-10 space-y-4 p-6 md:px-8 md:py-10">
		<Header canteen={data.canteen} />
		<Details {data} />
		<hr class="border-gray-400 dark:border-gray-500" />

		{#if data.menuCategories && Object.keys(data.menuCategories).length > 0}
			{#each Object.entries(data.menuCategories) as [category, items]}
				<MenuCategorySection {category} {items} onItemClick={handleItemClick} />
			{/each}
		{:else}
			<p class="text-gray-500 dark:text-gray-400">
				No menu items available at the moment. Please check back later.
			</p>
		{/if}
	</div>

	<Dialog.Root bind:open={isDialogOpen}>
		<Dialog.Portal>
			<Dialog.Overlay
			class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80"
			/>
			<Dialog.Content
				class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] rounded-xl border border-gray-200 bg-gray-100 p-6 shadow-xl outline-none sm:max-w-[500px] md:w-full dark:border-gray-700 dark:bg-gray-800"
			>
				<Elements num={1}/>
				<div class="relative z-10">
					{#if selectedItem}
						<ItemDialog
							bind:item={selectedItem}
							bind:showCartMessage
							{addingToCart}
							onClose={closeDialog}
						/>
					{/if}
				</div>
			</Dialog.Content>
		</Dialog.Portal>
	</Dialog.Root>

	<CartNotification bind:show={showCartMessage} />
</div>
