<script lang="ts">
	import { Button, Dialog } from 'bits-ui'
	import { Clock, ChefHat, ArrowLeft } from 'lucide-svelte'
	import type { PageData } from './$types'
	import { goto } from '$app/navigation'
	import ItemDialog from './components/ItemDialog.svelte'
	import MenuCategorySection from './components/MenuCategorySection.svelte'
	import CartNotification from './components/CartNotification.svelte'
	import Elements from '$lib/components/Elements.svelte'

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

	<div class="relative z-10 space-y-4 px-4 py-6 md:px-8 md:py-10">
		<div>
			<Button.Root
				class="flex items-center gap-1 rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
				onclick={() => goto('/menu')}
			>
				<ArrowLeft size={16} />
				<span>Back to Canteens</span>
			</Button.Root>
		</div>

		{#if data.canteen}
			<div>
				<h1
					class="font-sensation text-4xl text-gray-800 sm:text-5xl md:text-6xl dark:text-white"
				>
					{data.canteen.name}
				</h1>
			</div>

			<div class="transform rounded-xl border p-6 shadow-lg transition-all duration-300">
				<div class="flex flex-wrap gap-4">
					<div class="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
						<Clock size={16} />
						<span>{data.canteen.timings}</span>
					</div>

					<div
						class="flex items-center gap-1 text-sm {data.canteen.open
							? 'text-green-600 dark:text-green-300'
							: 'text-red-600 dark:text-red-400'}"
					>
						<ChefHat size={16} />
						<span>{data.canteen.open ? 'Open Now' : 'Closed'}</span>
					</div>
				</div>

				{#if data.canteen.description}
					<p class="mt-3 text-gray-600 dark:text-gray-300">
						{data.canteen.description}
					</p>
				{/if}
			</div>
		{:else}
			<div class="text-center">
				<p class="text-lg text-gray-600 dark:text-gray-300">Canteen not found</p>
			</div>
		{/if}

		{#if data.menuCategories && Object.keys(data.menuCategories).length > 0}
			{#each Object.entries(data.menuCategories) as [category, items]}
				<MenuCategorySection {category} {items} onItemClick={handleItemClick} />
			{/each}
		{:else}
			<div
				class="transform rounded-xl border p-4 text-center shadow-lg transition-all duration-300"
			>
				<p class="text-gray-500 dark:text-gray-400">
					No menu items available at the moment. Please check back later.
				</p>
			</div>
		{/if}
	</div>

	<Dialog.Root bind:open={isDialogOpen}>
		<Dialog.Portal>
			<Dialog.Overlay class="fixed inset-0 z-50 bg-black/50" />
			<Dialog.Content
				class="fixed top-[50%] left-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white/95 p-6 shadow-lg backdrop-blur-sm dark:bg-gray-800/95"
			>
				{#if selectedItem}
					<ItemDialog
						bind:item={selectedItem}
						bind:showCartMessage
						{addingToCart}
						onClose={closeDialog}
					/>
				{/if}
			</Dialog.Content>
		</Dialog.Portal>
	</Dialog.Root>

	<CartNotification bind:show={showCartMessage} />
</div>
