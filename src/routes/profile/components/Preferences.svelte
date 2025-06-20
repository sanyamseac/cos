<script lang="ts">
	import { enhance } from '$app/forms'
	import { Select } from 'bits-ui'
	import { Lock, Palette, Check } from 'lucide-svelte'
	import { CaretUpDown, CaretDoubleUp, CaretDoubleDown } from 'phosphor-svelte'
	import { onMount } from 'svelte'

	let { data }: { data: any } = $props()
	let profileVisibility = $state(data.user.profileVisibility)
	let visibilityFormRef: HTMLFormElement | null = $state(null)

	const visibilityOptions = [
		{ value: 'public', label: 'Public' },
		{ value: 'private', label: 'Private' },
	]

	let themeMode = $state<string>('system')
	const themes = [
		{ value: 'light', label: 'Light' },
		{ value: 'dark', label: 'Dark' },
		{ value: 'system', label: 'System' },
	]
	const FullName = $derived(getThemeLabel(themeMode))
	function updateTheme(mode: string) {
		themeMode = mode
		if (mode === 'system') {
			const isDarkSystem = window.matchMedia('(prefers-color-scheme: dark)').matches
			if (isDarkSystem) {
				document.documentElement.classList.add('dark')
			} else {
				document.documentElement.classList.remove('dark')
			}
		} else if (mode === 'dark') {
			document.documentElement.classList.add('dark')
		} else {
			document.documentElement.classList.remove('dark')
		}
	}
	function getThemeLabel(mode: string) {
		return themes.find((theme) => theme.value === mode)?.label || 'System'
	}

	onMount(async () => {
		themeMode = (localStorage.getItem('theme') as string) || 'system'
		updateTheme(themeMode)
	})

	$effect(() => {
		localStorage.setItem('theme', themeMode)
	})
</script>

<div
	class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
>
	<div class="mb-6 flex items-center gap-3">
		<div class="rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 p-2">
			<Lock class="h-5 w-5 text-white" />
		</div>
		<h3 class="text-lg font-semibold text-gray-800 dark:text-white">Your Preferences</h3>
	</div>
	<div class="space-y-4">
		<div class="space-y-2">
			<p class="font-medium text-gray-800 dark:text-white">Profile Visibility</p>
			<Select.Root
				type="single"
				items={visibilityOptions}
				bind:value={profileVisibility}
				onValueChange={(e) =>
					setTimeout(() => {
						visibilityFormRef?.requestSubmit(), 500
					})}
			>
				<Select.Trigger
					class="rounded-9px border-border-input data-placeholder:text-foreground-alt/50 text-md inline-flex h-10 w-full items-center border px-[8px] transition-colors select-none"
					aria-label="Select a visibility option"
				>
					<Palette class="text-muted-foreground mr-[9px] size-5" />
					{profileVisibility == 'private' ? 'Private' : 'Public'}
					<CaretUpDown class="text-muted-foreground ml-auto size-5" />
				</Select.Trigger>
				<Select.Portal>
					<Select.Content
						class="focus-override border-muted shadow-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 h-28 max-h-[var(--bits-select-content-available-height)] w-[var(--bits-select-anchor-width)] min-w-[var(--bits-select-anchor-width)] rounded-xl border bg-gray-200 px-1 py-3 outline-hidden select-none data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1 dark:bg-gray-700"
						sideOffset={20}
					>
						<Select.ScrollUpButton class="flex w-full items-center justify-center">
							<CaretDoubleUp class="size-3" />
						</Select.ScrollUpButton>
						<Select.Viewport class="p-1">
							{#each visibilityOptions as option}
								<Select.Item
									class="rounded-button data-highlighted:bg-muted text-md flex h-10 w-full items-center py-3 pr-1.5 pl-5 capitalize outline-hidden select-none data-disabled:opacity-50"
									value={option.value}
									label={option.label}
								>
									{#snippet children({ selected })}
										{option.label}
										{#if selected}
											<div class="ml-auto">
												<Check aria-label="check" />
											</div>
										{/if}
									{/snippet}
								</Select.Item>
							{/each}
						</Select.Viewport>
						<Select.ScrollDownButton class="flex w-full items-center justify-center">
							<CaretDoubleDown class="size-3" />
						</Select.ScrollDownButton>
					</Select.Content>
				</Select.Portal>
			</Select.Root>
			<form
				bind:this={visibilityFormRef}
				method="post"
				action="?/updateProfileVisibility"
				use:enhance
			>
				<input type="hidden" name="visibility" value={profileVisibility} />
			</form>
			<p class="font-medium text-gray-800 dark:text-white">Theme</p>
			<Select.Root
				type="single"
				onValueChange={(value) => updateTheme(value as string)}
				items={themes}
				value={themeMode}
			>
				<Select.Trigger
					class="rounded-9px border-border-input data-placeholder:text-foreground-alt/50 text-md inline-flex h-10 w-full items-center border px-[8px] transition-colors select-none"
					aria-label="Select a theme"
				>
					<Palette class="text-muted-foreground mr-[9px] size-5" />
					{FullName}
					<CaretUpDown class="text-muted-foreground ml-auto size-5" />
				</Select.Trigger>
				<Select.Portal>
					<Select.Content
						class="focus-override border-muted shadow-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 h-38 max-h-[var(--bits-select-content-available-height)] w-[var(--bits-select-anchor-width)] min-w-[var(--bits-select-anchor-width)] rounded-xl border bg-gray-200 px-1 py-3 outline-hidden select-none data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1 dark:bg-gray-700"
						sideOffset={20}
					>
						<Select.ScrollUpButton class="flex w-full items-center justify-center">
							<CaretDoubleUp class="size-3" />
						</Select.ScrollUpButton>
						<Select.Viewport class="p-1">
							{#each themes as theme}
								<Select.Item
									class="rounded-button data-highlighted:bg-muted text-md flex h-10 w-full items-center py-3 pr-1.5 pl-5 capitalize outline-hidden select-none data-disabled:opacity-50"
									value={theme.value}
									label={theme.label}
								>
									{#snippet children({ selected })}
										{theme.label}
										{#if selected}
											<div class="ml-auto">
												<Check aria-label="check" />
											</div>
										{/if}
									{/snippet}
								</Select.Item>
							{/each}
						</Select.Viewport>
						<Select.ScrollDownButton class="flex w-full items-center justify-center">
							<CaretDoubleDown class="size-3" />
						</Select.ScrollDownButton>
					</Select.Content>
				</Select.Portal>
			</Select.Root>
		</div>
	</div>
</div>
