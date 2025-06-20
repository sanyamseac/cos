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
		<div class="flex items-center justify-between pb-4">
			<div>
				<h1
					class="text-4xl font-sensation text-gray-800 dark:text-white sm:text-5xl md:text-6xl"
				>
					profile
				</h1>
			</div>
		</div>

		<Profile {data} bind:isEditingPic />
		<hr class="mt-6 mb-7 border-gray-400 dark:border-gray-500" />

		<div class="grid grid-cols-1 gap-5.5 md:grid-cols-2">
			<Notifications {data} />
			<Preferences {data} />
		</div>
		<hr class="border-gray-400 dark:border-gray-500" />

		<Wallets {data} />
		<hr class="border-gray-400 dark:border-gray-500" />
		<div>
			<form method="post" action="login?/logout" use:enhance>
				<Button.Root
					class="rounded-xl w-full bg-gradient-to-r from-red-600 to-red-700 px-2 py-2 font-semibold text-white shadow-lg transition-all duration-300 hover:from-red-800 hover:to-red-900 hover:shadow-xl"
				>
					<div class="flex items-center text-gray-200 justify-center px-2">
						Logout
						<LogOut class="ml-3 h-4 w-4" />
					</div>
				</Button.Root>
			</form>
		</div>
		<Legal />
	</div>
</div>
