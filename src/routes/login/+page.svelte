<script lang="ts">
	import { enhance } from '$app/forms'
	import type { ActionData } from './$types'
	import { page } from '$app/state'
	import { User, Lock, LogIn, Landmark } from 'lucide-svelte'

	let { form }: { form: ActionData } = $props()
	let redirectUrl = page.url.searchParams.get('redirect') || '/'
	let isLoading = $state(false)
</script>

<svelte:head>
	<title>Login - IIIT Canteen Ordering System</title>
	<meta
		name="description"
		content="Sign in to your IIIT Canteen account to start ordering food."
	/>
</svelte:head>

<div
	class="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-8 pb-20 sm:px-10 lg:px-20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
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

	<div class="relative z-10 w-full max-w-md">
		<!-- Login Card -->
		<div
			class="rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800"
		>
			<!-- Header -->
			<div class="mb-8 text-center">
				<div
					class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600"
				>
					<User class="h-8 w-8 text-white" />
				</div>
				<h1
					class="mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent"
				>
					Welcome Back
				</h1>
				<p class="text-lg text-gray-700 dark:text-gray-300">
					Sign in to your canteen account
				</p>
			</div>

			<!-- Error Message -->
			{#if form?.message}
				<div
					class="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20"
				>
					<p class="text-sm text-red-600 dark:text-red-400">{form.message}</p>
				</div>
			{/if}
			<!-- CAS Login (Primary) -->
			<form method="post" action="?/oauth&redirect={redirectUrl}" use:enhance>
				<button
					type="submit"
					class="group mb-6 flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:from-indigo-600 hover:to-purple-700 hover:shadow-xl focus:ring-4 focus:ring-indigo-500/25 focus:outline-none"
				>
					<Landmark class="h-5 w-5 transition-transform group-hover:scale-110" />
					Continue with IIIT CAS
				</button>
			</form>
			<!-- Divider -->
			<div class="relative my-6">
				<div class="absolute inset-0 flex items-center">
					<div class="w-full border-t border-gray-300 dark:border-gray-600"></div>
				</div>
				<div class="relative flex justify-center text-sm">
					<span class="bg-white px-4 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
						>or sign in with credentials</span
					>
				</div>
			</div>

			<!-- Manual Login Form -->
			<form
				method="post"
				action="?/login&redirect={redirectUrl}"
				use:enhance={() => {
					isLoading = true
					return async ({ update }) => {
						await update()
						isLoading = false
					}
				}}
				class="space-y-6"
			>
				<!-- Username Field -->
				<div>
					<label
						for="username"
						class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
					>
						Username
					</label>
					<div class="relative">
						<div
							class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
						>
							<User class="h-5 w-5 text-gray-400" />
						</div>
						<input
							id="username"
							name="username"
							type="text"
							required
							autocomplete="username"
							class="block w-full rounded-xl border border-gray-300 bg-white py-3 pr-4 pl-10 text-gray-900 placeholder-gray-500 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
							placeholder="Enter your username"
						/>
					</div>
				</div>

				<!-- Password Field -->
				<div>
					<label
						for="password"
						class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
					>
						Password
					</label>
					<div class="relative">
						<div
							class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
						>
							<Lock class="h-5 w-5 text-gray-400" />
						</div>
						<input
							id="password"
							name="password"
							type="password"
							required
							autocomplete="current-password"
							class="block w-full rounded-xl border border-gray-300 bg-white py-3 pr-4 pl-10 text-gray-900 placeholder-gray-500 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
							placeholder="Enter your password"
						/>
					</div>
				</div>

				<!-- Login Button -->
				<button
					type="submit"
					disabled={isLoading}
					class="group flex w-full items-center justify-center gap-3 rounded-xl bg-gray-900 px-6 py-3 font-semibold text-white transition-all duration-200 hover:bg-gray-800 focus:ring-4 focus:ring-gray-900/25 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:hover:bg-gray-600"
				>
					{#if isLoading}
						<div
							class="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"
						></div>
						Signing in...
					{:else}
						<LogIn class="h-5 w-5 transition-transform group-hover:scale-110" />
						Sign In
					{/if}
				</button>
			</form>

			<!-- Footer Links -->
			<div class="mt-8 text-center">
				<p class="text-sm text-gray-600 dark:text-gray-400">
					Don't have an account?
					<a
						href="/register"
						class="font-medium text-blue-600 transition-colors hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
					>
						Too bad.
					</a>
				</p>
			</div>
		</div>

		<!-- Back to Home -->
		<div class="mt-6 text-center">
			<a
				href="/"
				class="inline-flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
			>
				← Back to Home
			</a>
		</div>
	</div>
</div>
