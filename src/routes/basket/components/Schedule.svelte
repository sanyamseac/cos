<script lang="ts">
	import { Dialog } from 'bits-ui'
	import { Button } from 'bits-ui'
	import { X } from 'lucide-svelte'
	import Elements from '$lib/components/Elements.svelte'
	import TimePicker from './TimePicker.svelte'

	let { open = $bindable(false), value = $bindable(Date.now())}: { open: boolean, value: number, } = $props()
	let valid = $state(true)
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
				<Dialog.Title class="text-xl mb-10 text-center font-semibold text-gray-900 dark:text-white">
					Schedule Order
				</Dialog.Title>
				<TimePicker bind:value bind:valid/>

				<div class="flex gap-3 pt-7">
					<Button.Root
						type="button"
						class="flex-1 rounded-lg bg-gray-100 px-4 py-3 text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
						onclick={() => {value = -1; open = false}}
					>
						Cancel
					</Button.Root>
					<Button.Root
						type="submit"
						disabled={!valid}
						class="flex-1 rounded-lg bg-green-600 px-4 py-3 text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
						onclick={() => {
							open = false
						}}
					>
					Schedule
					</Button.Root>
				</div>
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
