<script lang="ts">
	import '../app.css'
	import NavBar from '$lib/components/NavBar.svelte'
	import ScreenSize from '$lib/components/ScreenSize.svelte'
	import { view } from 'drizzle-orm/sqlite-core'

	let { children } = $props()
	let smallScreen = $state(false)
	let viewLoaded = $state(false)
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
