<script lang="ts">
	import { enhance } from '$app/forms'
	import type { PageServerData } from './$types'
	import { User, Mail, Shield, LogOut, Edit3, Settings } from 'lucide-svelte'

	let { data }: { data: PageServerData } = $props()
</script>

<svelte:head>
	<title>Profile - IIIT Canteen Ordering System</title>
	<meta
		name="description"
		content="Manage your profile and account settings for the IIIT Canteen ordering system."
	/>
</svelte:head>

<div
	class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 pt-20 pb-12 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800"
>
	<!-- Background decorative elements -->
	<div
		class="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-blue-100 opacity-30 blur-3xl dark:bg-blue-900/20"
	></div>
	<div
		class="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-cyan-100 opacity-30 blur-3xl dark:bg-cyan-900/20"
	></div>

	<div class="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
		<!-- Header Section -->
		<div class="mb-12 text-center">
			<div
				class="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg"
			>
				<User class="h-12 w-12 text-white" />
			</div>
			<h1 class="mb-2 text-4xl font-bold text-gray-900 dark:text-white">
				Welcome back, {data.user.name}!
			</h1>
			<p class="text-lg text-gray-600 dark:text-gray-300">
				Manage your profile and account preferences
			</p>
		</div>

		<!-- Profile Cards Grid -->
		<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
			<!-- Main Profile Card -->
			<div class="lg:col-span-2">
				<div
					class="rounded-2xl border border-gray-200/50 bg-white/80 p-8 shadow-xl backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/80"
				>
					<div class="mb-6 flex items-center justify-between">
						<h2 class="text-2xl font-bold text-gray-900 dark:text-white">
							Profile Information
						</h2>
					</div>

					<div class="space-y-6">
						<!-- Name -->
						<div class="flex items-start space-x-4">
							<div
								class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/20"
							>
								<User class="h-6 w-6 text-blue-600 dark:text-blue-400" />
							</div>
							<div class="flex-1">
								<h3
									class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
								>
									Full Name
								</h3>
								<p class="text-base font-semibold text-gray-900 dark:text-white">
									{data.user.name}
								</p>
							</div>
						</div>

						<!-- Email -->
						<div class="flex items-start space-x-4">
							<div
								class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/20"
							>
								<Mail class="h-6 w-6 text-green-600 dark:text-green-400" />
							</div>
							<div class="flex-1">
								<h3
									class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
								>
									Email Address
								</h3>
								<p class="text-base font-semibold text-gray-900 dark:text-white">
									{data.user.email}
								</p>
							</div>
						</div>

						<!-- User ID -->
						<div class="flex items-start space-x-4">
							<div
								class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/20"
							>
								<Settings class="h-6 w-6 text-purple-600 dark:text-purple-400" />
							</div>
							<div class="flex-1">
								<h3
									class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
								>
									User ID
								</h3>
								<p
									class="font-mono text-base font-semibold text-gray-900 dark:text-white"
								>
									{data.user.id}
								</p>
							</div>
						</div>

						<!-- Role -->
						<div class="flex items-start space-x-4">
							<div
								class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/20"
							>
								<Shield class="h-6 w-6 text-orange-600 dark:text-orange-400" />
							</div>
							<div class="flex-1">
								<h3
									class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
								>
									Account Role
								</h3>
								<span
									class="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 capitalize dark:bg-blue-900/20 dark:text-blue-400"
								>
									{data.user.role}
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Account Actions Card -->
			<div class="space-y-6">
				<!-- Sign Out Card -->

				<form method="post" action="login?/logout" use:enhance>
					<button
						type="submit"
						class="group flex w-full items-center justify-center gap-3 rounded-xl bg-red-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:bg-red-700 hover:shadow-xl focus:ring-4 focus:ring-red-600/25 focus:outline-none"
					>
						<LogOut class="h-5 w-5 transition-transform group-hover:scale-110" />
						Sign Out
					</button>
				</form>

				<!-- Account Stats Card -->
				<div
					class="rounded-2xl border border-gray-200/50 bg-white/80 p-6 shadow-xl backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/80"
				>
					<h3 class="mb-4 text-lg font-bold text-gray-900 dark:text-white">
						Account Stats
					</h3>

					<div class="space-y-4">
						<div class="flex items-center justify-between">
							<span class="text-gray-600 dark:text-gray-300">Favorite Item</span>
							<span class="text-sm font-medium text-gray-900 dark:text-white"
								>Masala Dosa</span
							>
						</div>
						<div class="flex items-center justify-between">
							<span class="text-gray-600 dark:text-gray-300">Favorite Canteen</span>
							<span class="text-sm font-medium text-gray-900 dark:text-white"
								>Vindhya Canteen</span
							>
						</div>
						<div class="flex items-center justify-between">
							<span class="text-gray-600 dark:text-gray-300">Total Orders</span>
							<span class="text-xl font-bold text-blue-600 dark:text-blue-400"
								>42</span
							>
						</div>
						<div class="flex items-center justify-between">
							<span class="text-gray-600 dark:text-gray-300">Total Spent</span>
							<span class="text-sm font-medium text-gray-900 dark:text-white"
								>₹1000</span
							>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
