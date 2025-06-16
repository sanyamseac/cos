<script lang="ts">
	import { page } from '$app/stores'
	import { enhance } from '$app/forms'
	import { Button } from 'bits-ui'
	import { goto } from '$app/navigation'
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()

	let loading = $state(false)
	let error = $state('')
	let success = $state('')

	function handleSubmit() {
		return async ({ result }: any) => {
			loading = false
			if (result.type === 'success') {
				success = result.data?.message || 'Successfully joined basket!'
				error = ''
				setTimeout(() => {
					goto('/basket')
				}, 1000)
			} else if (result.type === 'failure') {
				error = result.data?.error || 'Failed to join basket'
				success = ''
			}
		}
	}
</script>

<svelte:head>
	<title>Join Basket - IIIT Canteen Ordering System</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
	<div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md">
		<div class="text-center mb-6">
			<h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Join Basket</h1>
			<p class="text-gray-600 dark:text-gray-300">Enter the access code to join a shared basket</p>
		</div>

		<form method="POST" action="?/joinBasket" use:enhance={handleSubmit}>
			<div class="mb-4">
				<label for="accessCode" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
					Access Code
				</label>
				<input
					type="text"
					id="accessCode"
					name="accessCode"
					value={data.code || ''}
					maxlength="8"
					pattern="[A-Z0-9]&#123;8&#125;"
					class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-center text-lg font-mono tracking-wider uppercase"
					placeholder="XXXXXXXX"
					required
				/>
			</div>

			{#if error}
				<div class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
					<p class="text-red-700 dark:text-red-300 text-sm">{error}</p>
				</div>
			{/if}

			{#if success}
				<div class="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
					<p class="text-green-700 dark:text-green-300 text-sm">{success}</p>
				</div>
			{/if}

			<div class="flex gap-3">
				<Button.Root
					type="button"
					class="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
					onclick={() => goto('/basket')}
				>
					Cancel
				</Button.Root>
				<Button.Root
					type="submit"
					class="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					disabled={loading}
				>
					{loading ? 'Joining...' : 'Join Basket'}
				</Button.Root>
			</div>
		</form>
	</div>
</div>
