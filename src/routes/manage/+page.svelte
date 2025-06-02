<script lang="ts">
	import { Button } from 'bits-ui'
	import { Plus, Edit2, Trash2, Settings, ChefHat, Package, Layers, Zap } from 'lucide-svelte'
	import type { PageServerData } from './$types'

	let { data }: { data: PageServerData } = $props()

	// State for current tab
	let activeTab = $state('canteens')

	// State for modals
	let showCanteenModal = $state(false)
	let showItemModal = $state(false)
	let showAddonModal = $state(false)
	let showVariantModal = $state(false)

	// State for editing
	let editingCanteen = $state<any>(null)
	let editingItem = $state<any>(null)
	let editingAddon = $state<any>(null)
	let editingVariant = $state<any>(null)

	// Reactive data
	let canteens = $state(data.canteens || [])
	let menuItems = $state(data.menuItems || [])
	let addons = $state(data.addons || [])
	let variants = $state(data.variants || [])

	// Form states
	let canteenForm = $state({
		name: '',
		timings: '',
		is_open: true,
	})

	let itemForm = $state({
		canteenId: '',
		category: '',
		name: '',
		price: '',
		isAvailable: true,
		isNonVeg: false,
	})

	let addonForm = $state({
		itemId: '',
		name: '',
		price: '',
	})

	let variantForm = $state({
		itemId: '',
		name: '',
		price: '',
	})

	// Helper functions
	function resetForms() {
		canteenForm = { name: '', timings: '', is_open: true }
		itemForm = {
			canteenId: '',
			category: '',
			name: '',
			price: '',
			isAvailable: true,
			isNonVeg: false,
		}
		addonForm = { itemId: '', name: '', price: '' }
		variantForm = { itemId: '', name: '', price: '' }
	}

	function openCanteenModal(canteen: any = null) {
		editingCanteen = canteen
		if (canteen) {
			canteenForm = { ...canteen }
		} else {
			canteenForm = { name: '', timings: '', is_open: true }
		}
		showCanteenModal = true
	}

	function openItemModal(item: any = null) {
		editingItem = item
		if (item) {
			itemForm = { ...item, canteenId: item.canteenId.toString(), price: item.price }
		} else {
			itemForm = {
				canteenId: '',
				category: '',
				name: '',
				price: '',
				isAvailable: true,
				isNonVeg: false,
			}
		}
		showItemModal = true
	}

	function openAddonModal(addon: any = null) {
		editingAddon = addon
		if (addon) {
			addonForm = { ...addon, itemId: addon.itemId.toString(), price: addon.price }
		} else {
			addonForm = { itemId: '', name: '', price: '' }
		}
		showAddonModal = true
	}

	function openVariantModal(variant: any = null) {
		editingVariant = variant
		if (variant) {
			variantForm = { ...variant, itemId: variant.itemId.toString(), price: variant.price }
		} else {
			variantForm = { itemId: '', name: '', price: '' }
		}
		showVariantModal = true
	}

	// API functions
	async function saveCanteen() {
		try {
			const url = '/api/canteens'
			const method = editingCanteen ? 'PUT' : 'POST'
			const body = editingCanteen ? { ...canteenForm, id: editingCanteen.id } : canteenForm

			const response = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			})

			if (response.ok) {
				const result = await response.json()
				if (editingCanteen) {
					canteens = canteens.map((c) => (c.id === result.id ? result : c))
				} else {
					canteens = [...canteens, result]
				}
				showCanteenModal = false
				resetForms()
			} else {
				const error = await response.json()
				alert(error.error || 'Failed to save canteen')
			}
		} catch (error) {
			console.error('Error saving canteen:', error)
			alert('Failed to save canteen')
		}
	}

	async function deleteCanteen(id: number) {
		if (
			!confirm(
				'Are you sure you want to delete this canteen? This will also delete all associated menu items.',
			)
		) {
			return
		}

		try {
			const response = await fetch('/api/canteens', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id }),
			})

			if (response.ok) {
				canteens = canteens.filter((c) => c.id !== id)
				menuItems = menuItems.filter((i) => i.canteenId !== id)
			} else {
				const error = await response.json()
				alert(error.error || 'Failed to delete canteen')
			}
		} catch (error) {
			console.error('Error deleting canteen:', error)
			alert('Failed to delete canteen')
		}
	}

	async function saveMenuItem() {
		try {
			const url = '/api/menu-items'
			const method = editingItem ? 'PUT' : 'POST'
			const body = editingItem ? { ...itemForm, id: editingItem.id } : itemForm

			const response = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			})

			if (response.ok) {
				const result = await response.json()
				if (editingItem) {
					menuItems = menuItems.map((i) => (i.id === result.id ? result : i))
				} else {
					menuItems = [...menuItems, result]
				}
				showItemModal = false
				resetForms()
			} else {
				const error = await response.json()
				alert(error.error || 'Failed to save menu item')
			}
		} catch (error) {
			console.error('Error saving menu item:', error)
			alert('Failed to save menu item')
		}
	}

	async function deleteMenuItem(id: number) {
		if (
			!confirm(
				'Are you sure you want to delete this menu item? This will also delete all associated addons and variants.',
			)
		) {
			return
		}

		try {
			const response = await fetch('/api/menu-items', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id }),
			})

			if (response.ok) {
				menuItems = menuItems.filter((i) => i.id !== id)
				addons = addons.filter((a) => a.itemId !== id)
				variants = variants.filter((v) => v.itemId !== id)
			} else {
				const error = await response.json()
				alert(error.error || 'Failed to delete menu item')
			}
		} catch (error) {
			console.error('Error deleting menu item:', error)
			alert('Failed to delete menu item')
		}
	}

	async function saveAddon() {
		try {
			const url = '/api/addons'
			const method = editingAddon ? 'PUT' : 'POST'
			const body = editingAddon ? { ...addonForm, id: editingAddon.id } : addonForm

			const response = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			})

			if (response.ok) {
				const result = await response.json()
				if (editingAddon) {
					addons = addons.map((a) => (a.id === result.id ? result : a))
				} else {
					addons = [...addons, result]
				}
				showAddonModal = false
				resetForms()
			} else {
				const error = await response.json()
				alert(error.error || 'Failed to save addon')
			}
		} catch (error) {
			console.error('Error saving addon:', error)
			alert('Failed to save addon')
		}
	}

	async function deleteAddon(id: number) {
		if (!confirm('Are you sure you want to delete this addon?')) {
			return
		}

		try {
			const response = await fetch('/api/addons', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id }),
			})

			if (response.ok) {
				addons = addons.filter((a) => a.id !== id)
			} else {
				const error = await response.json()
				alert(error.error || 'Failed to delete addon')
			}
		} catch (error) {
			console.error('Error deleting addon:', error)
			alert('Failed to delete addon')
		}
	}

	async function saveVariant() {
		try {
			const url = '/api/variants'
			const method = editingVariant ? 'PUT' : 'POST'
			const body = editingVariant ? { ...variantForm, id: editingVariant.id } : variantForm

			const response = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			})

			if (response.ok) {
				const result = await response.json()
				if (editingVariant) {
					variants = variants.map((v) => (v.id === result.id ? result : v))
				} else {
					variants = [...variants, result]
				}
				showVariantModal = false
				resetForms()
			} else {
				const error = await response.json()
				alert(error.error || 'Failed to save variant')
			}
		} catch (error) {
			console.error('Error saving variant:', error)
			alert('Failed to save variant')
		}
	}

	async function deleteVariant(id: number) {
		if (!confirm('Are you sure you want to delete this variant?')) {
			return
		}

		try {
			const response = await fetch('/api/variants', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id }),
			})

			if (response.ok) {
				variants = variants.filter((v) => v.id !== id)
			} else {
				const error = await response.json()
				alert(error.error || 'Failed to delete variant')
			}
		} catch (error) {
			console.error('Error deleting variant:', error)
			alert('Failed to delete variant')
		}
	}

	function getCanteenName(canteenId: number) {
		return canteens?.find((c) => c.id === canteenId)?.name || 'Unknown Canteen'
	}

	function getItemName(itemId: number) {
		return menuItems?.find((i) => i.id === itemId)?.name || 'Unknown Item'
	}
