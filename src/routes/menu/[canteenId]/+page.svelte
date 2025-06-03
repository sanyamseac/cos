<script lang="ts">
	import { Button, Dialog } from 'bits-ui'
	import { Clock, ChefHat, ArrowLeft, Plus, ShoppingCart } from 'lucide-svelte'
	import type { PageData } from './$types'
	import { goto } from '$app/navigation'
	import { fade } from 'svelte/transition'
	import ItemDialog from './components/ItemDialog.svelte'

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
			addToCart(selectedItem)
		}
	}

	// Function to handle adding item to cart
	async function addToCart(item: any) {
		addingToCart = true
		cartUpdateMessage = ''

		try {
			// Demo API call for adding to cart
			// In a real implementation, this would be connected to a proper API
			const response = await fetch('/api/basket/add', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					itemId: item.id,
					quantity: item.quantity,
					variantId: item.selectedVariant?.id,
					addons: item.selectedAddons.map((a: any) => a.id),
				}),
			})

			// For demo purposes, simulate a successful response
			await new Promise((resolve) => setTimeout(resolve, 800))

			// Close dialog and show success message
			isDialogOpen = false
			cartUpdateMessage = `${item.name} added to cart!`
			showCartMessage = true
			setTimeout(() => {
				showCartMessage = false
			}, 3000)
		} catch (error) {
			console.error('Error adding to cart:', error)
			cartUpdateMessage = 'Failed to add item to cart. Please try again.'
		} finally {
			addingToCart = false
		}
	}

	// Get food type icon
	function getFoodTypeIcon(type: string) {
		if (type === 'veg') return '🟢'
		if (type === 'non-veg') return '🔴'
		if (type === 'egg') return '🟠'
		return ''
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
					<div>
						<div class="mb-4">
							<h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200">
								{category}
							</h2>
						</div>

						<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{#each items.filter((item) => item.active && item.available) as item}
								<div
									class="group overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
								>
									<div class="p-4">
										<!-- Item header with food type and name -->
										<div class="mb-2 flex items-start justify-between">
											<div class="flex-1">
												<div class="mb-1 flex items-center gap-1">
													<span
														class="mr-1 inline-block"
														title={item.type}
														>{getFoodTypeIcon(item.type)}</span
													>
													<h3
														class="text-lg font-medium text-gray-900 dark:text-white"
													>
														{item.name}
													</h3>
												</div>
											</div>

											<!-- Add to Cart Button -->
											<Button.Root
												class="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 transition-all hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-800"
												onclick={(event: Event) => {
													event.stopPropagation()
													handleItemClick(item)
												}}
												title="Add to cart"
											>
												<Plus size={16} />
											</Button.Root>
										</div>

										<!-- Item description -->
										{#if item.description}
											<p
												class="mb-3 text-sm text-gray-600 dark:text-gray-300"
											>
												{item.description}
											</p>
										{/if}

										<!-- Price -->
										<div class="font-medium text-gray-900 dark:text-white">
											₹{item.price}
										</div>
									</div>
								</div>
							{/each}
						</div>
					</div>
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
		{#if showCartMessage && cartUpdateMessage}
			<div
				transition:fade={{ duration: 300 }}
				class="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 transform rounded-full bg-indigo-600 px-6 py-3 text-center text-white shadow-lg"
			>
				<div class="flex items-center gap-2">
					<ShoppingCart size={18} />
					<span>{cartUpdateMessage}</span>
				</div>
			</div>
		{/if}
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
						onAddToCart={addToCart}
						{addingToCart}
						{getFoodTypeIcon}
					/>
				{/if}
			</Dialog.Content>
		</Dialog.Portal>
	</Dialog.Root>
</div>
