<script lang="ts">
	import { Button, Dialog } from 'bits-ui'
	import { Clock, ChefHat, ArrowLeft } from 'lucide-svelte'
	import type { PageData } from './$types'
	import { goto } from '$app/navigation'
	import ItemDialog from './components/ItemDialog.svelte'
	import MenuCategorySection from './components/MenuCategorySection.svelte'
	import CartNotification from './components/CartNotification.svelte'
	import Elements from '$lib/components/Elements.svelte'
	import { getFoodTypeIcon } from '$lib/utils/foodTypeUtils'

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

	<div class="relative z-10 space-y-8 px-4 py-6">
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
								class="flex items-center gap-1 text-sm {data.canteen.open
									? 'text-green-600 dark:text-green-300'
									: 'text-red-600 dark:text-red-400'}"
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
	</div>

	<Dialog.Root bind:open={isDialogOpen}>
		<Dialog.Portal>
			<Dialog.Overlay class="fixed inset-0 z-50 bg-black/50" />
			<Dialog.Content
				class="fixed top-[50%] left-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800"
			>
				{#if selectedItem}
					<ItemDialog
						bind:item={selectedItem}
						bind:showCartMessage
						{addingToCart}
						{getFoodTypeIcon}
						onClose={closeDialog}
					/>
				{/if}
			</Dialog.Content>
		</Dialog.Portal>
	</Dialog.Root>

	<CartNotification bind:show={showCartMessage} />
</div>
