<script lang="ts">
	import { fade } from 'svelte/transition'
	import { ShoppingBasket } from 'lucide-svelte'

	let {
		message = 'Item added to basket',
		show = $bindable(true),
	}: {
		message?: string
		show: boolean
	} = $props()
</script>

{#if show && message}
	<div
		transition:fade={{ duration: 300 }}
	class="fixed bottom-20 left-1/2 transform -translate-x-1/2 flex items-center justify-center rounded-full bg-indigo-600 px-6 py-3 text-center text-white shadow-lg whitespace-nowrap"
	>
		<div class="flex items-center gap-2">
			<ShoppingBasket size={24} />
			<span>{message}</span>
		</div>
	</div>
{/if}
