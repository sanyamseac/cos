<script lang="ts">
	import { Dialog } from 'bits-ui'
	import { Button } from 'bits-ui'
	import { Copy, Share2, X } from 'lucide-svelte'
	import { browser } from '$app/environment'
	import { enhance } from '$app/forms'
	import Elements from '$lib/components/Elements.svelte'
	

	let {
		open = $bindable(false),
		accessCode,
		canteenName,
		error,
	}: {
		open: boolean
		accessCode: string
		canteenName: string
		error: string
	} = $props()

	let copied = $state(false)

	const shareUrl = $derived(
		browser && accessCode ? `${window.location.origin}/basket/join?code=${accessCode}` : '',
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
		<Dialog.Overlay
			class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-40 bg-black/80"
		/>
		<Dialog.Content
			class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] rounded-xl border border-gray-200 bg-gray-100 p-6 shadow-xl outline-none sm:max-w-[500px] md:w-full dark:border-gray-700 dark:bg-gray-800"
		>
			<Elements num={1}/>
				<div class="relative z-10">
				<div class="mb-12 flex items-center justify-between">
					<Dialog.Title class="text-lg font-semibold text-gray-900 dark:text-white">
						Share {canteenName} Basket
					</Dialog.Title>
					<Dialog.Close class="rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
						<X size={30} class="text-gray-400" />
					</Dialog.Close>
				</div>

				{#if error}
					<div
						class="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20"
					>
						<p class="text-sm text-red-700 dark:text-red-300">{error}</p>
					</div>
				{:else}
					<div class="space-y-4">

						<div class="space-y-3">
							<div class="flex items-center justify-between">
								<label
									class="block text-lg font-medium text-gray-700 dark:text-gray-300"
								>
									Access Code
								</label>
								<div
									class="block text-xl font-mono text-gray-700 dark:text-gray-300"
								>
									{accessCode}
								</div>
							</div>
							<div class="flex items-center justify-between">
								<div class="block text-lg font-medium text-gray-700 dark:text-gray-300">
									Invite
								</div>
								<div class="flex items-center gap-2">
									<Button.Root
										class="rounded-lg p-3 transition-colors"
										onclick={shareNative}
									>
										<Share2 size={24} />
									</Button.Root>
									<Button.Root
										class="rounded-lg p-3 transition-colors"
										onclick={copyToClipboard}
									>
										<Copy size={24} />
									</Button.Root>
								</div>
							</div>
							{#if copied}
								<p class="mt-1 text-xs text-green-600">Copied to clipboard!</p>
							{/if}
						</div>

						<div
							class="rounded-lg text-xs text-gray-600 dark:text-gray-400"
						>
							<p class="mb-1 font-medium">Important Notes:</p>
							<ul class="list-inside list-disc space-y-1">
								<li>Anyone with the access code can join the basket</li>
								<li>Sharing will be active until next order unless deactivated</li>
								<li>Members can only edit items they add</li>
								<li>Member ordering pays for all items if using wallet payment</li>
							</ul>
						</div>
					</div>
				{/if}
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>