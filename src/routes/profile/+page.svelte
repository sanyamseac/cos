<script lang="ts">
	import { enhance } from '$app/forms'
	import type { PageServerData } from './$types'
	import { Button, Switch, Select, Label } from 'bits-ui'
	import {
		User,
		Mail,
		Shield,
		Bell,
		Eye,
		Lock,
		Palette,
		Globe,
		Camera,
		LogOut,
	} from 'lucide-svelte'
	import ProfilePictureDialog from './components/ProfilePictureDialog.svelte'
	import { onMount } from 'svelte'
	import { notificationService, requestNotificationPermission } from '$lib/notifications'
	import { serviceWorkerManager } from '$lib/serviceWorkerManager'
	import Check from 'phosphor-svelte/lib/Check'
	import CaretUpDown from 'phosphor-svelte/lib/CaretUpDown'
	import CaretDoubleUp from 'phosphor-svelte/lib/CaretDoubleUp'
	import CaretDoubleDown from 'phosphor-svelte/lib/CaretDoubleDown'
	let { data }: { data: PageServerData } = $props()

	let emailNotifs = $state(false)
	// let browserNotifs = $state(false) // Removed
	let profileVisibility = $state('private')
	let isEditingPic = $state(false)
	// Notification permission state
	let notificationPermission = $state<NotificationPermission>('default')
	// let isRequestingPermission = $state(false) // Removed, or will be handled by isManagingPush
	let pushNotifications = $state(false)
	let isManagingPush = $state(false) // This will now also cover the initial permission request phase
	const visibilityOptions = [
		{ value: 'public', label: 'Public' },
		{ value: 'private', label: 'Private' },
	]

	// Removed handleBrowserNotificationToggle function

	// Handle push notification toggle (Service Worker based)
	async function handlePushNotificationToggle(enabled: boolean) {
		isManagingPush = true
		try {
			if (enabled) {
				// First ensure basic notification permission
				if (notificationPermission !== 'granted') {
					console.log('Requesting notification permission for push...')
					const permission = await requestNotificationPermission()
					notificationPermission = permission // Update status immediately
					if (permission !== 'granted') {
						pushNotifications = false
						localStorage.setItem('pushNotifications', 'false')
						console.log('Notification permission denied, cannot enable push.')
						return
					}
					console.log('Notification permission granted.')
				}

				// Enable push notifications with Service Worker
				console.log('Enabling push notifications...')
				const success = await notificationService.enablePushNotifications(data.user.id)
				if (success) {
					pushNotifications = true
					console.log('Push notifications enabled successfully')
					// Optionally show a test push notification
					setTimeout(() => {
						notificationService.sendNotification({
							title: '📱 Push Notifications Enabled!',
							body: "You'll now receive background updates.",
							tag: 'push-notification-enabled',
						})
					}, 500)
				} else {
					pushNotifications = false
					console.error('Failed to enable push notifications after permission grant.')
				}
			} else {
				// Disable push notifications
				console.log('Disabling push notifications...')
				await notificationService.disablePushNotifications(data.user.id)
				pushNotifications = false
				console.log('Push notifications disabled')
			}
		} catch (error) {
			console.error('Error managing push notifications:', error)
			pushNotifications = false // Ensure state is false on error
		} finally {
			isManagingPush = false
		}

		localStorage.setItem('pushNotifications', pushNotifications.toString())
	}

	// Check current push subscription status
	async function checkPushSubscriptionStatus() {
		try {
			const subscription = await serviceWorkerManager.getPushSubscription()
			if (subscription) {
				pushNotifications = true
			} else {
				pushNotifications = false // Ensure it's false if no subscription
			}
		} catch (error) {
			console.error('Error checking push subscription:', error)
			pushNotifications = false
		}
	}

	async function handleProfilePictureSave(profilePicUrl: string) {
		try {
			const formData = new FormData()
			formData.append('profilePictureUrl', profilePicUrl)

			const response = await fetch('?/updateProfilePicture', {
				method: 'POST',
				body: formData,
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
		{ value: 'light', label: 'Light' },
		{ value: 'dark', label: 'Dark' },
		{ value: 'system', label: 'System' },
	]
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
		return themes.find((theme) => theme.value === mode)?.label || 'System'
	}
	const FullName = $derived(getThemeLabel(themeMode))
	onMount(() => {
		themeMode = (localStorage.getItem('theme') as string) || 'system'
		updateTheme(themeMode)
		// Load notification preferences
		// const savedBrowserNotifs = localStorage.getItem('browserNotifications') // Removed
		// if (savedBrowserNotifs !== null) { // Removed
		// 	browserNotifs = savedBrowserNotifs === 'true' // Removed
		// } // Removed

		const savedPushNotifs = localStorage.getItem('pushNotifications')
		if (savedPushNotifs !== null) {
			pushNotifications = savedPushNotifs === 'true'
		}

		// Check current notification permission status
		if (notificationService.isSupported) {
			notificationPermission = notificationService.permissionStatus
		}

		// Check push notification status if initially enabled and permission is granted
		if (
			serviceWorkerManager.isSupported &&
			pushNotifications &&
			notificationPermission === 'granted'
		) {
			checkPushSubscriptionStatus()
		} else if (notificationPermission !== 'granted') {
			// If permission is not granted, push notifications should be considered off
			pushNotifications = false
			localStorage.setItem('pushNotifications', 'false')
		}
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
		<!-- Header -->
		<div class="flex items-center justify-between">
			<div>
				<h1
					class="mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent"
				>
					Profile
				</h1>
				<p class="text-lg text-gray-700 dark:text-gray-300">
					Manage your account and preferences
				</p>
			</div>
			<div>
				<form method="post" action="login?/logout" use:enhance>
					<Button.Root
						class="rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-3 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:from-red-600 hover:to-red-700 hover:shadow-xl"
					>
						<div class="flex items-center justify-center px-2">
							Logout
							<LogOut class="ml-3 h-4 w-4" />
						</div>
					</Button.Root>
				</form>
			</div>
		</div>

		<!-- Profile Information Card -->
		<div
			class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
		>
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-5">
					<div class="relative">
						<div
							class="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-500 to-purple-600"
						>
							{#if data.user.profilePicture}
								<img
									src={data.user.profilePicture}
									alt="Profile"
									class="h-full w-full object-cover"
								/>
							{:else}
								<User class="h-10 w-10 text-white" />
							{/if}
						</div>
						<button
							class="absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 transition-colors hover:bg-blue-600"
							onclick={() => (isEditingPic = true)}
						>
							<Camera class="h-3 w-3 text-white" />
						</button>
					</div>
					<div class="mt-2 flex flex-col">
						<h2 class="text-2xl font-bold text-gray-800 dark:text-white">
							{data.user.name}
						</h2>
						<div class="mt-1">
							<p
								class="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400"
							>
								<Mail class="h-3 w-3" />
								{data.user.email}
							</p>
							<p
								class="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400"
							>
								<Shield class="h-3 w-3" />
								{data.user.role}
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Notification Settings -->
		<div
			class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
		>
			<div class="mb-6 flex items-center gap-3">
				<div class="rounded-lg bg-gradient-to-br from-yellow-500 to-orange-600 p-2">
					<Bell class="h-5 w-5 text-white" />
				</div>
				<h3 class="text-lg font-semibold text-gray-800 dark:text-white">
					Notifications
				</h3>
			</div>
			<div class="space-y-4">
				<div class="flex items-center justify-between">
					<div>
						<p class="font-medium text-gray-800 dark:text-white">
							Email Notifications
						</p>
						<p class="text-sm text-gray-600 dark:text-gray-400">
							Receive order updates via email
						</p>
					</div>
					<Switch.Root
						bind:checked={emailNotifs}
						class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200 dark:data-[state=unchecked]:bg-gray-700"
					>
						<Switch.Thumb
							class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-1"
						/>
					</Switch.Root>
				</div>
				<!-- Browser Notifications Section Removed -->

				{#if serviceWorkerManager.isSupported}
					<div class="flex items-center justify-between">
						<div class="flex-1">
							<p class="font-medium text-gray-800 dark:text-white">
								Push Notifications
							</p>
							<p class="text-sm text-gray-600 dark:text-gray-400">
								Background notifications for important updates.
							</p>
							{#if notificationPermission === 'denied'}
								<p class="mt-1 text-xs text-red-600 dark:text-red-400">
									⚠️ Notification permission denied. Please enable in browser
									settings to use Push Notifications.
								</p>
							{:else if isManagingPush}
								<p class="mt-1 text-xs text-blue-600 dark:text-blue-400">
									{#if notificationPermission === 'default'}Requesting
										permission...{:else}Managing push notifications...{/if}
								</p>
							{:else if pushNotifications && notificationPermission === 'granted'}
								<p class="mt-1 text-xs text-green-600 dark:text-green-400">
									✅ Push notifications active
								</p>
							{:else if notificationPermission === 'granted' && !pushNotifications}
								<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
									Enable for background updates.
								</p>
							{:else if notificationPermission === 'default'}
								<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
									Click to enable push notifications.
								</p>
							{/if}
						</div>
						<Switch.Root
							checked={pushNotifications}
							onCheckedChange={handlePushNotificationToggle}
							disabled={isManagingPush || notificationPermission === 'denied'}
							class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:opacity-50 data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200 dark:data-[state=unchecked]:bg-gray-700"
						>
							<Switch.Thumb
								class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-1"
							/>
						</Switch.Root>
					</div>
				{/if}
			</div>
		</div>

		<!-- Privacy & Security -->
		<div
			class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
		>
			<div class="mb-6 flex items-center gap-3">
				<div class="rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 p-2">
					<Lock class="h-5 w-5 text-white" />
				</div>
				<h3 class="text-lg font-semibold text-gray-800 dark:text-white">
					Your Preferences
				</h3>
			</div>
			<div class="space-y-4">
				<div class="space-y-2">
					<p class="font-medium text-gray-800 dark:text-white">Profile Visibility</p>
					<Select.Root type="single" bind:value={profileVisibility}>
						<Select.Trigger
							class="rounded-9px border-border-input bg-background data-placeholder:text-foreground-alt/50 text-md inline-flex h-10 w-full items-center border px-[8px] transition-colors select-none"
							aria-label="Select a visibility option"
						>
							<Palette class="text-muted-foreground mr-[9px] size-5" />
							{profileVisibility == 'private' ? 'Private' : 'Public'}
							<CaretUpDown class="text-muted-foreground ml-auto size-5" />
						</Select.Trigger>
						<Select.Portal>
							<Select.Content
								class="focus-override border-muted bg-background shadow-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 h-28 max-h-[var(--bits-select-content-available-height)] w-[var(--bits-select-anchor-width)] min-w-[var(--bits-select-anchor-width)] rounded-xl border px-1 py-3 outline-hidden select-none data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1"
								sideOffset={20}
							>
								<Select.ScrollUpButton
									class="flex w-full items-center justify-center"
								>
									<CaretDoubleUp class="size-3" />
								</Select.ScrollUpButton>
								<Select.Viewport class="p-1">
									<Select.Item
										class="rounded-button data-highlighted:bg-muted text-md flex h-10 w-full items-center py-3 pr-1.5 pl-5 capitalize outline-hidden select-none data-disabled:opacity-50"
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
										class="rounded-button data-highlighted:bg-muted text-md flex h-10 w-full items-center py-3 pr-1.5 pl-5 capitalize outline-hidden select-none data-disabled:opacity-50"
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
								<Select.ScrollDownButton
									class="flex w-full items-center justify-center"
								>
									<CaretDoubleDown class="size-3" />
								</Select.ScrollDownButton>
							</Select.Content>
						</Select.Portal>
					</Select.Root>
					<p class="font-medium text-gray-800 dark:text-white">Theme</p>
					<Select.Root
						type="single"
						onValueChange={(value) => updateTheme(value as string)}
						items={themes}
						value={themeMode}
					>
						<Select.Trigger
							class="rounded-9px border-border-input bg-background data-placeholder:text-foreground-alt/50 text-md inline-flex h-10 w-full items-center border px-[8px] transition-colors select-none"
							aria-label="Select a theme"
						>
							<Palette class="text-muted-foreground mr-[9px] size-5" />
							{FullName}
							<CaretUpDown class="text-muted-foreground ml-auto size-5" />
						</Select.Trigger>
						<Select.Portal>
							<Select.Content
								class="focus-override border-muted bg-background shadow-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 h-38 max-h-[var(--bits-select-content-available-height)] w-[var(--bits-select-anchor-width)] min-w-[var(--bits-select-anchor-width)] rounded-xl border px-1 py-3 outline-hidden select-none data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1"
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
		</div>

		<!-- Account Actions -->
		<div
			class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
		>
			<div class="mb-6 flex items-center gap-3">
				<div class="rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 p-2">
					<Lock class="h-5 w-5 text-white" />
				</div>
				<h3 class="text-lg font-semibold text-gray-800 dark:text-white">Legal</h3>
			</div>
			<div class="space-y-3">
				<a
					href="/terms"
					class="block font-medium text-gray-700 transition-all duration-200 hover:underline dark:text-gray-300"
				>
					Terms and Conditions
				</a>
				<a
					href="/privacy"
					class="block font-medium text-gray-700 transition-all duration-200 hover:underline dark:text-gray-300"
				>
					Privacy Policy
				</a>
			</div>
		</div>

		<!-- Wallet Information Section -->
		{#if data.wallets && data.wallets.length > 0}
			<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
				<!-- Wallet Balances -->
				<div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
					<div class="mb-6 flex items-center gap-3">
						<div class="rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 p-2">
							<div class="h-5 w-5 text-white font-bold">₹</div>
						</div>
						<h3 class="text-lg font-semibold text-gray-800 dark:text-white">
							Wallet Balances
						</h3>
					</div>
					<div class="space-y-3">
						{#each data.wallets as { wallet, canteen }}
							<div class="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
								<div>
									<p class="font-medium text-gray-800 dark:text-white">
										{canteen?.name || 'Unknown Canteen'}
									</p>
									<p class="text-sm text-gray-600 dark:text-gray-400">
										{canteen?.acronym || ''}
									</p>
								</div>
								<div class="text-right">
									<p class="font-bold text-green-600 dark:text-green-400">
										₹{parseFloat(wallet.balance).toFixed(2)}
									</p>
									<p class="text-xs text-gray-500">
										Updated: {new Date(wallet.updatedAt).toLocaleDateString()}
									</p>
								</div>
							</div>
						{/each}
						<div class="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900">
							<div class="flex items-center justify-between">
								<span class="font-medium text-blue-800 dark:text-blue-200">Total Balance</span>
								<span class="font-bold text-xl text-blue-800 dark:text-blue-200">
									₹{data.wallets.reduce((sum, w) => sum + parseFloat(w.wallet.balance), 0).toFixed(2)}
								</span>
							</div>
						</div>
					</div>
				</div>

				<!-- Recent Transactions -->
				<div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
					<div class="mb-6 flex items-center gap-3">
						<div class="rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 p-2">
							<svg class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
							</svg>
						</div>
						<h3 class="text-lg font-semibold text-gray-800 dark:text-white">
							Recent Transactions
						</h3>
					</div>
					{#if data.recentTransactions && data.recentTransactions.length > 0}
						<div class="space-y-3 max-h-80 overflow-y-auto">
							{#each data.recentTransactions as { transaction, canteen, performedBy }}
								<div class="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-600">
									<div class="flex-1">
										<p class="font-medium text-gray-800 dark:text-white">
											{canteen?.name || 'Unknown Canteen'}
										</p>
										<p class="text-sm text-gray-600 dark:text-gray-400">
											{transaction.reference || 'No reference'}
										</p>
										<p class="text-xs text-gray-500">
											{new Date(transaction.createdAt).toLocaleDateString('en-IN', {
												year: 'numeric',
												month: 'short',
												day: 'numeric',
												hour: '2-digit',
												minute: '2-digit'
											})}
										</p>
									</div>
									<div class="text-right">
										<p class="font-bold {parseFloat(transaction.amount) > 0 ? 'text-green-600' : 'text-red-600'}">
											{parseFloat(transaction.amount) > 0 ? '+' : ''}₹{Math.abs(parseFloat(transaction.amount)).toFixed(2)}
										</p>
										<p class="text-xs text-gray-500">
											by {performedBy?.name || 'System'}
										</p>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<div class="text-center py-8 text-gray-500">
							<p>No transactions found</p>
						</div>
					{/if}
				</div>
			</div>
		{:else}
			<div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
				<div class="text-center py-8">
					<div class="rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 p-3 mx-auto w-fit mb-4">
						<div class="h-6 w-6 text-white font-bold">₹</div>
					</div>
					<h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-2">
						No Wallet Found
					</h3>
					<p class="text-gray-600 dark:text-gray-400">
						Your wallet will be created when you make your first transaction.
					</p>
				</div>
			</div>
		{/if}
	</div>
</div>
