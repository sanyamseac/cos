<script lang="ts">
	import { Button } from 'bits-ui'
	import { Clock, ChefHat, ArrowLeft, Plus, Edit, Settings } from 'lucide-svelte'
	import type { PageData } from './$types'
	import { goto } from '$app/navigation'
	import CrudModal from '$lib/components/CrudModal.svelte'

	// Import page data
	let { data }: { data: PageData } = $props()
	$effect(() => {
		// Update when data changes
		data = data
	})

	// Admin state variables only
	let showCrudModal = $state(false)
	let crudModalEntity = $state('')
	let crudModalEditing = $state(false)
	let crudModalItem: any = $state(null)

	// Admin success message state
	let showSuccessMessage = $state(false)
	let successMessage = $state('')

	// Get food type icon
	function getFoodTypeIcon(type: string) {
		if (type === 'veg') return '🟢'
		if (type === 'non-veg') return '🔴'
		if (type === 'egg') return '🟠'
		return ''
	}

	// Admin functions
	function openCrudModal(entity: string, editing = false, item: any = null) {
		crudModalEntity = entity
		crudModalEditing = editing
		// Ensure canteen ID is properly set for new items
		if (!editing && entity === 'menuItem') {
			crudModalItem = {
				canteenId: data.canteen?.id,
				category: item?.category || '',
				...item,
			}
		} else {
			crudModalItem = item
		}
		showCrudModal = true
	}

	function closeCrudModal() {
		showCrudModal = false
		crudModalEntity = ''
		crudModalEditing = false
		crudModalItem = null
	}

	// Field definitions for CRUD operations
	function getCrudFields(entity: string) {
		switch (entity) {
			case 'menuItem':
				return [
					{
						name: 'canteenId',
						label: 'Canteen ID',
						type: 'hidden' as const,
						value: data.canteen?.id?.toString() || '',
					},
					{
						name: 'category',
						label: 'Category',
						type: 'text' as const,
						required: true,
						placeholder: 'e.g., Main Course, Snacks',
						value: crudModalItem?.category || '',
					},
					{
						name: 'name',
						label: 'Name',
						type: 'text' as const,
						required: true,
						placeholder: 'Enter item name',
					},
					{
						name: 'price',
						label: 'Price',
						type: 'number' as const,
						required: true,
						step: '0.01',
						placeholder: '0.00',
					},
					{
						name: 'description',
						label: 'Description',
						type: 'textarea' as const,
						placeholder: 'Item description (optional)',
					},
					{
						name: 'type',
						label: 'Food Type',
						type: 'select' as const,
						required: true,
						options: [
							{ value: 'veg', label: 'Vegetarian' },
							{ value: 'non-veg', label: 'Non-Vegetarian' },
							{ value: 'egg', label: 'Contains Egg' },
						],
					},
					{
						name: 'available',
						label: 'Available',
						type: 'switch' as const,
						value: crudModalEditing ? crudModalItem?.available : true,
					},
					{
						name: 'active',
						label: 'Active',
						type: 'switch' as const,
						value: crudModalEditing ? crudModalItem?.active : true,
					},
				]
			case 'addon':
				return [
					{
						name: 'itemId',
						label: 'Item ID',
						type: 'hidden' as const,
						value: (crudModalItem?.itemId || crudModalItem?.id)?.toString() || '',
					},
					{
						name: 'name',
						label: 'Name',
						type: 'text' as const,
						required: true,
						placeholder: 'Enter addon name',
					},
					{
						name: 'price',
						label: 'Price',
						type: 'number' as const,
						required: true,
						step: '0.01',
						placeholder: '0.00',
					},
					{
						name: 'type',
						label: 'Food Type',
						type: 'select' as const,
						required: true,
						options: [
							{ value: 'veg', label: 'Vegetarian' },
							{ value: 'non-veg', label: 'Non-Vegetarian' },
							{ value: 'egg', label: 'Contains Egg' },
						],
					},
					{
						name: 'available',
						label: 'Available',
						type: 'switch' as const,
						value: crudModalEditing ? crudModalItem?.available : true,
					},
					{
						name: 'active',
						label: 'Active',
						type: 'switch' as const,
						value: crudModalEditing ? crudModalItem?.active : true,
					},
				]
			case 'variant':
				return [
					{
						name: 'itemId',
						label: 'Item ID',
						type: 'hidden' as const,
						value: (crudModalItem?.itemId || crudModalItem?.id)?.toString() || '',
					},
					{
						name: 'name',
						label: 'Name',
						type: 'text' as const,
						required: true,
						placeholder: 'Enter variant name',
					},
					{
						name: 'price',
						label: 'Price',
						type: 'number' as const,
						required: true,
						step: '0.01',
						placeholder: '0.00',
					},
					{
						name: 'available',
						label: 'Available',
						type: 'switch' as const,
						value: crudModalEditing ? crudModalItem?.available : true,
					},
					{
						name: 'active',
						label: 'Active',
						type: 'switch' as const,
						value: crudModalEditing ? crudModalItem?.active : true,
					},
				]
			default:
				return []
		}
	}

	function getCrudActions(entity: string) {
		switch (entity) {
			case 'menuItem':
				return { add: '?/addMenuItem', update: '?/updateMenuItem' }
			case 'addon':
				return { add: '?/addAddon', update: '?/updateAddon' }
			case 'variant':
				return { add: '?/addVariant', update: '?/updateVariant' }
			default:
				return { add: '?/default', update: '?/default' }
		}
	}
