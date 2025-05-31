<script lang="ts">
	import '../app.css'
	import NavBar from '$lib/components/NavBar.svelte'
	import { onMount } from 'svelte'

	let { children } = $props()
	let darkMode = $state(false)

	onMount(() => {
		// Check for saved theme preference or default to light mode
		const savedTheme = localStorage.getItem('theme')
		if (
			savedTheme === 'dark' ||
			(!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
		) {
			darkMode = true
			document.documentElement.classList.add('dark')
		}
	})

	$effect(() => {
		// Save theme preference
		localStorage.setItem('theme', darkMode ? 'dark' : 'light')
	})
</script>

<div class="min-h-screen bg-white transition-colors dark:bg-gray-900">
	<NavBar bind:darkMode />
	<main>
		{@render children()}
	</main>
</div>
