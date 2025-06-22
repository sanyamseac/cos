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
		class="fixed bottom-20 left-1/2 flex -translate-x-1/2 transform items-center justify-center rounded-xl bg-green-600 px-6 py-3 text-center whitespace-nowrap text-white shadow-lg"
	>
		<div class="flex items-center gap-2">
			<ShoppingBasket size={24} />
			<span>{message}</span>
		</div>
	</div>
{/if}
