<script lang="ts">
	import { Button } from 'bits-ui'
	import {
		Clock,
		MapPin,
		ChefHat,
		Star,
		ArrowRight,
		Plus,
		Edit,
		Trash2,
		Settings,
		ArrowLeft,
	} from 'lucide-svelte'
	import type { PageData } from '../$types'
	import { enhance } from '$app/forms'
	import CrudModal from '$lib/components/CrudModal.svelte'
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte'
	import { fly, fade } from 'svelte/transition'
	import { goto } from '$app/navigation'

	let { data }: { data: PageData } = $props()

	// Modal state
	let showCrudModal = $state(false)
	let editingCanteen = $state(false)
	let selectedCanteen = $state(null)
	let showDeleteDialog = $state(false)
	let isLoading = $state(false)

	// Success message state
	let showSuccessMessage = $state(false)
	let successMessage = $state('')

	// Field definitions for CRUD modal
	const canteenFields = [
		{
			name: 'name',
			label: 'Name',
			type: 'text' as const,
			required: true,
			placeholder: 'Enter canteen name',
		},
		{
			name: 'acronym',
			label: 'Acronym',
			type: 'text' as const,
			required: true,
			placeholder: 'Enter canteen acronym (unique identifier)',
		},
		{
			name: 'timings',
			label: 'Timings',
			type: 'text' as const,
			required: true,
			placeholder: 'e.g., 8:00 AM - 10:00 PM',
		},
		{
			name: 'description',
			label: 'Description',
			type: 'textarea' as const,
			required: true,
			placeholder: 'Describe the canteen and its specialties',
		},
		{ name: 'open', label: 'Currently Open', type: 'switch' as const },
		{ name: 'active', label: 'Active', type: 'switch' as const },
	]

	// Functions for modal handling
	function handleAddCanteen() {
		selectedCanteen = null
		editingCanteen = false
		showCrudModal = true
	}

	function handleEditCanteen(canteen: any) {
		selectedCanteen = canteen
		editingCanteen = true
		showCrudModal = true
	}

	function closeCrudModal() {
		showCrudModal = false
		selectedCanteen = null
		editingCanteen = false
	}

	function showSuccess(message: string) {
		successMessage = message
		showSuccessMessage = true
		setTimeout(() => {
			showSuccessMessage = false
		}, 3000)
	}

	// Function to get canteen status badge
	function getStatusBadge(isOpen: boolean) {
		return isOpen
			? {
					text: 'Open',
					class: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
				}
			: { text: 'Closed', class: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' }
	}

	// Function to get canteen emoji/icon based on name
	function getCanteenEmoji(name: string) {
		if (name.toLowerCase().includes('main') || name.toLowerCase().includes('central'))
			return '🍽️'
		if (name.toLowerCase().includes('coffee') || name.toLowerCase().includes('cafe'))
			return '☕'
		if (name.toLowerCase().includes('juice') || name.toLowerCase().includes('smoothie'))
			return '🥤'
		if (name.toLowerCase().includes('snack')) return '🍿'
		if (name.toLowerCase().includes('health')) return '🥗'
		if (name.toLowerCase().includes('night') || name.toLowerCase().includes('late')) return '🌙'
		return '🍴'
	}
</script>

<svelte:head>
	<title>Manage Canteens - IIIT Canteen Ordering System</title>
	<meta
		name="description"
		content="Admin panel to manage canteens in the IIIT Canteen Ordering System."
	/>
</svelte:head>

<div
	class="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
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

	<div class="relative z-10 space-y-8 p-6">
		<!-- Back Button -->
		<div>
			<Button.Root
				class="flex items-center gap-1 rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
				onclick={() => goto('/manage')}
			>
				<ArrowLeft size={16} />
				<span>Back to Manage</span>
			</Button.Root>
		</div>

		<!-- Header Section -->
		<div class="space-y-4 text-center">
			<div class="mb-4 flex items-center justify-center gap-3">
				<Settings size={32} class="text-indigo-600" />
				<h1
					class="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent md:text-5xl"
				>
					Manage Canteens
				</h1>
			</div>
			<p class="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
				Admin panel to manage all canteens, their details, and operational status.
			</p>

			<!-- Add Canteen Button -->
			<div class="flex justify-center">
				<Button.Root
					onclick={handleAddCanteen}
					class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 font-semibold text-white transition-all duration-300 hover:from-indigo-600 hover:to-purple-700"
				>
					<Plus size={20} />
					<span>Add New Canteen</span>
				</Button.Root>
			</div>
		</div>

		<!-- Canteens Grid -->
		<div class="mx-auto max-w-6xl">
			{#if data.canteens && data.canteens.length > 0}
				<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{#each data.canteens as canteen}
						{@const status = getStatusBadge(canteen.open)}
						<div
							class="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-xl dark:border-gray-700 dark:bg-gray-800"
						>
							<!-- Canteen Header -->
							<div class="p-6 pb-4">
								<div class="mb-4 flex items-start justify-between">
									<div class="flex items-center gap-3">
										<div class="text-3xl">{getCanteenEmoji(canteen.name)}</div>
										<div>
											<h3
												class="text-xl font-bold text-gray-900 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400"
											>
												{canteen.name}
											</h3>
											<span
												class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {status.class}"
											>
												{status.text}
											</span>
										</div>
									</div>

									<!-- Admin Action Buttons -->
									<Button.Root
										onclick={() => handleEditCanteen(canteen)}
										class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 transition-all hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
										title="Edit canteen"
									>
										<Edit size={14} />
									</Button.Root>
								</div>

								<!-- Admin Status Badges -->
								<div class="mb-4 flex flex-wrap gap-2">
									{#if !canteen.active}
										<span
											class="inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200"
										>
											Inactive
										</span>
									{/if}
									<span
										class="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200"
									>
										ID: {canteen.acronym}
									</span>
								</div>

								<!-- Description -->
								{#if canteen.description}
									<p
										class="mb-4 line-clamp-2 text-sm text-gray-600 dark:text-gray-300"
									>
										{canteen.description}
									</p>
								{/if}

								<!-- Timings -->
								<div
									class="mb-4 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400"
								>
									<Clock size={16} />
									<span>{canteen.timings}</span>
								</div>
							</div>

							<!-- Action Button -->
							<div class="px-6 pb-6">
								<Button.Root
									class="group/btn w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3 font-semibold text-white transition-all duration-300 hover:from-indigo-600 hover:to-purple-700"
									onclick={() => goto(`/manage/canteens/${canteen.acronym}`)}
								>
									<div class="flex items-center justify-center gap-2">
										<span>Manage Menu</span>
										<ArrowRight
											size={16}
											class="transition-transform group-hover/btn:translate-x-1"
										/>
									</div>
								</Button.Root>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<!-- Empty State -->
				<div class="py-16 text-center">
					<div
						class="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800"
					>
						<ChefHat size={32} class="text-gray-400" />
					</div>
					<h3 class="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
						No Canteens Available
					</h3>
					<p class="mx-auto max-w-md text-gray-500 dark:text-gray-400">
						No canteens have been set up yet. Add your first canteen to get started.
					</p>
				</div>
			{/if}
		</div>
	</div>
</div>

<!-- CRUD Modal -->
<CrudModal
	bind:open={showCrudModal}
	editing={editingCanteen}
	entityName="Canteen"
	item={selectedCanteen}
	fields={canteenFields}
	addAction="?/addCanteen"
	updateAction="?/updateCanteen"
	onClose={closeCrudModal}
/>

<!-- Success Message -->
{#if showSuccessMessage && successMessage}
	<div
		transition:fade={{ duration: 300 }}
		class="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 transform rounded-full bg-green-600 px-6 py-3 text-center text-white shadow-lg"
	>
		<span>{successMessage}</span>
	</div>
{/if}
