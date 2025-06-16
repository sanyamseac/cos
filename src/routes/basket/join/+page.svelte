<script lang="ts">
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

<div
	class="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
>
	<div class="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-800">
		<div class="mb-6 text-center">
			<h1 class="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Join Basket</h1>
			<p class="text-gray-600 dark:text-gray-300">
				Enter the access code to join a shared basket
			</p>
		</div>

		<form method="POST" action="?/joinBasket" use:enhance={handleSubmit}>
			<div class="mb-4">
				<label
					for="accessCode"
					class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
				>
					Access Code
				</label>
				<input
					type="text"
					id="accessCode"
					name="accessCode"
					value={data.code || ''}
					maxlength="8"
					pattern="[A-Z0-9]&#123;8&#125;"
					class="w-full rounded-lg border border-gray-300 px-4 py-3 text-center font-mono text-lg tracking-wider uppercase focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					placeholder="XXXXXXXX"
					required
				/>
			</div>

			{#if error}
				<div
					class="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20"
				>
					<p class="text-sm text-red-700 dark:text-red-300">{error}</p>
				</div>
			{/if}

			{#if success}
				<div
					class="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20"
				>
					<p class="text-sm text-green-700 dark:text-green-300">{success}</p>
				</div>
			{/if}

			<div class="flex gap-3">
				<Button.Root
					type="button"
					class="flex-1 rounded-lg bg-gray-100 px-4 py-3 text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
					onclick={() => goto('/basket')}
				>
					Cancel
				</Button.Root>
				<Button.Root
					type="submit"
					class="flex-1 rounded-lg bg-indigo-600 px-4 py-3 text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
					disabled={loading}
				>
					{loading ? 'Joining...' : 'Join Basket'}
				</Button.Root>
			</div>
		</form>
	</div>
</div>