</script>

<svelte:head>
	<title>Manage {data.canteen?.name || 'Canteen'} - Admin Panel</title>
	<meta
		name="description"
		content="Admin panel for managing {data.canteen?.name ||
			'canteen'} menu items, variants, and addons."
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
		<div class="flex items-center justify-between">
			<Button.Root
				class="flex items-center gap-1 rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
				onclick={() => goto('/manage/canteens')}
			>
				<ArrowLeft size={16} />
				<span>Back to Manage</span>
			</Button.Root>

			<div class="flex items-center gap-2">
				<Settings size={20} class="text-blue-600" />
				<span class="text-sm font-medium text-blue-600">Admin Panel</span>
			</div>
		</div>

		<!-- Canteen Info Header -->
		{#if data.canteen}
			<div class="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
				<div class="flex items-start justify-between">
					<div class="flex-1">
						<h1
							class="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent md:text-4xl"
						>
							Managing: {data.canteen.name}
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

		<!-- Menu Management -->
		<div class="space-y-8">
			{#if data.menuCategories && Object.keys(data.menuCategories).length > 0}
				<!-- Common Add Item Button -->
				<div class="flex justify-center">
					<Button.Root
						onclick={() =>
							openCrudModal('menuItem', false, { canteenId: data.canteen?.id })}
						class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-md transition-all hover:bg-blue-700"
					>
						<Plus size={18} />
						Add New Menu Item
					</Button.Root>
				</div>

				{#each Object.entries(data.menuCategories) as [category, items]}
					<div class="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
						<div class="mb-6 flex items-center justify-between">
							<h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200">
								{category}
							</h2>
							<Button.Root
								onclick={() =>
									openCrudModal('menuItem', false, {
										canteenId: data.canteen?.id,
										category,
									})}
								class="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-green-700"
							>
								<Plus size={16} />
								Add Item to {category}
							</Button.Root>
						</div>

						<div class="space-y-4">
							{#each items as item}
								<div
									class="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
								>
									<div class="flex items-start justify-between">
										<div class="flex-1">
											<div class="mb-2 flex items-center gap-2">
												<span class="text-lg" title={item.type}
													>{getFoodTypeIcon(item.type)}</span
												>
												<h3
													class="text-lg font-medium text-gray-900 dark:text-white"
												>
													{item.name}
												</h3>
												<span class="text-lg font-semibold text-green-600"
													>₹{item.price}</span
												>
											</div>

											<div class="mb-2 flex flex-wrap gap-2">
												{#if !item.active}
													<span
														class="inline-block rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200"
													>
														Inactive
													</span>
												{/if}
												{#if !item.available}
													<span
														class="inline-block rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-800 dark:bg-orange-900 dark:text-orange-200"
													>
														Unavailable
													</span>
												{/if}
											</div>

											{#if item.description}
												<p
													class="mb-3 text-sm text-gray-600 dark:text-gray-300"
												>
													{item.description}
												</p>
											{/if}
										</div>

										<Button.Root
											class="flex items-center gap-1 rounded-lg bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700 transition-all hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
											onclick={() => openCrudModal('menuItem', true, item)}
										>
											<Edit size={14} />
											Edit Item
										</Button.Root>
									</div>

									<!-- Addons and Variants Management -->
									<div
										class="mt-4 grid grid-cols-1 gap-4 border-t border-gray-200 pt-4 md:grid-cols-2 dark:border-gray-700"
									>
										<!-- Addons Section -->
										<div>
											<div class="mb-3 flex items-center justify-between">
												<h4
													class="font-medium text-gray-700 dark:text-gray-300"
												>
													Addons
												</h4>
												<Button.Root
													onclick={() =>
														openCrudModal('addon', false, {
															itemId: item.id,
														})}
													class="flex items-center gap-1 rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-700 transition-all hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800"
												>
													<Plus size={12} />
													Add Addon
												</Button.Root>
											</div>
											{#if data.addons.filter((a) => a.itemId === item.id).length > 0}
												{@const itemAddons = data.addons.filter(
													(a) => a.itemId === item.id,
												)}
												<div class="space-y-2">
													{#each itemAddons as addon}
														<div
															class="flex items-center justify-between rounded-md bg-gray-50 p-2 dark:bg-gray-700"
														>
															<div class="flex items-center gap-2">
																<span
																	class="text-sm"
																	title={addon.type}
																	>{getFoodTypeIcon(
																		addon.type,
																	)}</span
																>
																<span class="text-sm font-medium"
																	>{addon.name}</span
																>
																<span class="text-sm text-green-600"
																	>₹{addon.price}</span
																>
																<div class="flex gap-1">
																	{#if !addon.active}
																		<span
																			class="inline-block rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200"
																		>
																			Inactive
																		</span>
																	{/if}
																	{#if !addon.available}
																		<span
																			class="inline-block rounded-full bg-orange-100 px-1.5 py-0.5 text-xs font-medium text-orange-800 dark:bg-orange-900 dark:text-orange-200"
																		>
																			Unavailable
																		</span>
																	{/if}
																</div>
															</div>
															<Button.Root
																onclick={() =>
																	openCrudModal(
																		'addon',
																		true,
																		addon,
																	)}
																class="text-blue-600 hover:text-blue-800 dark:text-blue-400"
															>
																<Edit size={12} />
															</Button.Root>
														</div>
													{/each}
												</div>
											{:else}
												<p class="text-sm text-gray-500 dark:text-gray-400">
													No addons configured
												</p>
											{/if}
										</div>

										<!-- Variants Section -->
										<div>
											<div class="mb-3 flex items-center justify-between">
												<h4
													class="font-medium text-gray-700 dark:text-gray-300"
												>
													Variants
												</h4>
												<Button.Root
													onclick={() =>
														openCrudModal('variant', false, {
															itemId: item.id,
														})}
													class="flex items-center gap-1 rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-700 transition-all hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800"
												>
													<Plus size={12} />
													Add Variant
												</Button.Root>
											</div>
											{#if data.variants.filter((v) => v.itemId === item.id).length > 0}
												{@const itemVariants = data.variants.filter(
													(v) => v.itemId === item.id,
												)}
												<div class="space-y-2">
													{#each itemVariants as variant}
														<div
															class="flex items-center justify-between rounded-md bg-gray-50 p-2 dark:bg-gray-700"
														>
															<div class="flex items-center gap-2">
																<span class="text-sm font-medium"
																	>{variant.name}</span
																>
																<span class="text-sm text-green-600"
																	>₹{variant.price}</span
																>
																<div class="flex gap-1">
																	{#if !variant.active}
																		<span
																			class="inline-block rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200"
																		>
																			Inactive
																		</span>
																	{/if}
																	{#if !variant.available}
																		<span
																			class="inline-block rounded-full bg-orange-100 px-1.5 py-0.5 text-xs font-medium text-orange-800 dark:bg-orange-900 dark:text-orange-200"
																		>
																			Unavailable
																		</span>
																	{/if}
																</div>
															</div>
															<Button.Root
																onclick={() =>
																	openCrudModal(
																		'variant',
																		true,
																		variant,
																	)}
																class="text-blue-600 hover:text-blue-800 dark:text-blue-400"
															>
																<Edit size={12} />
															</Button.Root>
														</div>
													{/each}
												</div>
											{:else}
												<p class="text-sm text-gray-500 dark:text-gray-400">
													No variants configured
												</p>
											{/if}
										</div>
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/each}
			{:else}
				<div class="rounded-lg bg-white p-8 text-center shadow-sm dark:bg-gray-800">
					<p class="mb-4 text-gray-500 dark:text-gray-400">
						No menu items found for this canteen.
					</p>
					<Button.Root
						onclick={() =>
							openCrudModal('menuItem', false, { canteenId: data.canteen?.id })}
						class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700"
					>
						<Plus size={16} />
						Add First Menu Item
					</Button.Root>
				</div>
			{/if}
		</div>
	</div>

	<!-- CRUD Modal -->
	<CrudModal
		bind:open={showCrudModal}
		editing={crudModalEditing}
		entityName={crudModalEntity}
		item={crudModalItem}
		fields={getCrudFields(crudModalEntity)}
		addAction={getCrudActions(crudModalEntity).add}
		updateAction={getCrudActions(crudModalEntity).update}
		onClose={closeCrudModal}
	/>
</div>
