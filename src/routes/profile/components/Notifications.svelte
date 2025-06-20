<script lang="ts">
	import { onMount } from 'svelte'
	import { enhance } from '$app/forms'
	import { Switch } from 'bits-ui'
	import { Bell } from 'lucide-svelte'
	import { notificationService } from '$lib/notifications'
	import { serviceWorkerManager } from '$lib/serviceWorkerManager'

	let { data }: { data: any } = $props()
	let emailNotifs = $state(true)
	emailNotifs = data.user.emailPreference === 'all' ? true : false
	let pushNotifications = $state(false)
	let isManagingPush = $state(false)
	async function handlePushNotificationToggle(enabled: boolean) {
		isManagingPush = true
		try {
			if (enabled) {
				const success = await notificationService.enablePushNotifications(data.user.id)
				pushNotifications = success
			} else {
				await notificationService.disablePushNotifications(data.user.id)
				pushNotifications = false
			}
		} catch (error) {
			pushNotifications = false
		} finally {
			isManagingPush = false
		}
	}

	onMount(async () => {
		if (serviceWorkerManager.isSupported) {
			try {
				const subscription = await serviceWorkerManager.getPushSubscription()
				pushNotifications = !!subscription
			} catch (error) {
				pushNotifications = false
			}
		}
	})
</script>

<div
	class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
>
	<div class="mb-6 flex items-center gap-3">
		<div class="rounded-lg bg-gradient-to-br from-yellow-500 to-orange-600 p-2">
			<Bell class="h-5 w-5 text-white" />
		</div>
		<h3 class="text-lg font-semibold text-gray-800 dark:text-white">Notifications</h3>
	</div>
	<div class="space-y-4">
		<div class="flex items-center justify-between">
			<div>
				<p class="font-medium text-gray-800 dark:text-white">
					Important Email Notifications
				</p>
				<p class="mt-1 text-xs text-green-600 dark:text-green-400">
					{#if emailNotifs}
						✅ All email notifications enabled
					{:else}
						❌ Important email notifications only
					{/if}
				</p>
			</div>
			<form method="post" action="profile?/updateEmailPreference" use:enhance>
				<input
					type="hidden"
					name="emailPreference"
					value={emailNotifs ? 'all' : 'important'}
				/>
				<Switch.Root
					bind:checked={emailNotifs}
					class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200 dark:data-[state=unchecked]:bg-gray-700"
					onclick={(e) =>
						setTimeout(() => (e.target as HTMLInputElement).form?.requestSubmit(), 500)}
				>
					<Switch.Thumb
						class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-1"
					/>
				</Switch.Root>
			</form>
		</div>

		{#if serviceWorkerManager.isSupported}
			<div class="flex items-center justify-between">
				<div class="flex-1">
					<p class="font-medium text-gray-800 dark:text-white">
						Browser Push Notifications
					</p>
					{#if pushNotifications}
						<p class="mt-1 text-xs text-green-600 dark:text-green-400">
							✅ Push notifications active
						</p>
					{:else if isManagingPush}
						<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
							Enabling push notifications...
						</p>
					{:else if notificationService.permissionStatus === 'denied'}
						<p class="mt-1 text-xs text-red-600 dark:text-red-400">
							❌ Push notifications denied. Please enable in browser settings.
						</p>
					{:else if notificationService.permissionStatus === 'default'}
						<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
							Click to request permission for push notifications.
						</p>
					{:else}
						<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
							Click to enable push notifications.
						</p>
					{/if}
				</div>
				<Switch.Root
					checked={pushNotifications}
					onCheckedChange={handlePushNotificationToggle}
					disabled={isManagingPush || notificationService.permissionStatus === 'denied'}
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
