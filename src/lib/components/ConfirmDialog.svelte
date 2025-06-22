<script lang="ts">
	import { Dialog, Button } from 'bits-ui'
	import Elements from './Elements.svelte'

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
			class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80"
		/>
		<Dialog.Content
			class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] rounded-xl border border-gray-200 bg-gray-100 p-6 shadow-xl outline-none sm:max-w-[500px] md:w-full dark:border-gray-700 dark:bg-gray-800"
		>
			<Elements num={1}/>
			<div class="relative z-10">
				<Dialog.Title class="text-center text-xl font-semibold">
					{title}
				</Dialog.Title>

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
								? 'bg-red-500 hover:bg-red-600'
								: 'bg-green-600 hover:bg-green-700'}"
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
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
