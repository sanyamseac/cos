<script lang="ts">
	import '../app.css'
	import NavBar from '$lib/components/NavBar.svelte'
	import ScreenSize from '$lib/components/ScreenSize.svelte'
	import { serviceWorkerManager } from '$lib/serviceWorkerManager'
	import { onMount } from 'svelte'

	let { children } = $props()
	let smallScreen = $state(false)
	let viewLoaded = $state(false)

	let themeMode = $state('system')
	function updateTheme(mode: string) {
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
		themeMode = (localStorage.getItem('theme') as string) || 'system'
		updateTheme(themeMode)

		// Initialize Service Worker for push notifications
		if (typeof window !== 'undefined') {
			serviceWorkerManager
				.initializeServiceWorker()
				.then(() => {
					console.log('Service Worker initialization completed in layout')
				})
				.catch((error) => {
					console.error('Service Worker initialization failed in layout:', error)
				})
		}
	})
</script>

<div class="min-h-screen bg-white transition-colors dark:bg-gray-900">
	<ScreenSize bind:smallScreen bind:viewLoaded />
	{#if !smallScreen}
		<NavBar />
	{/if}
	{#if viewLoaded}
		<main>
			{@render children()}
		</main>
	{/if}
	{#if smallScreen}
		<NavBar />
	{/if}
</div>