</script>

<svelte:head>
	<title>Admin Management - IIIT Canteen Ordering System</title>
	<meta
		name="description"
		content="Admin panel for managing canteens, menu items, addons, and variants."
	/>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
	<!-- Header -->
	<div class="border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="flex h-16 items-center justify-between">
				<div class="flex items-center gap-3">
					<div class="rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 p-2">
						<Settings class="text-white" size={20} />
					</div>
					<h1 class="text-xl font-semibold text-gray-900 dark:text-white">
						Admin Management
					</h1>
				</div>
				<p class="text-sm text-gray-600 dark:text-gray-400">Welcome, {data.user.name}</p>
			</div>
		</div>
	</div>

	<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<!-- Tabs -->
		<div class="mb-8 border-b border-gray-200 dark:border-gray-700">
			<nav class="-mb-px flex space-x-8">
				<button
					onclick={() => (activeTab = 'canteens')}
					class="border-b-2 px-1 py-2 text-sm font-medium {activeTab === 'canteens'
						? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
						: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}"
				>
					<div class="flex items-center gap-2">
						<ChefHat size={16} />
						Canteens ({canteens?.length || 0})
					</div>
				</button>
				<button
					onclick={() => (activeTab = 'items')}
					class="border-b-2 px-1 py-2 text-sm font-medium {activeTab === 'items'
						? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
						: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}"
				>
					<div class="flex items-center gap-2">
						<Package size={16} />
						Menu Items ({menuItems?.length || 0})
					</div>
				</button>
				<button
					onclick={() => (activeTab = 'addons')}
					class="border-b-2 px-1 py-2 text-sm font-medium {activeTab === 'addons'
						? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
						: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}"
				>
					<div class="flex items-center gap-2">
						<Zap size={16} />
						Addons ({addons?.length || 0})
					</div>
				</button>
				<button
					onclick={() => (activeTab = 'variants')}
					class="border-b-2 px-1 py-2 text-sm font-medium {activeTab === 'variants'
						? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
						: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}"
				>
					<div class="flex items-center gap-2">
						<Layers size={16} />
						Variants ({variants?.length || 0})
					</div>
				</button>
			</nav>
		</div>

		<!-- Canteens Tab -->
		{#if activeTab === 'canteens'}
			<div class="space-y-6">
				<div class="flex items-center justify-between">
					<h2 class="text-lg font-medium text-gray-900 dark:text-white">
						Manage Canteens
					</h2>
					<Button.Root onclick={() => openCanteenModal()} class="flex items-center gap-2">
						<Plus size={16} />
						Add Canteen
					</Button.Root>
				</div>

				<div
					class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
				>
					<div class="overflow-x-auto">
						<table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
							<thead class="bg-gray-50 dark:bg-gray-700">
								<tr>
									<th
										class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300"
										>Name</th
									>
									<th
										class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300"
										>Timings</th
									>
									<th
										class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300"
										>Status</th
									>
									<th
										class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300"
										>Actions</th
									>
								</tr>
							</thead>
							<tbody
								class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800"
							>
								{#each canteens || [] as canteen}
									<tr>
										<td
											class="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900 dark:text-white"
											>{canteen.name}</td
										>
										<td
											class="px-6 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400"
											>{canteen.timings}</td
										>
										<td class="px-6 py-4 whitespace-nowrap">
											<span
												class="inline-flex rounded-full px-2 py-1 text-xs font-semibold {canteen.is_open
													? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
													: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}"
											>
												{canteen.is_open ? 'Open' : 'Closed'}
											</span>
										</td>
										<td
											class="px-6 py-4 text-sm whitespace-nowrap text-gray-500"
										>
											<div class="flex items-center gap-2">
												<Button.Root
													size="sm"
													onclick={() => openCanteenModal(canteen)}
													class="border border-gray-300 hover:bg-gray-50"
												>
													<Edit2 size={14} />
												</Button.Root>
												<Button.Root
													size="sm"
													onclick={() => deleteCanteen(canteen.id)}
													class="border border-gray-300 text-red-600 hover:bg-red-50 hover:text-red-700"
												>
													<Trash2 size={14} />
												</Button.Root>
											</div>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		{/if}

		<!-- Menu Items Tab -->
		{#if activeTab === 'items'}
			<div class="space-y-6">
				<div class="flex items-center justify-between">
					<h2 class="text-lg font-medium text-gray-900 dark:text-white">
						Manage Menu Items
					</h2>
					<Button.Root onclick={() => openItemModal()} class="flex items-center gap-2">
						<Plus size={16} />
						Add Menu Item
					</Button.Root>
				</div>

				<div
					class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
				>
					<div class="overflow-x-auto">
						<table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
							<thead class="bg-gray-50 dark:bg-gray-700">
								<tr>
									<th
										class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300"
										>Name</th
									>
									<th
										class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300"
										>Canteen</th
									>
									<th
										class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300"
										>Category</th
									>
									<th
										class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300"
										>Price</th
									>
									<th
										class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300"
										>Status</th
									>
									<th
										class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300"
										>Actions</th
									>
								</tr>
							</thead>
							<tbody
								class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800"
							>
								{#each menuItems || [] as item}
									<tr>
										<td class="px-6 py-4 whitespace-nowrap">
											<div class="flex items-center gap-2">
												<span
													class="text-sm font-medium text-gray-900 dark:text-white"
													>{item.name}</span
												>
												{#if item.isNonVeg}
													<span
														class="inline-flex rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800 dark:bg-red-900 dark:text-red-200"
														>Non-Veg</span
													>
												{/if}
											</div>
										</td>
										<td
											class="px-6 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400"
											>{getCanteenName(item.canteenId)}</td
										>
										<td
											class="px-6 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400"
											>{item.category}</td
										>
										<td
											class="px-6 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400"
											>₹{item.price}</td
										>
										<td class="px-6 py-4 whitespace-nowrap">
											<span
												class="inline-flex rounded-full px-2 py-1 text-xs font-semibold {item.isAvailable
													? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
													: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}"
											>
												{item.isAvailable ? 'Available' : 'Unavailable'}
											</span>
										</td>
										<td
											class="px-6 py-4 text-sm whitespace-nowrap text-gray-500"
										>
											<div class="flex items-center gap-2">
												<Button.Root
													size="sm"
													onclick={() => openItemModal(item)}
													class="border border-gray-300 hover:bg-gray-50"
												>
													<Edit2 size={14} />
												</Button.Root>
												<Button.Root
													size="sm"
													onclick={() => deleteMenuItem(item.id)}
													class="border border-gray-300 text-red-600 hover:bg-red-50 hover:text-red-700"
												>
													<Trash2 size={14} />
												</Button.Root>
											</div>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		{/if}

		<!-- Addons Tab -->
		{#if activeTab === 'addons'}
			<div class="space-y-6">
				<div class="flex items-center justify-between">
					<h2 class="text-lg font-medium text-gray-900 dark:text-white">Manage Addons</h2>
					<Button.Root onclick={() => openAddonModal()} class="flex items-center gap-2">
						<Plus size={16} />
						Add Addon
					</Button.Root>
				</div>

				<div
					class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
				>
					<div class="overflow-x-auto">
						<table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
							<thead class="bg-gray-50 dark:bg-gray-700">
								<tr>
									<th
										class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300"
										>Name</th
									>
									<th
										class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300"
										>Menu Item</th
									>
									<th
										class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300"
										>Price</th
									>
									<th
										class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300"
										>Actions</th
									>
								</tr>
							</thead>
							<tbody
								class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800"
							>
								{#each addons || [] as addon}
									<tr>
										<td
											class="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900 dark:text-white"
											>{addon.name}</td
										>
										<td
											class="px-6 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400"
											>{getItemName(addon.itemId)}</td
										>
										<td
											class="px-6 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400"
											>₹{addon.price}</td
										>
										<td
											class="px-6 py-4 text-sm whitespace-nowrap text-gray-500"
										>
											<div class="flex items-center gap-2">
												<Button.Root
													size="sm"
													onclick={() => openAddonModal(addon)}
													class="border border-gray-300 hover:bg-gray-50"
												>
													<Edit2 size={14} />
												</Button.Root>
												<Button.Root
													size="sm"
													onclick={() => deleteAddon(addon.id)}
													class="border border-gray-300 text-red-600 hover:bg-red-50 hover:text-red-700"
												>
													<Trash2 size={14} />
												</Button.Root>
											</div>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		{/if}

		<!-- Variants Tab -->
		{#if activeTab === 'variants'}
			<div class="space-y-6">
				<div class="flex items-center justify-between">
					<h2 class="text-lg font-medium text-gray-900 dark:text-white">
						Manage Variants
					</h2>
					<Button.Root onclick={() => openVariantModal()} class="flex items-center gap-2">
						<Plus size={16} />
						Add Variant
					</Button.Root>
				</div>

				<div
					class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
				>
					<div class="overflow-x-auto">
						<table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
							<thead class="bg-gray-50 dark:bg-gray-700">
								<tr>
									<th
										class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300"
										>Name</th
									>
									<th
										class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300"
										>Menu Item</th
									>
									<th
										class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300"
										>Price</th
									>
									<th
										class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300"
										>Actions</th
									>
								</tr>
							</thead>
							<tbody
								class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800"
							>
								{#each variants || [] as variant}
									<tr>
										<td
											class="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900 dark:text-white"
											>{variant.name}</td
										>
										<td
											class="px-6 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400"
											>{getItemName(variant.itemId)}</td
										>
										<td
											class="px-6 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400"
											>₹{variant.price}</td
										>
										<td
											class="px-6 py-4 text-sm whitespace-nowrap text-gray-500"
										>
											<div class="flex items-center gap-2">
												<Button.Root
													size="sm"
													onclick={() => openVariantModal(variant)}
													class="border border-gray-300 hover:bg-gray-50"
												>
													<Edit2 size={14} />
												</Button.Root>
												<Button.Root
													size="sm"
													onclick={() => deleteVariant(variant.id)}
													class="border border-gray-300 text-red-600 hover:bg-red-50 hover:text-red-700"
												>
													<Trash2 size={14} />
												</Button.Root>
											</div>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

<!-- Canteen Modal -->
{#if showCanteenModal}
	<div class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
		<div class="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
			<h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
				{editingCanteen ? 'Edit Canteen' : 'Add New Canteen'}
			</h3>

			<form
				onsubmit={(e) => {
					e.preventDefault()
					saveCanteen()
				}}
				class="space-y-4"
			>
				<div>
					<label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
						>Name</label
					>
					<input
						type="text"
						bind:value={canteenForm.name}
						required
						class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					/>
				</div>

				<div>
					<label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
						>Timings</label
					>
					<input
						type="text"
						bind:value={canteenForm.timings}
						required
						placeholder="e.g. 9:00 AM - 10:00 PM"
						class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					/>
				</div>

				<div class="flex items-center">
					<input type="checkbox" bind:checked={canteenForm.is_open} class="mr-2" />
					<label class="text-sm font-medium text-gray-700 dark:text-gray-300"
						>Currently Open</label
					>
				</div>

				<div class="flex gap-3 pt-4">
					<Button.Root type="submit" class="flex-1">
						{editingCanteen ? 'Update' : 'Create'}
					</Button.Root>
					<Button.Root
						onclick={() => (showCanteenModal = false)}
						class="flex-1 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
					>
						Cancel
					</Button.Root>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Menu Item Modal -->
{#if showItemModal}
	<div class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
		<div class="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
			<h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
				{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
			</h3>

			<form
				onsubmit={(e) => {
					e.preventDefault()
					saveMenuItem()
				}}
				class="space-y-4"
			>
				<div>
					<label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
						>Canteen</label
					>
					<select
						bind:value={itemForm.canteenId}
						required
						class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					>
						<option value="">Select a canteen</option>
						{#each canteens || [] as canteen}
							<option value={canteen.id.toString()}>{canteen.name}</option>
						{/each}
					</select>
				</div>

				<div>
					<label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
						>Name</label
					>
					<input
						type="text"
						bind:value={itemForm.name}
						required
						class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					/>
				</div>

				<div>
					<label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
						>Category</label
					>
					<input
						type="text"
						bind:value={itemForm.category}
						required
						placeholder="e.g. Main Course, Beverages, Snacks"
						class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					/>
				</div>

				<div>
					<label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
						>Price (₹)</label
					>
					<input
						type="number"
						step="0.01"
						bind:value={itemForm.price}
						required
						class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					/>
				</div>

				<div class="flex items-center space-x-4">
					<div class="flex items-center">
						<input type="checkbox" bind:checked={itemForm.isAvailable} class="mr-2" />
						<label class="text-sm font-medium text-gray-700 dark:text-gray-300"
							>Available</label
						>
					</div>

					<div class="flex items-center">
						<input type="checkbox" bind:checked={itemForm.isNonVeg} class="mr-2" />
						<label class="text-sm font-medium text-gray-700 dark:text-gray-300"
							>Non-Vegetarian</label
						>
					</div>
				</div>

				<div class="flex gap-3 pt-4">
					<Button.Root type="submit" class="flex-1">
						{editingItem ? 'Update' : 'Create'}
					</Button.Root>
					<Button.Root
						onclick={() => (showItemModal = false)}
						class="flex-1 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
					>
						Cancel
					</Button.Root>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Addon Modal -->
{#if showAddonModal}
	<div class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
		<div class="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
			<h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
				{editingAddon ? 'Edit Addon' : 'Add New Addon'}
			</h3>

			<form
				onsubmit={(e) => {
					e.preventDefault()
					saveAddon()
				}}
				class="space-y-4"
			>
				<div>
					<label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
						>Menu Item</label
					>
					<select
						bind:value={addonForm.itemId}
						required
						class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					>
						<option value="">Select a menu item</option>
						{#each menuItems || [] as item}
							<option value={item.id.toString()}
								>{item.name} ({getCanteenName(item.canteenId)})</option
							>
						{/each}
					</select>
				</div>

				<div>
					<label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
						>Name</label
					>
					<input
						type="text"
						bind:value={addonForm.name}
						required
						class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					/>
				</div>

				<div>
					<label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
						>Price (₹)</label
					>
					<input
						type="number"
						step="0.01"
						bind:value={addonForm.price}
						required
						class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					/>
				</div>

				<div class="flex gap-3 pt-4">
					<Button.Root type="submit" class="flex-1">
						{editingAddon ? 'Update' : 'Create'}
					</Button.Root>
					<Button.Root
						onclick={() => (showAddonModal = false)}
						class="flex-1 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
					>
						Cancel
					</Button.Root>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Variant Modal -->
{#if showVariantModal}
	<div class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
		<div class="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
			<h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
				{editingVariant ? 'Edit Variant' : 'Add New Variant'}
			</h3>

			<form
				onsubmit={(e) => {
					e.preventDefault()
					saveVariant()
				}}
				class="space-y-4"
			>
				<div>
					<label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
						>Menu Item</label
					>
					<select
						bind:value={variantForm.itemId}
						required
						class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					>
						<option value="">Select a menu item</option>
						{#each menuItems || [] as item}
							<option value={item.id.toString()}
								>{item.name} ({getCanteenName(item.canteenId)})</option
							>
						{/each}
					</select>
				</div>

				<div>
					<label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
						>Name</label
					>
					<input
						type="text"
						bind:value={variantForm.name}
						required
						placeholder="e.g. Small, Medium, Large"
						class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					/>
				</div>

				<div>
					<label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
						>Price (₹)</label
					>
					<input
						type="number"
						step="0.01"
						bind:value={variantForm.price}
						required
						class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					/>
				</div>

				<div class="flex gap-3 pt-4">
					<Button.Root type="submit" class="flex-1">
						{editingVariant ? 'Update' : 'Create'}
					</Button.Root>
					<Button.Root
						onclick={() => (showVariantModal = false)}
						class="flex-1 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
					>
						Cancel
					</Button.Root>
				</div>
			</form>
		</div>
	</div>
{/if}
