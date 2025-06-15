<script lang="ts">
	import { Button } from 'bits-ui'
	import { ArrowLeft, Share2, UserPlus } from 'lucide-svelte'
	import { goto } from '$app/navigation'

	let {
		basketCount,
		grandTotal,
		onShareBasket,
		onJoinBasket,
		hasBaskets,
	}: {
		basketCount: number
		grandTotal: number
		onShareBasket?: () => void
		onJoinBasket?: () => void
		hasBaskets: boolean
	} = $props()
</script>

<!-- Header -->
<div class="flex items-center justify-between">
	<div class="flex items-center gap-4">
		<Button.Root
			class="flex items-center gap-1 rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
			onclick={() => goto('/menu')}
		>
			<ArrowLeft size={16} />
			<span>Back to Menu</span>
		</Button.Root>
	</div>

	<h1
		class="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent"
	>
		My Basket
	</h1>

	<div class="flex items-center gap-2">
		{#if hasBaskets}
			<Button.Root
				class="flex items-center gap-1 rounded-lg bg-indigo-100 px-3 py-2 text-sm font-medium text-indigo-700 shadow-sm transition-all hover:bg-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:hover:bg-indigo-900/30"
				onclick={onShareBasket}
			>
				<Share2 size={16} />
				<span>Share</span>
			</Button.Root>
		{/if}
		<Button.Root
			class="flex items-center gap-1 rounded-lg bg-green-100 px-3 py-2 text-sm font-medium text-green-700 shadow-sm transition-all hover:bg-green-200 dark:bg-green-900/20 dark:text-green-300 dark:hover:bg-green-900/30"
			onclick={onJoinBasket}
		>
			<UserPlus size={16} />
			<span>Join</span>
		</Button.Root>
	</div>
</div>

<!-- Grand Total Display -->
{#if grandTotal > 0}
	<div class="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
		<div class="text-center">
			<p class="text-sm text-gray-600 dark:text-gray-300">Grand Total Across All Canteens</p>
			<p class="text-2xl font-bold text-gray-900 dark:text-white">
				₹{grandTotal.toFixed(2)}
			</p>
			<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
				Place orders individually for each canteen below
			</p>
		</div>
	</div>
{/if}
