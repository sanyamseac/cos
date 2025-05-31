<script lang="ts">
	import '../app.css'
	import NavBar from '$lib/components/NavBar.svelte'
	import { onMount } from 'svelte'

	let { children } = $props()
	type ThemeMode = 'system' | 'light' | 'dark'
	let themeMode = $state<ThemeMode>('system')

	function updateTheme(mode: ThemeMode) {
		themeMode = mode

		if (mode === 'system') {
			// Follow system preference
			const isDarkSystem = window.matchMedia('(prefers-color-scheme: dark)').matches
			if (isDarkSystem) {
				document.documentElement.classList.add('dark')
			} else {
				document.documentElement.classList.remove('dark')
			}
		} else if (mode === 'dark') {
			document.documentElement.classList.add('dark')
		} else {
			document.documentElement.classList.remove('dark')
		}
	}

	onMount(() => {
		// Check for saved theme preference or default to system
		const savedTheme = localStorage.getItem('theme') as ThemeMode
		if (savedTheme && ['system', 'light', 'dark'].includes(savedTheme)) {
			updateTheme(savedTheme)
		} else {
			updateTheme('system')
		}

		// Listen for system theme changes when in system mode
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
		const handleSystemThemeChange = () => {
			if (themeMode === 'system') {
				updateTheme('system')
			}
		}
		mediaQuery.addEventListener('change', handleSystemThemeChange)

		return () => {
			mediaQuery.removeEventListener('change', handleSystemThemeChange)
		}
	})

	$effect(() => {
		// Save theme preference
		localStorage.setItem('theme', themeMode)
	})
</script>

<div class="min-h-screen bg-white transition-colors dark:bg-gray-900">
	<NavBar bind:themeMode {updateTheme} />
	<main>
		{@render children()}
	</main>
</div>
