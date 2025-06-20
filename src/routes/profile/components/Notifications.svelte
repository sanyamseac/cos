<script lang="ts">
	import { onMount } from 'svelte'
	import { enhance } from '$app/forms'
	import { Switch } from 'bits-ui'
	import { Bell, Mailbox, Globe } from 'lucide-svelte'
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

<div class="space-y-5">
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-3">
			<Mailbox class="h-5 w-5 text-gray-800 dark:text-gray-200" />
			<p class="text-gray-800 dark:text-gray-200">
				Email Notifications
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
				class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500 data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-200 dark:data-[state=unchecked]:bg-gray-700"
				onclick={(e) =>
					setTimeout(() => (e.target as HTMLInputElement).form?.requestSubmit(), 500)}
			>
				<Switch.Thumb
					class="inline-block h-4 w-4 bg-gray-400 data-[state=checked]:bg-gray-100 transform rounded-full bg-gray-200 transition-transform data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-1"
				/>
			</Switch.Root>
		</form>
	</div>

	{#if serviceWorkerManager.isSupported}
		<div class="flex items-center justify-between">
			<div class="flex-1">
				<div class="flex items-center gap-3">
					<Globe class="h-5 w-5 text-gray-800 dark:text-gray-200" />
					<p class="text-gray-800 dark:text-gray-200">
						Browser Notifications
					</p>
				</div>
				{#if isManagingPush}
					<p class="mt-1 text-xs text-gray-500 dark:text-gray-200">
						Managing push notifications...
					</p>
				{:else if notificationService.permissionStatus === 'denied'}
					<p class="mt-1 text-xs text-red-600 dark:text-red-400">
						Push notifications denied. Please enable in browser settings.
					</p>
				{/if}
			</div>
			<Switch.Root
				checked={pushNotifications}
				onCheckedChange={handlePushNotificationToggle}
				disabled={isManagingPush || notificationService.permissionStatus === 'denied'}
				class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500 disabled:opacity-50 data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-200 dark:data-[state=unchecked]:bg-gray-700"
			>
				<Switch.Thumb
					class="inline-block h-4 w-4 bg-gray-400 data-[state=checked]:bg-gray-100 transform rounded-full bg-gray-200 transition-transform data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-1"
				/>
			</Switch.Root>
		</div>
	{/if}
</div>
