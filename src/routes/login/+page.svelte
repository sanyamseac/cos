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
	<meta name="description" content="Sign in to your IIIT Canteen account to start ordering food." />
</svelte:head>

<div class="min-h-screen pb-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-8 sm:px-10 lg:px-20 relative overflow-hidden">
	<!-- Decorative background elements -->
	<div class="absolute inset-0 opacity-20">
		<div class="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full blur-3xl"></div>
		<div class="absolute top-1/3 right-20 w-48 h-48 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full blur-3xl"></div>
		<div class="absolute bottom-20 left-1/4 w-40 h-40 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full blur-3xl"></div>
	</div>
	
	<div class="relative z-10 w-full max-w-md">
		<!-- Login Card -->
		<div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-8 shadow-sm">
			<!-- Header -->
			<div class="text-center mb-8">
				<div class="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
					<User class="w-8 h-8 text-white" />
				</div>
				<h1 class="text-4xl font-bold mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Welcome Back</h1>
				<p class="text-lg text-gray-700 dark:text-gray-300">Sign in to your canteen account</p>
			</div>

			<!-- Error Message -->
			{#if form?.message}
				<div class="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
					<p class="text-red-600 dark:text-red-400 text-sm">{form.message}</p>
				</div>
			{/if}			<!-- CAS Login (Primary) -->
			<form method="post" action="?/oauth&redirect={redirectUrl}" use:enhance>
				<button 
					type="submit"
					class="w-full mb-6 flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl focus:ring-4 focus:ring-indigo-500/25 focus:outline-none group"
				>
					<Landmark class="w-5 h-5 group-hover:scale-110 transition-transform" />
					Continue with IIIT CAS
				</button>
			</form>			<!-- Divider -->
			<div class="relative my-6">
				<div class="absolute inset-0 flex items-center">
					<div class="w-full border-t border-gray-300 dark:border-gray-600"></div>
				</div>
				<div class="relative flex justify-center text-sm">
					<span class="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">or sign in with credentials</span>
				</div>
			</div>

			<!-- Manual Login Form -->
			<form method="post" action="?/login&redirect={redirectUrl}" use:enhance={() => {
				isLoading = true;
				return async ({ update }) => {
					await update();
					isLoading = false;
				};
			}} class="space-y-6">
				<!-- Username Field -->
				<div>
					<label for="username" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Username
					</label>
					<div class="relative">
						<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<User class="h-5 w-5 text-gray-400" />
						</div>
						<input
							id="username"
							name="username"
							type="text"
							required
							autocomplete="username"
							class="block w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200"
							placeholder="Enter your username"
						/>
					</div>
				</div>

				<!-- Password Field -->
				<div>
					<label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Password
					</label>
					<div class="relative">
						<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<Lock class="h-5 w-5 text-gray-400" />
						</div>
						<input
							id="password"
							name="password"
							type="password"
							required
							autocomplete="current-password"
							class="block w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200"
							placeholder="Enter your password"
						/>
					</div>
				</div>

				<!-- Login Button -->
				<button
					type="submit"
					disabled={isLoading}
					class="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-4 focus:ring-gray-900/25 focus:outline-none group"
				>
					{#if isLoading}
						<div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
						Signing in...
					{:else}
						<LogIn class="w-5 h-5 group-hover:scale-110 transition-transform" />
						Sign In
					{/if}
				</button>
			</form>

			<!-- Footer Links -->
			<div class="mt-8 text-center">
				<p class="text-sm text-gray-600 dark:text-gray-400">
					Don't have an account? 
					<a href="/register" class="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
						Too bad.
					</a>
				</p>
			</div>
		</div>

		<!-- Back to Home -->
		<div class="mt-6 text-center">
			<a 
				href="/"
				class="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
			>
				← Back to Home
			</a>
		</div>
	</div>
</div>
