<script lang="ts">
	import { Dialog } from 'bits-ui'
	import { Button } from 'bits-ui'
	import { X } from 'lucide-svelte'
	import { enhance } from '$app/forms'
	import { invalidateAll } from '$app/navigation'

	let {
		open = $bindable(false),
	}: {
		open: boolean
	} = $props()

	let accessCode = $state('')
	let loading = $state(false)
	let error = $state('')
	let success = $state('')

	function handleClose() {
		open = false
		error = ''
		success = ''
		loading = false
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Portal>
		<Dialog.Overlay class="fixed inset-0 z-50 bg-black/50" />
		<Dialog.Content
			class="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800"
		>
			<div class="flex items-center justify-between mb-4">
				<Dialog.Title class="text-lg font-semibold text-gray-900 dark:text-white">
					Join Basket
				</Dialog.Title>
				<Dialog.Close class="rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-700" onclick={handleClose}>
					<X size={20} class="text-gray-500" />
				</Dialog.Close>
			</div>

			<form
				method="POST" 
				action="?/joinBasket"
				class="space-y-4"
				use:enhance={() => {
					return async ({ result }) => {
						if (result.type === 'success') {
							invalidateAll()
							open = false
						} else if (result.type === 'failure' && result.data) {
							alert(result.data?.error || 'Failed to join basket')
						}
					}
				}}
				>
				<p class="text-sm text-gray-600 dark:text-gray-300">
					Enter the 8-character access code to join someone's basket and order together.
				</p>

				<div>
					<label for="accessCode" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Access Code
					</label>
					<input
						type="text"
						id="accessCode"
						name="accessCode"
						bind:value={accessCode}
						maxlength="8"
						pattern="[A-Z0-9]&#123;8&#125;"
						class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-center text-lg font-mono tracking-wider uppercase"
						placeholder="XXXXXXXX"
						disabled={loading}
						required
					/>
					{accessCode}
				</div>

				{#if error}
					<div class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
						<p class="text-red-700 dark:text-red-300 text-sm">{error}</p>
					</div>
				{/if}

				{#if success}
					<div class="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
						<p class="text-green-700 dark:text-green-300 text-sm">{success}</p>
					</div>
				{/if}

				<div class="flex gap-3">
					<Button.Root
						type="button"
						class="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
						onclick={handleClose}
						disabled={loading}
					>
						Cancel
					</Button.Root>
					<Button.Root
						type="submit"
						class="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						disabled={loading || !accessCode.trim()}
					>
						{loading ? 'Joining...' : 'Join Basket'}
					</Button.Root>
				</div>

				<div class="text-xs text-gray-500 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
					<p class="font-medium mb-1">What happens when you join:</p>
					<ul class="space-y-1 list-disc list-inside">
						<li>You can add items to the shared basket</li>
						<li>You can only edit items you add yourself</li>
						<li>Each person pays for their own items (unless owner uses wallet)</li>
					</ul>
				</div>
			</form>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
