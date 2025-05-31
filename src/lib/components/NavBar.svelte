<script lang="ts">
	import { Moon, Sun, Menu, X } from 'lucide-svelte'

	let { darkMode = $bindable(false) } = $props()
	let mobileMenuOpen = $state(false)

	function toggleDarkMode() {
		darkMode = !darkMode
		if (darkMode) {
			document.documentElement.classList.add('dark')
		} else {
			document.documentElement.classList.remove('dark')
		}
	}
</script>

<nav
	class="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-gray-800 dark:bg-gray-900/95 dark:supports-[backdrop-filter]:bg-gray-900/60"
>
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="flex h-16 items-center justify-between">
			<!-- Logo -->
			<div class="flex items-center">
				<a href="/" class="flex items-center space-x-2">
					<div
						class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400"
					>
						<span class="text-sm font-bold text-white">C</span>
					</div>
					<span class="text-xl font-bold text-gray-900 dark:text-white">Canteen Ordering System</span
					>
				</a>
			</div>

			<!-- Desktop Navigation -->
			<div class="hidden md:block">
				<div class="ml-10 flex items-baseline space-x-4">
					<a
						href="/"
						class="rounded-md px-3 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
					>
						Home
					</a>
					<a
						href="/menu"
						class="rounded-md px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
					>
						Menu
					</a>
					<a
						href="/orders"
						class="rounded-md px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
					>
						Orders
					</a>
					<a
						href="/about"
						class="rounded-md px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
					>
						About
					</a>
				</div>
			</div>

			<!-- Right side buttons -->
			<div class="hidden items-center space-x-4 md:flex">
				<!-- Dark mode toggle -->
				<button
					class="rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
					onclick={toggleDarkMode}
				>
					{#if darkMode}
						<Sun class="h-5 w-5" />
					{:else}
						<Moon class="h-5 w-5" />
					{/if}
				</button>

				<!-- Auth buttons -->
				<a
					href="/login"
					class="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
				>
					Sign In
				</a>
			</div>

			<!-- Mobile menu button -->
			<div class="flex items-center space-x-2 md:hidden">
				<!-- Dark mode toggle mobile -->
				<button
					class="rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
					onclick={toggleDarkMode}
				>
					{#if darkMode}
						<Sun class="h-5 w-5" />
					{:else}
						<Moon class="h-5 w-5" />
					{/if}
				</button>

				<button
					class="rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
					onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
				>
					{#if mobileMenuOpen}
						<X class="h-6 w-6" />
					{:else}
						<Menu class="h-6 w-6" />
					{/if}
				</button>
			</div>
		</div>
	</div>

	<!-- Mobile menu -->
	{#if mobileMenuOpen}
		<div class="md:hidden">
			<div
				class="space-y-1 border-t border-gray-200 bg-white px-2 pt-2 pb-3 sm:px-3 dark:border-gray-800 dark:bg-gray-900"
			>
				<a
					href="/"
					class="block rounded-md px-3 py-2 text-base font-medium text-gray-900 hover:bg-blue-50 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
				>
					Home
				</a>
				<a
					href="/menu"
					class="block rounded-md px-3 py-2 text-base font-medium text-gray-500 hover:bg-blue-50 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
				>
					Menu
				</a>
				<a
					href="/orders"
					class="block rounded-md px-3 py-2 text-base font-medium text-gray-500 hover:bg-blue-50 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
				>
					Orders
				</a>
				<a
					href="/about"
					class="block rounded-md px-3 py-2 text-base font-medium text-gray-500 hover:bg-blue-50 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
				>
					About
				</a>
				<div class="border-t border-gray-200 pt-4 dark:border-gray-700">
					<a
						href="/login"
						class="block rounded-md bg-blue-600 px-3 py-2 text-center text-base font-medium text-white hover:bg-blue-700"
					>
						Sign In
					</a>
				</div>
			</div>
		</div>
	{/if}
</nav>
