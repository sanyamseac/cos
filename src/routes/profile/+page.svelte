<script lang="ts">
	import type { PageServerData } from './$types'
	import ProfilePictureDialog from './components/ProfilePictureDialog.svelte'
	import Elements from '$lib/components/Elements.svelte'
	import Wallets from './components/Wallets.svelte'
	import Legal from './components/Legal.svelte'
	import Notifications from './components/Notifications.svelte'
	import Preferences from './components/Preferences.svelte'
	import Profile from './components/Profile.svelte'
	import Header from './components/Header.svelte'

	let { data }: { data: PageServerData } = $props()
	let isEditingPic = $state(false)
</script>

<svelte:head>
	<title>Profile</title>
	<meta name="description" content="Manage your profile, preferences, and notifications." />
</svelte:head>

<ProfilePictureDialog
	bind:open={isEditingPic}
	currentProfilePic={data.user.profilePicture}
/>

<div
	class="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
>
	<Elements />

	<div class="relative z-10 space-y-8 px-4 py-6">
		<Header />

		<Profile {data} bind:isEditingPic />
		<hr class="mt-6 mb-7 border-gray-400 dark:border-gray-500" />

		<div class="grid grid-cols-1 gap-5.5 md:grid-cols-2">
			<Notifications {data} />
			<Preferences {data} />
		</div>
		<hr class="border-gray-400 dark:border-gray-500" />

		<Wallets {data} />
		<hr class="border-gray-400 dark:border-gray-500" />
		<Legal />
	</div>
</div>
