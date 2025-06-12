<script lang="ts">
	import { Button } from 'bits-ui'
	import { ShoppingCart } from 'lucide-svelte'
	import { goto } from '$app/navigation'
</script>

<!-- Empty Basket -->
<div class="mx-auto max-w-md rounded-xl bg-white p-8 text-center shadow-sm dark:bg-gray-800">
	<div class="mb-4 flex justify-center">
		<div
			class="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700"
		>
			<ShoppingCart size={32} class="text-gray-400" />
		</div>
	</div>
	<h2 class="mb-2 text-xl font-semibold text-gray-900 dark:text-white">Your basket is empty</h2>
	<p class="mb-6 text-gray-600 dark:text-gray-300">
		Start adding items from the menu to get started!
	</p>
	<Button.Root
		class="w-full rounded-lg bg-indigo-600 py-3 font-medium text-white transition-all hover:bg-indigo-700"
		onclick={() => goto('/menu')}
	>
		Browse Menu
	</Button.Root>
</div>
