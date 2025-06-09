<script lang="ts">
	import { Dialog, Label, Switch, Select } from 'bits-ui'
	import { enhance } from '$app/forms'
	import { X } from 'lucide-svelte'
	import Check from 'phosphor-svelte/lib/Check'
	import CaretUpDown from 'phosphor-svelte/lib/CaretUpDown'
	import CaretDoubleUp from 'phosphor-svelte/lib/CaretDoubleUp'
	import CaretDoubleDown from 'phosphor-svelte/lib/CaretDoubleDown'
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte'

	interface Field {
		name: string
		label: string
		type: 'text' | 'number' | 'textarea' | 'select' | 'switch' | 'hidden' | 'file'
		required?: boolean
		placeholder?: string
		options?: { value: string | number; label: string }[]
		step?: string
		value?: any
		accept?: string
	}

	interface Props {
		open: boolean
		editing: boolean
		entityName: string
		item?: any
		fields: Field[]
		addAction: string
		updateAction: string
		onClose: () => void
	}

	let {
		open = $bindable(),
		editing = false,
		entityName,
		item = null,
		fields = [],
		addAction,
		updateAction,
		onClose,
	}: Props = $props()

	let loading = $state(false)
	let showConfirmDialog = $state(false)
	let formRef: HTMLFormElement | undefined = $state()
	let formData = $state<Record<string, any>>({})

	// Initialize form data based on fields
	function initializeForm() {
		const data: Record<string, any> = {}
		fields.forEach((field) => {
			// Check if field has a predefined value first
			if (field.value !== undefined) {
				data[field.name] = field.value
			} else if (editing && item && field.name in item) {
				if (field.type === 'switch') {
					// Always coerce to boolean
					data[field.name] = Boolean(item[field.name])
				} else if (field.type === 'select' && typeof item[field.name] === 'number') {
					data[field.name] = item[field.name].toString()
				} else if (field.type === 'number' && typeof item[field.name] === 'number') {
					data[field.name] = item[field.name].toString()
				} else {
					data[field.name] = item[field.name] ?? getDefaultValue(field)
				}
			} else {
				if (field.type === 'switch') {
					data[field.name] = field.value ?? false
				} else {
					data[field.name] = field.value ?? getDefaultValue(field)
				}
			}
		})
		return data
	}

	function getDefaultValue(field: Field) {
		switch (field.type) {
			case 'switch':
				return false // Always default to false for switches
			case 'number':
			case 'text':
			case 'textarea':
			case 'select':
				return ''
			default:
				return ''
		}
	}

	let lastOpenState = $state(false)

	// Only initialize form when modal opens, track open state to prevent re-initialization
	$effect(() => {
		if (open && !lastOpenState) {
			formData = initializeForm()
		}
		lastOpenState = open
	})

	function handleConfirm() {
		showConfirmDialog = true
	}

	function handleActualSubmit() {
		showConfirmDialog = false
		formRef?.requestSubmit()
	}

	function getSelectOptions(field: Field) {
		return field.options || []
	}

	function getSelectedLabel(field: Field, value: string) {
		const option = getSelectOptions(field).find((opt) => opt.value.toString() === value)
		return option?.label || 'Select...'
	}

	function getSwitchBinding(field) {
		return {
			get: () => formData[field.name] ?? false,
			set: (v) => (formData[field.name] = v),
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Portal>
		<Dialog.Overlay
			class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
		/>
		<Dialog.Content
			class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:scale-out data-[state=open]:scale-in fixed top-1/2 left-1/2 z-50 max-h-[90vh] w-[90%] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-0 shadow-xl dark:border-gray-700 dark:bg-gray-800"
		>
			<!-- Header with gradient background -->
			<div
				class="border-b border-gray-100 bg-gradient-to-r from-indigo-500 to-purple-600 p-6 dark:border-gray-700"
			>
				<Dialog.Title class="text-center text-xl font-semibold text-white">
					{editing ? `Edit ${entityName}` : `Add New ${entityName}`}
				</Dialog.Title>
				<Dialog.Description class="mt-1 text-center text-sm text-white/80">
					{editing
						? `Update ${entityName.toLowerCase()} details`
						: `Create a new ${entityName.toLowerCase()}`}
				</Dialog.Description>
			</div>

			<!-- Form container with padding -->
			<div class="p-6">
				<form
					bind:this={formRef}
					method="post"
					action={editing ? updateAction : addAction}
					class="space-y-5"
					use:enhance={() => {
						loading = true
						return async ({ result, update }) => {
							loading = false
							if (result.type === 'success') {
								onClose()
							}
							await update()
						}
					}}
					enctype="multipart/form-data"
				>
					{#if editing && item}
						<input type="hidden" name="id" value={item.id} />
					{/if}

					{#each fields as field}
						{#if field.type === 'hidden'}
							<input type="hidden" name={field.name} value={formData[field.name]} />
						{:else if field.type === 'select'}
							<div>
								<Label.Root
									class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
								>
									{field.label}
									{#if field.required}<span class="text-red-500">*</span>{/if}
								</Label.Root>
								<Select.Root type="single" bind:value={formData[field.name]}>
									<input
										type="hidden"
										name={field.name}
										value={formData[field.name]}
									/>
									<Select.Trigger
										class="inline-flex h-12 w-full items-center rounded-xl border-2 border-gray-200 bg-white px-4 text-base transition-all select-none focus:border-transparent focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
										aria-label={`Select ${field.label.toLowerCase()}`}
									>
										{#if formData[field.name]}
											{getSelectedLabel(field, formData[field.name])}
										{:else}
											<span class="text-gray-500 dark:text-gray-400"
												>{field.placeholder ||
													`Select ${field.label.toLowerCase()}`}</span
											>
										{/if}
										<CaretUpDown class="ml-auto size-4 text-gray-500" />
									</Select.Trigger>
									<Select.Portal>
										<Select.Content
											class="z-50 max-h-60 w-[var(--bits-select-anchor-width)] min-w-[var(--bits-select-anchor-width)] rounded-xl border border-gray-200 bg-white p-1 shadow-lg select-none dark:border-gray-700 dark:bg-gray-800"
											sideOffset={4}
										>
											<Select.ScrollUpButton
												class="flex w-full items-center justify-center py-1"
											>
												<CaretDoubleUp class="size-3" />
											</Select.ScrollUpButton>
											<Select.Viewport class="p-1">
												{#each getSelectOptions(field) as option}
													<Select.Item
														class="flex h-10 w-full cursor-pointer items-center rounded-lg px-3 py-2 text-sm outline-none select-none hover:bg-gray-100 dark:hover:bg-gray-700"
														value={option.value.toString()}
														label={option.label}
													>
														{#snippet children({ selected })}
															{option.label}
															{#if selected}
																<div class="ml-auto">
																	<Check class="size-4" />
																</div>
															{/if}
														{/snippet}
													</Select.Item>
												{/each}
											</Select.Viewport>
											<Select.ScrollDownButton
												class="flex w-full items-center justify-center py-1"
											>
												<CaretDoubleDown class="size-3" />
											</Select.ScrollDownButton>
										</Select.Content>
									</Select.Portal>
								</Select.Root>
							</div>
						{:else if field.type === 'switch'}
							<div class="flex items-center justify-between py-2">
								<Label.Root
									class="text-sm font-medium text-gray-700 dark:text-gray-300"
								>
									{field.label}
								</Label.Root>
								<input
									type="hidden"
									name={field.name}
									value={formData[field.name] ? 'true' : 'false'}
								/>
								<Switch.Root
									checked={formData[field.name] ?? false}
									onCheckedChange={(v: boolean) => (formData[field.name] = v)}
									class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 data-[state=checked]:bg-indigo-600 data-[state=unchecked]:bg-gray-200 dark:data-[state=unchecked]:bg-gray-700"
								>
									<Switch.Thumb
										class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-1"
									/>
								</Switch.Root>
							</div>
						{:else if field.type === 'textarea'}
							<div>
								<Label.Root
									class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
								>
									{field.label}
									{#if field.required}<span class="text-red-500">*</span>{/if}
								</Label.Root>
								<textarea
									name={field.name}
									bind:value={formData[field.name]}
									required={field.required}
									placeholder={field.placeholder}
									class="h-24 w-full resize-none rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 transition-all focus:border-transparent focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
								></textarea>
							</div>
						{:else if field.type === 'file'}
							<div>
								<Label.Root
									class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
								>
									{field.label}
									{#if field.required}<span class="text-red-500">*</span>{/if}
								</Label.Root>
								<input
									type="file"
									name={field.name}
									required={field.required}
									class="block w-full rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-500 file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-indigo-500 file:to-purple-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:from-indigo-600 hover:file:to-purple-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
									accept={field.accept || 'image/*'}
								/>
							</div>
						{:else}
							<div>
								<Label.Root
									class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
								>
									{field.label}
									{#if field.required}<span class="text-red-500">*</span>{/if}
								</Label.Root>
								<input
									type={field.type}
									step={field.step}
									name={field.name}
									bind:value={formData[field.name]}
									required={field.required}
									placeholder={field.placeholder}
									class="h-12 w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 transition-all focus:border-transparent focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
								/>
							</div>
						{/if}
					{/each}

					<div class="mt-8 flex gap-3 pt-4">
						<button
							type="button"
							onclick={handleConfirm}
							disabled={loading}
							class="flex-1 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-md transition-all hover:from-indigo-600 hover:to-purple-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
						>
							{#if loading}
								<div
									class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
								></div>
							{/if}
							{editing ? 'Update' : 'Create'}
						</button>
						<button
							type="button"
							onclick={onClose}
							disabled={loading}
							class="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
						>
							Cancel
						</button>
					</div>
				</form>
			</div>

			<Dialog.Close
				onclick={onClose}
				class="absolute top-4 right-4 rounded-full bg-white/20 p-1 opacity-70 backdrop-blur-sm transition-all hover:opacity-100 focus:ring-2 focus:ring-white focus-visible:outline-none"
			>
				<X class="h-4 w-4 text-white" />
				<span class="sr-only">Close</span>
			</Dialog.Close>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>

<ConfirmDialog
	bind:open={showConfirmDialog}
	title={editing ? `Update ${entityName}?` : `Create ${entityName}?`}
	description={editing
		? `Are you sure you want to update this ${entityName.toLowerCase()}?`
		: `Are you sure you want to create this ${entityName.toLowerCase()}?`}
	onClose={() => (showConfirmDialog = false)}
	onConfirm={handleActualSubmit}
	{loading}
/>
