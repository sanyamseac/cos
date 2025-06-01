<script lang="ts">
	import { onMount } from 'svelte'

	let { smallScreen = $bindable(false), viewLoaded = $bindable(false) } = $props()

	const handleWindowResize = () => {
		smallScreen = window.innerWidth < 768
		viewLoaded = true
	}

	onMount(() => {
		handleWindowResize()
		window.addEventListener('resize', handleWindowResize)
	})
</script>
