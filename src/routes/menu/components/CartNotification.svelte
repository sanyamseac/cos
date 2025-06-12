<script lang="ts">
	import { fade } from 'svelte/transition'
	import { ShoppingCart } from 'lucide-svelte'

	let {
		message,
		show,
	}: {
		message: string
		show: boolean
	} = $props()
</script>

{#if show && message}
	<div
		transition:fade={{ duration: 300 }}
		class="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 transform rounded-full bg-indigo-600 px-6 py-3 text-center text-white shadow-lg"
	>
		<div class="flex items-center gap-2">
			<ShoppingCart size={18} />
			<span>{message}</span>
		</div>
	</div>
{/if}
