<!-- Notification Demo Page -->
<script lang="ts">
	import { enhance } from '$app/forms'
	import { Button } from 'bits-ui'
	import { Bell, Send, Users, Zap, AlertCircle, CheckCircle, Clock, X } from 'lucide-svelte'
	import { serviceWorkerManager } from '$lib/serviceWorkerManager'
	import type { PageServerData } from './$types'

	let { data }: { data: PageServerData } = $props()

	// Form state
	let isLoading = $state(false)
	let targetUserId = $state('')
	let notificationTitle = $state('')
	let notificationBody = $state('')
	let broadcast = $state(false)
	let lastResponse = $state<any>(null)
	// Connection status
	let connectionStatus = $state({
		isConnected: false,
		isRegistered: false,
		pushSubscription: null,
	})

	// Debug info
	let debugInfo = $state({
		swRegistration: null,
		swActive: false,
		swInstalling: false,
		swWaiting: false,
		swController: false,
		vapidKey: '',
	})

	// Update connection status every 5 seconds
	let statusInterval: NodeJS.Timeout
	$effect(() => {
		// Initial check
		updateConnectionStatus()

		statusInterval = setInterval(() => {
			updateConnectionStatus()
		}, 5000)

		return () => {
			if (statusInterval) {
				clearInterval(statusInterval)
			}
		}
	})

	async function updateConnectionStatus() {
		const swState = serviceWorkerManager.getState()
		const pushSub = await serviceWorkerManager.getPushSubscription()

		connectionStatus = {
			isConnected: swState.isRegistered && !!pushSub,
			isRegistered: swState.isRegistered,
			pushSubscription: pushSub,
		}

		// Update debug info
		debugInfo = {
			swRegistration: !!swState.registration,
			swActive: !!swState.registration?.active,
			swInstalling: !!swState.registration?.installing,
			swWaiting: !!swState.registration?.waiting,
			swController: !!navigator.serviceWorker?.controller,
			vapidKey: '', // We'll fetch this separately
		}

		// Fetch VAPID key for debugging
		try {
			const response = await fetch('/api/push/vapid-key')
			if (response.ok) {
				const data = await response.json()
				debugInfo.vapidKey = data.publicKey ? 'Present' : 'Missing'
			}
		} catch (error) {
			debugInfo.vapidKey = 'Error'
		}
	}

	// Quick notification presets
	const notificationPresets = [
		{
			title: '🔔 Order Ready!',
			body: 'Your delicious meal is ready for pickup at the canteen.',
			type: 'order_ready',
		},
		{
			title: '🍳 Order Preparing',
			body: 'Your order is being freshly prepared. ETA: 15 minutes.',
			type: 'order_preparing',
		},
		{
			title: '✅ Order Completed',
			body: 'Thank you! Your order has been completed successfully.',
			type: 'order_completed',
		},
		{
			title: '⚠️ Order Delayed',
			body: 'Sorry, your order is slightly delayed. New ETA: 10 minutes.',
			type: 'order_delayed',
		},
		{
			title: '🎉 Special Offer',
			body: 'Get 20% off your next order! Limited time offer.',
			type: 'promotion',
		},
	]

	async function sendNotification() {
		if (!notificationTitle.trim() || !notificationBody.trim()) {
			alert('Please fill in both title and body')
			return
		}

		if (!broadcast && !targetUserId.trim()) {
			alert('Please specify a target user ID or enable broadcast')
			return
		}

		isLoading = true
		lastResponse = null

		try {
			const response = await fetch('/api/send-notification', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					userId: broadcast ? undefined : targetUserId.trim(),
					title: notificationTitle.trim(),
					body: notificationBody.trim(),
					broadcast,
					type: 'custom',
				}),
			})

			lastResponse = await response.json()

			if (lastResponse.success) {
				// Clear form on success
				if (!broadcast) targetUserId = ''
				notificationTitle = ''
				notificationBody = ''
			}
		} catch (error) {
			lastResponse = {
				success: false,
				message: 'Network error: ' + error.message,
			}
		} finally {
			isLoading = false
		}
	}

	function usePreset(preset: any) {
		notificationTitle = preset.title
		notificationBody = preset.body
	}
	function sendTestToSelf() {
		targetUserId = data.user.id
		notificationTitle = '🧪 Test Notification'
		notificationBody = 'This is a test notification sent to yourself!'
		broadcast = false
	}

	async function enablePushNotifications() {
		try {
			// Request notification permission first
			const permission = await serviceWorkerManager.requestNotificationPermission()
			if (permission !== 'granted') {
				alert(
					'Notification permission denied. Please enable notifications in your browser settings.',
				)
				return
			}

			// Subscribe to push notifications
			const subscription = await serviceWorkerManager.subscribeToPush(data.user.id)
			if (subscription) {
				console.log('Push notifications enabled successfully')
				await updateConnectionStatus()
			} else {
				alert('Failed to enable push notifications. Please try again.')
			}
		} catch (error) {
			console.error('Error enabling push notifications:', error)
			alert('Error enabling push notifications: ' + error.message)
		}
	}

	async function handleSendCustomNotification() {
		const title = notificationTitle.trim()
		const body = notificationBody.trim()
		const userIdToSend = targetUserId.trim()

		if (!broadcast && !userIdToSend) {
			alert('Target User ID is required for non-broadcast notifications.')
			return
		}

		const payload = {
			userId: broadcast ? undefined : userIdToSend,
			title: title,
			body: body,
			broadcast: broadcast,
			type: 'custom', // The demo page sends 'custom' type notifications
		}

		try {
			const response = await fetch('/api/send-notification', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(payload),
			})

			const result = await response.json()

			if (response.ok) {
				alert(
					`Notification sent! Server response: ${result.message || JSON.stringify(result)}`,
				)
			} else {
				console.error('Error sending notification:', result)
				alert(`Error sending notification: ${result.error || response.statusText}`)
			}
		} catch (error: any) {
			console.error('Failed to send notification:', error)
			alert(`Failed to send notification: ${error.message}`)
		}
	}
