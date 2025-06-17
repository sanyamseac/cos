<script lang="ts">
	import { enhance } from '$app/forms'
	import type { PageServerData } from './$types'
	import { Button, Avatar } from 'bits-ui'
	import { User, Mail, Shield, Bell, Lock, Palette, Camera, LogOut } from 'lucide-svelte'
	import ProfilePictureDialog from './components/ProfilePictureDialog.svelte'
	import Elements from '$lib/components/Elements.svelte'
	import Wallets from './components/Wallets.svelte'
	import Legal from './components/Legal.svelte'
	import Notifications from './components/Notifications.svelte'
	import Preferences from './components/Preferences.svelte'

	let { data }: { data: PageServerData } = $props()
	let isEditingPic = $state(false)

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
				data.user.profilePicture = profilePicUrl
			} else {
				console.error('Failed to update profile picture')
				alert('Failed to update profile picture. Please try again.')
			}
		} catch (error) {
			console.error('Error updating profile picture:', error)
			alert('An error occurred while updating your profile picture.')
		}

		isEditingPic = false
	}
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
	<Elements />

	<div class="relative z-10 space-y-8 px-4 py-6">
		<div class="flex items-center justify-between">
			<div>
				<h1
					class="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent"
				>
					Profile
				</h1>
			</div>
			<div>
				<form method="post" action="login?/logout" use:enhance>
					<Button.Root
						class="rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-2 py-2 font-semibold text-white shadow-lg transition-all duration-300 hover:from-red-600 hover:to-red-700 hover:shadow-xl"
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
						<Avatar.Root class="h-20 w-20">
							<Avatar.Image
								src={data.user.profilePicture || undefined}
								alt="Profile picture"
								class="h-full w-full object-cover"
							/>
							<Avatar.Fallback
								class="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
							>
								<User class="h-10 w-10" />
							</Avatar.Fallback>
						</Avatar.Root>
						<Button.Root
							class="absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 transition-colors hover:bg-blue-600"
							onclick={() => (isEditingPic = true)}
						>
							<Camera class="h-3 w-3 text-white" />
						</Button.Root>
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

	<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
		<Notifications {data} />
		<Preferences {data} />
	</div>

		<Wallets {data} />
		<Legal />
	</div>
</div>
