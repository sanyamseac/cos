<script lang="ts">
    import { enhance } from '$app/forms';
    import { Select } from 'bits-ui';
    import { Lock, Palette, Check, ShieldPlus, Shield, ChevronDown } from 'lucide-svelte';
    import { CaretDoubleUp, CaretDoubleDown } from 'phosphor-svelte';
	import { onMount } from 'svelte'

    let { data }: { data: any } = $props();
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

<div class="space-y-5">
    <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
            <Shield class="h-5 w-5" />
            <p class="text-gray-800 dark:text-white">Profile Visibility</p>
        </div>
        <Select.Root type="single" items={visibilityOptions} bind:value={profileVisibility} onValueChange={(e) => setTimeout(() => {visibilityFormRef?.requestSubmit(), 500})}>
            <Select.Trigger
                class="rounded-9px border-border-input data-placeholder:text-foreground-alt/50 text-md inline-flex h-6 w-30 items-center px-[2px] transition-colors select-none"
                aria-label="Select a visibility option"
            >
                {profileVisibility == 'private' ? 'Private' : 'Public'}
                <ChevronDown class="text-muted-foreground ml-auto size-5" />
            </Select.Trigger>
            <Select.Portal>
                <Select.Content
                    class="focus-override border-muted bg-gray-200 dark:bg-gray-700 shadow-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 h-28 max-h-[var(--bits-select-content-available-height)] w-[var(--bits-select-anchor-width)] min-w-[var(--bits-select-anchor-width)] rounded-xl border px-1 py-3 outline-hidden select-none data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1"
                    sideOffset={20}
                >
                    <Select.ScrollUpButton
                        class="flex w-full items-center justify-center"
                    >
                        <CaretDoubleUp class="size-3" />
                    </Select.ScrollUpButton>
                    <Select.Viewport class="p-1">
                        {#each visibilityOptions as option}
                            <Select.Item
                                class="rounded-button data-highlighted:bg-muted text-md flex h-10 w-full items-center py-1 px-2 capitalize outline-hidden select-none data-disabled:opacity-50"
                                value={option.value}
                                label={option.label}
                            >
                                {#snippet children({ selected })}
                                    {option.label}
                                    {#if selected}
                                        <div class="ml-auto">
                                            <Check aria-label="check" size={20}/>
                                        </div>
                                    {/if}
                                {/snippet}
                            </Select.Item>
                        {/each}
                    </Select.Viewport>
                    <Select.ScrollDownButton
                        class="flex w-full items-center justify-center"
                    >
                        <CaretDoubleDown class="size-3" />
                    </Select.ScrollDownButton>
                </Select.Content>
            </Select.Portal>
        </Select.Root>
    </div>
    <form bind:this={visibilityFormRef} method="post" action="?/updateProfileVisibility" use:enhance>
        <input type="hidden" name="visibility" value={profileVisibility}/>
    </form>
    <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
            <Palette class="h-5 w-5" />
            <p class="text-gray-800 dark:text-white">Theme Mode</p>
        </div>
        <Select.Root
            type="single"
            onValueChange={(value) => updateTheme(value as string)}
            items={themes}
            value={themeMode}
        >
            <Select.Trigger
                class="rounded-9px border-border-input data-placeholder:text-foreground-alt/50 text-md inline-flex h-6 w-30 items-center px-[2px] transition-colors select-none"
                aria-label="Select a theme"
            >
                {FullName}
                <ChevronDown class="text-muted-foreground ml-auto size-5" />
            </Select.Trigger>
            <Select.Portal>
                <Select.Content
                    class="focus-override border-muted bg-gray-200 dark:bg-gray-700 shadow-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 h-38 max-h-[var(--bits-select-content-available-height)] w-[var(--bits-select-anchor-width)] min-w-[var(--bits-select-anchor-width)] rounded-xl border px-1 py-3 outline-hidden select-none data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1"
                    sideOffset={20}
                >
                    <Select.ScrollUpButton
                        class="flex w-full items-center justify-center"
                    >
                        <CaretDoubleUp class="size-3" />
                    </Select.ScrollUpButton>
                    <Select.Viewport class="p-1">
                        {#each themes as theme}
                            <Select.Item
                                class="rounded-button data-highlighted:bg-muted text-md flex h-10 w-full items-center py-3 px-2 capitalize outline-hidden select-none data-disabled:opacity-50"
                                value={theme.value}
                                label={theme.label}
                            >
                                {#snippet children({ selected })}
                                    {theme.label}
                                    {#if selected}
                                        <div class="ml-auto">
                                            <Check aria-label="check" size={20}/>
                                        </div>
                                    {/if}
                                {/snippet}
                            </Select.Item>
                        {/each}
                    </Select.Viewport>
                    <Select.ScrollDownButton
                        class="flex w-full items-center justify-center"
                    >
                        <CaretDoubleDown class="size-3" />
                    </Select.ScrollDownButton>
                </Select.Content>
            </Select.Portal>
        </Select.Root>
    </div>
</div>