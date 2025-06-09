<script lang="ts">
	import { Button } from 'bits-ui'
	import { Clock, ChefHat, ArrowLeft, Plus, Edit, Settings } from 'lucide-svelte'
	import type { PageData } from './$types'
	import { goto } from '$app/navigation'
	import CrudModal from '$lib/components/CrudModal.svelte'
	import Addon from './components/addon.svelte'
	import Variant from './components/variant.svelte'

	let { data }: { data: PageData } = $props()
	$effect(() => {
		data = data
	})

	let crudModalValues = $state({
		show: false,
		entity: '',
		editing: false,
		item: null as any,
	})

	function getFoodTypeIcon(type: string) {
		if (type === 'veg') return '🟢'
		if (type === 'non-veg') return '🔴'
		if (type === 'egg') return '🟠'
		return ''
	}

	function openCrudModal(entity: string, editing = true, item: any = null) {
		crudModalValues.entity = entity
		crudModalValues.editing = editing
		if (!editing && entity === 'menuItem') {
			crudModalValues.item = {
				canteenId: data.canteen?.id,
				category: item?.category || '',
				...item,
			}
		} else {
			crudModalValues.item = item
		}
		crudModalValues.show = true
	}

	function closeCrudModal() {
		crudModalValues.show = false
		crudModalValues.entity = ''
		crudModalValues.editing = false
		crudModalValues.item = null
	}

	let crudModalFields = $derived([
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
			value: crudModalValues.item?.category || '',
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
			value: crudModalValues.editing ? crudModalValues.item?.available : true,
		},
		{
			name: 'active',
			label: 'Active',
			type: 'switch' as const,
			value: crudModalValues.editing ? crudModalValues.item?.active : true,
		},
	])
</script>

<svelte:head>
	<title>Manage {data.canteen?.name || 'Canteen'}</title>
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
		<Button.Root
			class="flex items-center gap-1 rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
			onclick={() => goto('/manage/canteens')}
		>
			<ArrowLeft size={16} />
			<span>Back to Manage</span>
		</Button.Root>

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

		<div class="space-y-8">
			{#if data.menuCategories && Object.keys(data.menuCategories).length > 0}
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

									<div
										class="mt-4 grid grid-cols-1 gap-4 border-t border-gray-200 pt-4 md:grid-cols-2 dark:border-gray-700"
									>
										<Addon {item} />
										<Variant {item} />
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

	<CrudModal
		bind:open={crudModalValues.show}
		editing={crudModalValues.editing}
		entityName={crudModalValues.entity}
		item={crudModalValues.item}
		fields={crudModalFields}
		addAction='?/addMenuItem'
		updateAction='?/updateMenuItem'
		onClose={closeCrudModal}
	/>
</div>
