<script lang="ts">
	import { enhance } from '$app/forms'
	import type { PageServerData } from './$types'
	import { Button } from 'bits-ui'
	import { LogOut } from 'lucide-svelte'
	import ProfilePictureDialog from './components/ProfilePictureDialog.svelte'
	import Elements from '$lib/components/Elements.svelte'
	import Wallets from './components/Wallets.svelte'
	import Legal from './components/Legal.svelte'
	import Notifications from './components/Notifications.svelte'
	import Preferences from './components/Preferences.svelte'
	import Profile from './components/Profile.svelte'

	let { data }: { data: PageServerData } = $props()
	let isEditingPic = $state(false)
</script>

<ProfilePictureDialog
	bind:open={isEditingPic}
	currentProfilePic={data.user.profilePicture}
	userName={data.user.name}
	userEmail={data.user.email}
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

		<Profile {data} bind:isEditingPic={isEditingPic}/>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<Notifications {data} />
			<Preferences {data} />
		</div>

		<Wallets {data} />
		<Legal />
	</div>
</div>
