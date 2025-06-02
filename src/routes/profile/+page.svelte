<script lang="ts">
	import { enhance } from '$app/forms'
	import type { PageServerData } from './$types'
	import { Button, Switch, Select, Label } from "bits-ui"
	import { User, Mail, Shield, Bell, Eye, Lock, Palette, Globe, Camera, LogOut } from "lucide-svelte"
	import ProfilePictureDialog from './components/ProfilePictureDialog.svelte'
	import { onMount } from 'svelte';
	import Check from "phosphor-svelte/lib/Check";
	import CaretUpDown from "phosphor-svelte/lib/CaretUpDown";
	import CaretDoubleUp from "phosphor-svelte/lib/CaretDoubleUp";
	import CaretDoubleDown from "phosphor-svelte/lib/CaretDoubleDown";

	let { data }: { data: PageServerData } = $props()

	let emailNotifs = $state(false)
	let browserNotifs = $state(false)
	let profileVisibility = $state('private')
	let isEditingPic = $state(false)

	const visibilityOptions = [
		{ value: 'public', label: 'Public' },
		{ value: 'private', label: 'Private' }
	]

	async function handleProfilePictureSave(profilePicUrl: string) {
		try {
			const formData = new FormData()
			formData.append('profilePictureUrl', profilePicUrl)
			
			const response = await fetch('?/updateProfilePicture', {
				method: 'POST',
				body: formData
			})
			
			if (response.ok) {
				console.log('Profile picture updated successfully')
				// TODO: Update the local data to reflect the change
				// You might want to refresh the page data or update the reactive state
			} else {
				console.error('Failed to update profile picture')
			}
		} catch (error) {
			console.error('Error updating profile picture:', error)
		}
		
		isEditingPic = false
	}

	// Theme management
	let themeMode = $state<string>('system')
	const themes = [
		{ value: "light", label: "Light" },
		{ value: "dark", label: "Dark" },
		{ value: "system", label: "System" },
	];
	function updateTheme(mode: string) {
		themeMode = mode
		if (mode === 'system') {
			// Follow system preference
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
		return themes.find(theme => theme.value === mode)?.label || 'System';
	}
	const FullName = $derived(getThemeLabel(themeMode));
	onMount(() => {
		themeMode = localStorage.getItem('theme') as string || 'system';
		updateTheme(themeMode)
	})
	$effect(() => {
		localStorage.setItem('theme', themeMode)
	})

</script>

<ProfilePictureDialog
	bind:open={isEditingPic}
	currentProfilePic={data.user.profilePicture}
	userName={data.user.name}
	userEmail={data.user.email}
	onSave={handleProfilePictureSave}
/>

<div class="min-h-screen pb-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
	<!-- Decorative background elements -->
	<div class="absolute inset-0 opacity-20">
		<div class="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full blur-3xl"></div>
		<div class="absolute top-1/3 right-20 w-48 h-48 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full blur-3xl"></div>
		<div class="absolute bottom-20 left-1/4 w-40 h-40 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full blur-3xl"></div>
	</div>
	
	<div class="relative z-10 p-6 space-y-8">
		<!-- Header -->
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-4xl font-bold mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Profile</h1>
				<p class="text-lg text-gray-700 dark:text-gray-300">Manage your account and preferences</p>
			</div>
			<div>
			<form method="post" action="login?/logout" use:enhance>
				<Button.Root class="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-3 py-3 rounded-xl font-semibold">
					<div class="flex items-center justify-center px-2">
						Logout
						<LogOut class="ml-3 w-4 h-4" />
					</div>
				</Button.Root>
			</form>
			</div>
		</div>

		<!-- Profile Information Card -->
		<div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-5">
					<div class="relative">
						<div class="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
							{#if data.user.profilePicture}
								<img src={data.user.profilePicture} alt="Profile" class="w-full h-full object-cover" />
							{:else}
								<User class="w-10 h-10 text-white" />
							{/if}
						</div>
						<button class="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors" onclick={() => isEditingPic = true}>
							<Camera class="w-3 h-3 text-white" />
						</button>
					</div>
					<div class="flex flex-col mt-2">
						<h2 class="text-2xl font-bold text-gray-800 dark:text-white">{data.user.name}</h2>
						<div class="mt-1">
							<p class="text-gray-600 dark:text-gray-400 flex items-center gap-2 text-xs">
								<Mail class="w-3 h-3" />
								{data.user.email}
							</p>
							<p class="text-gray-600 dark:text-gray-400 flex items-center gap-2 text-xs">
								<Shield class="w-3 h-3" />
								{data.user.role}
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Settings Sections -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<!-- Notification Settings -->
			<div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
				<div class="flex items-center gap-3 mb-6">
					<div class="p-2 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg">
						<Bell class="w-5 h-5 text-white" />
					</div>
					<h3 class="text-lg font-semibold text-gray-800 dark:text-white">Notifications</h3>
				</div>
				<div class="space-y-4">
					<div class="flex items-center justify-between">
						<div>
							<p class="font-medium text-gray-800 dark:text-white">Email Notifications</p>
							<p class="text-sm text-gray-600 dark:text-gray-400">Receive order updates via email</p>
						</div>
						<Switch.Root bind:checked={emailNotifs} class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200 dark:data-[state=unchecked]:bg-gray-700">
							<Switch.Thumb class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-1" />
						</Switch.Root>
					</div>
					<div class="flex items-center justify-between">
						<div>
							<p class="font-medium text-gray-800 dark:text-white">Browser Notifications</p>
							<p class="text-sm text-gray-600 dark:text-gray-400">Receive order updates via browser</p>
						</div>
						<Switch.Root bind:checked={browserNotifs} class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200 dark:data-[state=unchecked]:bg-gray-700">
							<Switch.Thumb class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-1" />
						</Switch.Root>
					</div>
				</div>
			</div>

			<!-- Privacy & Security -->
			<div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
				<div class="flex items-center gap-3 mb-6">
					<div class="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
						<Lock class="w-5 h-5 text-white" />
					</div>
					<h3 class="text-lg font-semibold text-gray-800 dark:text-white">Your Preferences</h3>
				</div>
				<div class="space-y-4">
					<div class="space-y-2">
						<p class="font-medium text-gray-800 dark:text-white">Profile Visibility</p>
						<Select.Root type="single" bind:value={profileVisibility}>
							<Select.Trigger
								class="h-10 rounded-9px border-border-input bg-background data-placeholder:text-foreground-alt/50 inline-flex w-full select-none items-center border px-[8px] text-md transition-colors"
								aria-label="Select a visibility option"
							>
								<Palette class="text-muted-foreground mr-[9px] size-5" />
								{profileVisibility == 'private' ? 'Private' : 'Public'}
								<CaretUpDown class="text-muted-foreground ml-auto size-5" />
							</Select.Trigger>
							<Select.Portal>
								<Select.Content
								class="focus-override border-muted bg-background shadow-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 outline-hidden z-50 h-28 max-h-[var(--bits-select-content-available-height)] w-[var(--bits-select-anchor-width)] min-w-[var(--bits-select-anchor-width)] select-none rounded-xl border px-1 py-3 data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1"
								sideOffset={20}
								>
								<Select.ScrollUpButton class="flex w-full items-center justify-center">
									<CaretDoubleUp class="size-3" />
								</Select.ScrollUpButton>
								<Select.Viewport class="p-1">
									<Select.Item
										class="rounded-button data-highlighted:bg-muted outline-hidden data-disabled:opacity-50 flex h-10 w-full select-none items-center py-3 pl-5 pr-1.5 text-md capitalize"
										value="private"
										label="Private"
									>
										{#snippet children({ selected })}
										Private
										{#if selected}
											<div class="ml-auto">
											<Check aria-label="check" />
											</div>
										{/if}
										{/snippet}
									</Select.Item>
									<Select.Item
										class="rounded-button data-highlighted:bg-muted outline-hidden data-disabled:opacity-50 flex h-10 w-full select-none items-center py-3 pl-5 pr-1.5 text-md capitalize"
										value="public"
										label="Public"
									>
										{#snippet children({ selected })}
										Public
										{#if selected}
											<div class="ml-auto">
											<Check aria-label="check" />
											</div>
										{/if}
										{/snippet}
									</Select.Item>
								</Select.Viewport>
								<Select.ScrollDownButton class="flex w-full items-center justify-center">
									<CaretDoubleDown class="size-3" />
								</Select.ScrollDownButton>
								</Select.Content>
							</Select.Portal>
						</Select.Root>
						<p class="font-medium text-gray-800 dark:text-white">Theme</p>
						<Select.Root type="single" onValueChange={(value) => updateTheme(value as string)} items={themes} value={themeMode}>
							<Select.Trigger
								class="h-10 rounded-9px border-border-input bg-background data-placeholder:text-foreground-alt/50 inline-flex w-full select-none items-center border px-[8px] text-md transition-colors"
								aria-label="Select a theme"
							>
								<Palette class="text-muted-foreground mr-[9px] size-5" />
								{FullName}
								<CaretUpDown class="text-muted-foreground ml-auto size-5" />
							</Select.Trigger>
							<Select.Portal>
								<Select.Content
								class="focus-override border-muted bg-background shadow-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 outline-hidden z-50 h-38 max-h-[var(--bits-select-content-available-height)] w-[var(--bits-select-anchor-width)] min-w-[var(--bits-select-anchor-width)] select-none rounded-xl border px-1 py-3 data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1"
								sideOffset={20}
								>
								<Select.ScrollUpButton class="flex w-full items-center justify-center">
									<CaretDoubleUp class="size-3" />
								</Select.ScrollUpButton>
								<Select.Viewport class="p-1">
									{#each themes as theme}
									<Select.Item
										class="rounded-button data-highlighted:bg-muted outline-hidden data-disabled:opacity-50 flex h-10 w-full select-none items-center py-3 pl-5 pr-1.5 text-md capitalize"
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

			<!-- Account Actions -->
			<div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
				<div class="flex items-center gap-3 mb-6">
					<div class="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
						<Lock class="w-5 h-5 text-white" />
					</div>
					<h3 class="text-lg font-semibold text-gray-800 dark:text-white">Legal</h3>
				</div>
				<div class="space-y-3">
					<a href="/terms" class="block text-gray-700 dark:text-gray-300 hover:underline transition-all duration-200 font-medium">
						Terms and Conditions
					</a>
					<a href="/privacy" class="block text-gray-700 dark:text-gray-300 hover:underline transition-all duration-200 font-medium">
						Privacy Policy
					</a>
				</div>
			</div>
		</div>
	</div>
</div>
