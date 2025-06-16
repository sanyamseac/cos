<script lang="ts">
	import { Dialog } from 'bits-ui'
	import { Button } from 'bits-ui'
	import { Copy, Share2, X } from 'lucide-svelte'
	import { browser } from '$app/environment'
	import { enhance } from '$app/forms'

	let {
		open = $bindable(false),
		canteens = [],
	}: {
		open: boolean
		canteens: any[]
	} = $props()

	let loading = $state(false)
	let copied = $state(false)
	let error = $state('')
	let accessCode = $state('')

	const shareUrl = $derived(
		browser && accessCode ? `${window.location.origin}/basket/join?code=${accessCode}` : ''
	)

	async function copyToClipboard() {
		if (!browser || !shareUrl) return
		
		try {
			await navigator.clipboard.writeText(shareUrl)
			copied = true
			setTimeout(() => {
				copied = false
			}, 2000)
		} catch (err) {
			console.error('Failed to copy:', err)
		}
	}

	async function shareNative() {
		if (!browser || !shareUrl) return
		
		if (navigator.share) {
			try {
				await navigator.share({
					title: 'Join my basket',
					text: 'Join my canteen basket to order together!',
					url: shareUrl,
				})
			} catch (err) {
				console.error('Failed to share:', err)
			}
		} else {
			copyToClipboard()
		}
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
					Share Basket
				</Dialog.Title>
				<Dialog.Close class="rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-700">
					<X size={20} class="text-gray-500" />
				</Dialog.Close>
			</div>

			{#if !accessCode}
				<div class="space-y-4">
					<p class="text-sm text-gray-600 dark:text-gray-300">
						Choose a canteen to share your basket with others.
					</p>
					
					<div class="space-y-2">
						{#if canteens.length > 0}
							{#each canteens as canteen}
								<form 
									method="POST" 
									action="?/shareBasket"
									use:enhance={() => {
										loading = true
										error = ''
										return async ({ result, update }) => {
											loading = false
											if (result.type === 'success' && result.data?.accessCode) {
												accessCode = result.data.accessCode
											} else if (result.type === 'failure') {
												error = result.data?.message || 'Failed to share basket'
											}
											await update()
										}
									}}
								>
									<input type="hidden" name="canteenId" value={canteen.id} />
									<Button.Root
										type="submit"
										class="w-full p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
										disabled={loading}
									>
										<div class="flex items-center justify-between">
											<span class="font-medium text-gray-900 dark:text-white">{canteen.name || 'Unknown Canteen'}</span>
											{#if loading}
												<div class="animate-spin rounded-full h-4 w-4 border-2 border-indigo-600 border-t-transparent"></div>
											{/if}
										</div>
									</Button.Root>
								</form>
							{/each}
						{:else}
							<div class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
								No canteens available to share.
							</div>
						{/if}
					</div>

					{#if error}
						<div class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
							<p class="text-red-700 dark:text-red-300 text-sm">{error}</p>
						</div>
					{/if}
				</div>
			{:else}
				<div class="space-y-4">
					<div class="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
						<p class="text-green-800 dark:text-green-200 text-sm font-medium mb-2">
							Basket sharing enabled!
						</p>
						<p class="text-green-700 dark:text-green-300 text-sm">
							Share this code or link with others to let them join your basket.
						</p>
					</div>

					<div class="space-y-3">
						<div>
							<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Access Code
							</label>
							<div class="flex items-center gap-2">
								<div class="flex-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border font-mono text-lg text-center tracking-wider">
									{accessCode}
								</div>
								<Button.Root
									class="p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
									onclick={copyToClipboard}
								>
									<Copy size={16} />
								</Button.Root>
							</div>
							{#if copied}
								<p class="text-green-600 text-xs mt-1">Copied to clipboard!</p>
							{/if}
						</div>

						<div>
							<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Share Link
							</label>
							<div class="flex items-center gap-2">
								<div class="flex-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border text-sm break-all">
									{shareUrl}
								</div>
								<Button.Root
									class="p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
									onclick={shareNative}
								>
									<Share2 size={16} />
								</Button.Root>
							</div>
						</div>
					</div>

					<div class="text-xs text-gray-500 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
						<p class="font-medium mb-1">Important Notes:</p>
						<ul class="space-y-1 list-disc list-inside">
							<li>Access expires in 24 hours</li>
							<li>Members can only edit items they add</li>
							<li>You'll pay for all items if using wallet payment</li>
						</ul>
					</div>
				</div>
			{/if}
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>