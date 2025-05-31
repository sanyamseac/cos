<script lang="ts">
	import { Moon, Sun, Menu, X, Monitor, ChevronDown } from 'lucide-svelte'

	type ThemeMode = 'system' | 'light' | 'dark'
	let { themeMode = $bindable<ThemeMode>('system'), updateTheme } = $props<{
		themeMode: ThemeMode
		updateTheme: (mode: ThemeMode) => void
	}>()

	let mobileMenuOpen = $state(false)
	let themeDropdownOpen = $state(false)
	let themeDropdownRef: HTMLDivElement

	function handleThemeChange(mode: ThemeMode) {
		updateTheme(mode)
		themeDropdownOpen = false
		mobileMenuOpen = false
	}

	function getThemeIcon(mode: ThemeMode) {
		switch (mode) {
			case 'light':
				return Sun
			case 'dark':
				return Moon
			case 'system':
			default:
				return Monitor
		}
	}

	function getThemeLabel(mode: ThemeMode) {
		switch (mode) {
			case 'light':
				return 'Light'
			case 'dark':
				return 'Dark'
			case 'system':
			default:
				return 'System'
		}
	}

	function handleClickOutside(event: MouseEvent) {
		if (themeDropdownRef && !themeDropdownRef.contains(event.target as Node)) {
			themeDropdownOpen = false
		}
	}

	$effect(() => {
		if (themeDropdownOpen) {
			document.addEventListener('click', handleClickOutside)
		} else {
			document.removeEventListener('click', handleClickOutside)
		}

		return () => {
			document.removeEventListener('click', handleClickOutside)
		}
	})
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
					<span class="text-xl font-bold text-gray-900 dark:text-white"
						>Canteen Ordering System</span
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
				<!-- Theme dropdown -->
				<div class="relative" bind:this={themeDropdownRef}>
					<button
						class="flex items-center space-x-2 rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
						onclick={() => (themeDropdownOpen = !themeDropdownOpen)}
					>
						<svelte:component this={getThemeIcon(themeMode)} class="h-5 w-5" />
						<span class="text-sm font-medium">{getThemeLabel(themeMode)}</span>
						<ChevronDown class="h-4 w-4" />
					</button>

					{#if themeDropdownOpen}
						<div
							class="ring-opacity-5 absolute top-full right-0 z-50 mt-2 w-48 rounded-md border border-gray-200 bg-white py-1 shadow-lg ring-1 ring-black dark:border-gray-700 dark:bg-gray-800"
						>
							<button
								class="flex w-full items-center space-x-2 px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
								onclick={() => handleThemeChange('system')}
								class:bg-gray-100={themeMode === 'system'}
								class:dark:bg-gray-700={themeMode === 'system'}
							>
								<Monitor class="h-4 w-4" />
								<span>System</span>
							</button>
							<button
								class="flex w-full items-center space-x-2 px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
								onclick={() => handleThemeChange('light')}
								class:bg-gray-100={themeMode === 'light'}
								class:dark:bg-gray-700={themeMode === 'light'}
							>
								<Sun class="h-4 w-4" />
								<span>Light</span>
							</button>
							<button
								class="flex w-full items-center space-x-2 px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
								onclick={() => handleThemeChange('dark')}
								class:bg-gray-100={themeMode === 'dark'}
								class:dark:bg-gray-700={themeMode === 'dark'}
							>
								<Moon class="h-4 w-4" />
								<span>Dark</span>
							</button>
						</div>
					{/if}
				</div>

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
				<!-- Theme toggle mobile -->
				<button
					class="rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
					onclick={() => (themeDropdownOpen = !themeDropdownOpen)}
				>
					<svelte:component this={getThemeIcon(themeMode)} class="h-5 w-5" />
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

				<!-- Theme selection mobile -->
				<div class="border-t border-gray-200 pt-4 dark:border-gray-700">
					<p class="px-3 text-sm font-medium text-gray-500 dark:text-gray-400">Theme</p>
					<div class="mt-2 space-y-1">
						<button
							class="flex w-full items-center space-x-2 rounded-md px-3 py-2 text-base font-medium text-gray-500 hover:bg-blue-50 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
							onclick={() => handleThemeChange('system')}
							class:text-blue-600={themeMode === 'system'}
							class:bg-blue-50={themeMode === 'system'}
							class:dark:text-white={themeMode === 'system'}
							class:dark:bg-gray-800={themeMode === 'system'}
						>
							<Monitor class="h-5 w-5" />
							<span>System</span>
						</button>
						<button
							class="flex w-full items-center space-x-2 rounded-md px-3 py-2 text-base font-medium text-gray-500 hover:bg-blue-50 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
							onclick={() => handleThemeChange('light')}
							class:text-blue-600={themeMode === 'light'}
							class:bg-blue-50={themeMode === 'light'}
							class:dark:text-white={themeMode === 'light'}
							class:dark:bg-gray-800={themeMode === 'light'}
						>
							<Sun class="h-5 w-5" />
							<span>Light</span>
						</button>
						<button
							class="flex w-full items-center space-x-2 rounded-md px-3 py-2 text-base font-medium text-gray-500 hover:bg-blue-50 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
							onclick={() => handleThemeChange('dark')}
							class:text-blue-600={themeMode === 'dark'}
							class:bg-blue-50={themeMode === 'dark'}
							class:dark:text-white={themeMode === 'dark'}
							class:dark:bg-gray-800={themeMode === 'dark'}
						>
							<Moon class="h-5 w-5" />
							<span>Dark</span>
						</button>
					</div>
				</div>

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
