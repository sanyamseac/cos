<script lang="ts">
	import { Dialog, Button } from 'bits-ui'
	import { X } from 'lucide-svelte'

	interface Props {
		open: boolean
		title: string
		description?: string
		onClose: () => void
		onConfirm: () => void
		confirmText?: string
		cancelText?: string
		variant?: 'danger' | 'primary'
		loading?: boolean
	}

	let {
		open = $bindable(),
		title,
		description,
		onClose,
		onConfirm,
		confirmText = 'Confirm',
		cancelText = 'Cancel',
		variant = 'primary',
		loading = false,
	}: Props = $props()
</script>

<Dialog.Root bind:open>
	<Dialog.Portal>
		<Dialog.Overlay
			class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
		/>
		<Dialog.Content
			class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:scale-out data-[state=open]:scale-in fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-gray-200 bg-white p-0 shadow-xl dark:border-gray-700 dark:bg-gray-800"
		>
			<!-- Header with gradient background -->
			<div
				class="border-b border-gray-100 bg-gradient-to-r {variant === 'danger'
					? 'from-red-500 to-pink-600'
					: 'from-indigo-500 to-purple-600'} p-5 dark:border-gray-700"
			>
				<Dialog.Title class="text-center text-xl font-semibold text-white">
					{title}
				</Dialog.Title>
			</div>

			<div class="p-6">
				{#if description}
					<Dialog.Description class="mb-6 text-center text-gray-600 dark:text-gray-400">
						{description}
					</Dialog.Description>
				{/if}

				<div class="flex gap-3 pt-4">
					<Button.Root
						onclick={onConfirm}
						disabled={loading}
						class="flex-1 items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-md transition-all focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 {variant ===
						'danger'
							? 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 focus:ring-red-500'
							: 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 focus:ring-indigo-500'}"
					>
						{#if loading}
							<div
								class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
							></div>
						{/if}
						{confirmText}
					</Button.Root>
					<Button.Root
						onclick={onClose}
						disabled={loading}
						class="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
					>
						{cancelText}
					</Button.Root>
				</div>
			</div>

			<Dialog.Close
				onclick={onClose}
				class="absolute top-4 right-4 rounded-full bg-white/20 p-1 opacity-70 backdrop-blur-sm transition-all hover:opacity-100 focus:ring-2 focus:ring-white focus-visible:outline-none"
			>
				<X class="h-4 w-4 text-white" />
				<span class="sr-only">Close</span>
			</Dialog.Close>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
