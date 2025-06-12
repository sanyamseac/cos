<script lang="ts">
	import { Button, Dialog } from 'bits-ui'
	import { Clock, ChefHat, ArrowLeft } from 'lucide-svelte'
	import type { PageData } from './$types'
	import { goto } from '$app/navigation'
	import ItemDialog from './components/ItemDialog.svelte'
	import MenuCategorySection from '../components/MenuCategorySection.svelte'
	import CartNotification from '../components/CartNotification.svelte'
	import { getFoodTypeIcon } from '$lib/utils/foodTypeUtils'

	// Import page data
	let { data }: { data: PageData } = $props()
	$effect(() => {
		// Update when data changes
		data = data
	})

	// State variables
	let selectedItem: any = $state(null)
	let isDialogOpen = $state(false)
	let addingToCart = $state(false)
	let cartUpdateMessage = $state('')
	let showCartMessage = $state(false)

	// Function to handle item selection and open dialog
	function handleItemClick(item: any) {
		// Only show available and active items to customers
		if (!item.available || !item.active) return

		// Get the variants and addons for this item (only active and available ones)
		const itemVariants = data.variants.filter(
			(v) => v.itemId === item.id && v.active && v.available,
		)
		const itemAddons = data.addons.filter(
			(a) => a.itemId === item.id && a.active && a.available,
		)

		selectedItem = {
			...item,
			variants: itemVariants,
			addons: itemAddons,
			selectedVariant: itemVariants.length > 0 ? itemVariants[0] : null,
			selectedAddons: [],
			quantity: 1,
		}

		// If there are variants or addons, show dialog, otherwise add to cart directly
		if (itemVariants.length > 0 || itemAddons.length > 0) {
			isDialogOpen = true
		} else {
			addToCartDirectly(selectedItem)
		}
	}

	// Function to handle adding item to cart directly (without dialog)
	async function addToCartDirectly(item: any) {
		const form = document.createElement('form')
		form.method = 'POST'
		form.action = '?/addToBasket'

		const menuItemIdInput = document.createElement('input')
		menuItemIdInput.type = 'hidden'
		menuItemIdInput.name = 'menuItemId'
		menuItemIdInput.value = item.id.toString()
		form.appendChild(menuItemIdInput)

		const quantityInput = document.createElement('input')
		quantityInput.type = 'hidden'
		quantityInput.name = 'quantity'
		quantityInput.value = item.quantity.toString()
		form.appendChild(quantityInput)

		document.body.appendChild(form)
		addingToCart = true

		try {
			form.submit()
			cartUpdateMessage = `${item.name} added to basket!`
			showCartMessage = true
			setTimeout(() => {
				showCartMessage = false
			}, 3000)
		} catch (error) {
			console.error('Error adding to cart:', error)
			cartUpdateMessage = 'Failed to add item to basket. Please try again.'
			showCartMessage = true
			setTimeout(() => {
				showCartMessage = false
			}, 3000)
		} finally {
			addingToCart = false
			document.body.removeChild(form)
		}
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
	class="relative min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
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

	<div class="relative z-10 space-y-6 p-4 sm:p-6">
		<!-- Back Button -->
		<div>
			<Button.Root
				class="flex items-center gap-1 rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
				onclick={() => goto('/menu')}
			>
				<ArrowLeft size={16} />
				<span>Back to Canteens</span>
			</Button.Root>
		</div>

		<!-- Canteen Info Header -->
		{#if data.canteen}
			<div class="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
				<div class="flex items-start justify-between">
					<div class="flex-1">
						<h1
							class="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent md:text-4xl"
						>
							{data.canteen.name}
						</h1>

						<div class="mt-2 flex flex-wrap gap-4">
							<div
								class="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300"
							>
								<Clock size={16} />
								<span>{data.canteen.timings}</span>
							</div>

							<div
								class="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300"
							>
								<ChefHat size={16} />
								<span>{data.canteen.open ? 'Open Now' : 'Closed'}</span>
							</div>
						</div>

						<p class="mt-3 text-gray-600 dark:text-gray-300">
							{data.canteen.description}
						</p>
					</div>
				</div>
			</div>
		{:else}
			<div class="text-center">
				<p class="text-lg text-gray-600 dark:text-gray-300">Canteen not found</p>
			</div>
		{/if}

		<!-- Menu Categories -->
		<div class="space-y-8">
			{#if data.menuCategories && Object.keys(data.menuCategories).length > 0}
				{#each Object.entries(data.menuCategories) as [category, items]}
					<MenuCategorySection {category} {items} onItemClick={handleItemClick} />
				{/each}
			{:else}
				<div class="rounded-lg bg-white p-4 text-center shadow-sm dark:bg-gray-800">
					<p class="text-gray-500 dark:text-gray-400">
						No menu items available at the moment. Please check back later.
					</p>
				</div>
			{/if}
		</div>

		<!-- Cart Update Message -->
		<CartNotification message={cartUpdateMessage} show={showCartMessage} />
	</div>

	<!-- Item Dialog for customization -->
	<Dialog.Root bind:open={isDialogOpen}>
		<Dialog.Portal>
			<Dialog.Overlay class="fixed inset-0 z-50 bg-black/50" />
			<Dialog.Content
				class="fixed top-[50%] left-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800"
			>
				{#if selectedItem}
					<ItemDialog
						item={selectedItem}
						{addingToCart}
						{getFoodTypeIcon}
						onClose={closeDialog}
					/>
				{/if}
			</Dialog.Content>
		</Dialog.Portal>
	</Dialog.Root>
</div>