</script>

<svelte:head>
	<title>Notification Demo - Canteen Ordering System</title>
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
		<!-- Header -->
		<div class="mb-8 text-center">
			<h1
				class="mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent"
			>
				Notification Demo
			</h1>
			<p class="text-lg text-gray-700 dark:text-gray-300">
				Test Service Worker push notifications that work even when browser is closed
			</p>
		</div>

		<!-- Connection Status -->
		<div
			class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
		>
			<div class="mb-4 flex items-center gap-3">
				<div class="rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 p-2">
					<Zap class="h-5 w-5 text-white" />
				</div>
				<h3 class="text-lg font-semibold text-gray-800 dark:text-white">
					Push Notification Status
				</h3>
			</div>
			<div class="space-y-3">
				<div class="flex items-center gap-3">
					{#if connectionStatus.isConnected}
						<CheckCircle class="h-5 w-5 text-green-600" />
						<span class="font-medium text-green-600 dark:text-green-400"
							>Push notifications enabled</span
						>
					{:else if connectionStatus.isRegistered}
						<AlertCircle class="h-5 w-5 text-yellow-600" />
						<span class="font-medium text-yellow-600 dark:text-yellow-400"
							>Service Worker registered (no push subscription)</span
						>
					{:else}
						<AlertCircle class="h-5 w-5 text-red-600" />
						<span class="font-medium text-red-600 dark:text-red-400"
							>Service Worker not registered</span
						>
					{/if}
				</div>

				{#if !connectionStatus.isConnected}
					<Button.Root
						onclick={enablePushNotifications}
						class="w-full rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2 font-semibold text-white transition-all duration-300 hover:from-blue-600 hover:to-indigo-700"
					>
						<Bell class="mr-2 h-4 w-4" />
						Enable Push Notifications
					</Button.Root>
				{/if}
				<div class="text-sm text-gray-600 dark:text-gray-400">
					<p>
						User ID: <code class="rounded bg-gray-100 px-2 py-1 dark:bg-gray-700"
							>{data.user.id}</code
						>
					</p>
					<p>
						SW Registered: <code class="rounded bg-gray-100 px-2 py-1 dark:bg-gray-700"
							>{connectionStatus.isRegistered ? 'Yes' : 'No'}</code
						>
					</p>
					<p>
						Push Subscription: <code
							class="rounded bg-gray-100 px-2 py-1 dark:bg-gray-700"
							>{connectionStatus.pushSubscription ? 'Active' : 'None'}</code
						>
					</p>
				</div>

				<!-- Debug Information -->
				<details class="mt-4">
					<summary
						class="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
					>
						Debug Information
					</summary>
					<div class="mt-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
						<div class="grid grid-cols-2 gap-2 text-xs">
							<div>
								SW Registration: <span class="font-mono"
									>{debugInfo.swRegistration ? 'Yes' : 'No'}</span
								>
							</div>
							<div>
								SW Active: <span class="font-mono"
									>{debugInfo.swActive ? 'Yes' : 'No'}</span
								>
							</div>
							<div>
								SW Installing: <span class="font-mono"
									>{debugInfo.swInstalling ? 'Yes' : 'No'}</span
								>
							</div>
							<div>
								SW Waiting: <span class="font-mono"
									>{debugInfo.swWaiting ? 'Yes' : 'No'}</span
								>
							</div>
							<div>
								SW Controller: <span class="font-mono"
									>{debugInfo.swController ? 'Yes' : 'No'}</span
								>
							</div>
							<div>
								VAPID Key: <span class="font-mono">{debugInfo.vapidKey}</span>
							</div>
						</div>
					</div>
				</details>
			</div>
		</div>

		<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
			<!-- Send Notification Form -->
			<div
				class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
			>
				<div class="mb-6 flex items-center gap-3">
					<div class="rounded-lg bg-gradient-to-br from-yellow-500 to-orange-600 p-2">
						<Bell class="h-5 w-5 text-white" />
					</div>
					<h3 class="text-lg font-semibold text-gray-800 dark:text-white">
						Send Notification
					</h3>
				</div>

				<form
					onsubmit={(e) => {
						e.preventDefault()
						sendNotification()
					}}
					class="space-y-4"
				>
					<!-- Broadcast Toggle -->
					<div class="flex items-center gap-3">
						<input
							type="checkbox"
							id="broadcast"
							bind:checked={broadcast}
							class="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
						/>
						<label
							for="broadcast"
							class="text-sm font-medium text-gray-700 dark:text-gray-300"
						>
							Broadcast to all users
						</label>
					</div>

					<!-- Target User ID -->
					{#if !broadcast}
						<div>
							<label
								for="userId"
								class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
							>
								Target User ID
							</label>
							<div class="flex gap-2">
								<input
									type="text"
									id="userId"
									bind:value={targetUserId}
									placeholder="Enter user ID"
									class="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
								/>
								<Button.Root
									type="button"
									onclick={sendTestToSelf}
									class="rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
								>
									Self
								</Button.Root>
							</div>
						</div>
					{/if}

					<!-- Title -->
					<div>
						<label
							for="title"
							class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
						>
							Notification Title
						</label>
						<input
							type="text"
							id="title"
							bind:value={notificationTitle}
							placeholder="Enter notification title"
							class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						/>
					</div>

					<!-- Body -->
					<div>
						<label
							for="body"
							class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
						>
							Notification Body
						</label>
						<textarea
							id="body"
							bind:value={notificationBody}
							placeholder="Enter notification message"
							rows="3"
							class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						></textarea>
					</div>

					<!-- Send Button -->
					<Button.Root
						type="submit"
						disabled={isLoading}
						class="w-full rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 font-semibold text-white transition-all duration-300 hover:from-indigo-600 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{#if isLoading}
							<Clock class="mr-2 h-4 w-4 animate-spin" />
							Sending...
						{:else}
							<Send class="mr-2 h-4 w-4" />
							Send Notification
						{/if}
					</Button.Root>
				</form>
			</div>

			<!-- Quick Presets -->
			<div
				class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
			>
				<div class="mb-6 flex items-center gap-3">
					<div class="rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 p-2">
						<Zap class="h-5 w-5 text-white" />
					</div>
					<h3 class="text-lg font-semibold text-gray-800 dark:text-white">
						Quick Presets
					</h3>
				</div>

				<div class="space-y-3">
					{#each notificationPresets as preset}
						<button
							type="button"
							onclick={() => usePreset(preset)}
							class="w-full rounded-lg bg-gray-50 p-3 text-left transition-colors hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600"
						>
							<div class="text-sm font-medium text-gray-900 dark:text-white">
								{preset.title}
							</div>
							<div class="mt-1 text-xs text-gray-600 dark:text-gray-400">
								{preset.body}
							</div>
						</button>
					{/each}
				</div>
			</div>
		</div>

		<!-- Response Display -->
		{#if lastResponse}
			<div
				class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
			>
				<div class="mb-4 flex items-center justify-between">
					<div class="flex items-center gap-3">
						{#if lastResponse.success}
							<CheckCircle class="h-5 w-5 text-green-600" />
							<h3 class="text-lg font-semibold text-green-600 dark:text-green-400">
								Success
							</h3>
						{:else}
							<X class="h-5 w-5 text-red-600" />
							<h3 class="text-lg font-semibold text-red-600 dark:text-red-400">
								Error
							</h3>
						{/if}
					</div>
					<button
						onclick={() => (lastResponse = null)}
						class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
					>
						<X class="h-4 w-4" />
					</button>
				</div>

				<div class="space-y-2">
					<p class="text-gray-700 dark:text-gray-300">{lastResponse.message}</p>
					{#if lastResponse.notification}
						<details class="mt-3">
							<summary
								class="cursor-pointer text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
							>
								View notification details
							</summary>
							<pre
								class="mt-2 overflow-auto rounded bg-gray-100 p-3 text-xs dark:bg-gray-700">
{JSON.stringify(lastResponse.notification, null, 2)}
							</pre>
						</details>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>
