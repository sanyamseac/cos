<script lang="ts">
	import { enhance } from '$app/forms'
	import { invalidateAll } from '$app/navigation'
	import { Button, Dialog } from 'bits-ui'
	import { User } from 'lucide-svelte'

	interface Props {
		open: boolean
		currentProfilePic?: string | null
	}

	let {
		open = $bindable(),
		currentProfilePic,
	}: Props = $props()

	let selectedAvatarIndex = $state(-1)
	let uploadedImage = $state<string | null>(null)
	let fileInput: HTMLInputElement

	const avatarUrls = Array.from({ length: 8 }, (_, i) => `/avatars/avatar-${i + 1}.svg`)

	function handleFileUpload(event: Event) {
		const target = event.target as HTMLInputElement
		const file = target.files?.[0]
		if (file) {
			const reader = new FileReader()
			reader.onload = (e) => {
				uploadedImage = e.target?.result as string
				selectedAvatarIndex = -1
			}
			reader.readAsDataURL(file)
		}
	}

	function selectAvatar(index: number) {
		selectedAvatarIndex = index
		uploadedImage = null
		if (fileInput) {
			fileInput.value = ''
		}
	}

	function handleSave() {
		return async ({ result }) => {
			open = false
			await invalidateAll()
		}
	}

	function handleClose() {
		open = false
		selectedAvatarIndex = -1
		uploadedImage = null
		if (fileInput) {
			fileInput.value = ''
		}
	}

	const previewImage = $derived(() => {
		if (uploadedImage) return uploadedImage
		if (selectedAvatarIndex >= 0) return avatarUrls[selectedAvatarIndex]
		return currentProfilePic
	})
</script>

<Dialog.Root bind:open>
	<Dialog.Portal>
		<Dialog.Overlay
			class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80"
		/>
		<Dialog.Content
			class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] rounded-xl border border-gray-200 bg-white p-6 shadow-xl outline-none sm:max-w-[500px] md:w-full dark:border-gray-700 dark:bg-gray-800"
		>
			<Dialog.Title
				class="mb-2 flex w-full items-center justify-center text-xl font-semibold tracking-tight text-gray-800 dark:text-white"
			>
				Update Profile Picture
			</Dialog.Title>
			<Dialog.Description class="mb-6 text-center text-sm text-gray-600 dark:text-gray-400">
				Upload a new profile picture or choose from the options below.
			</Dialog.Description>

			<div class="flex flex-col items-center gap-6 py-4">
				<!-- Current vs Preview Section -->
				<div class="grid w-full grid-cols-2 gap-6">
					<!-- Current Picture -->
					<div class="flex flex-col items-center gap-3">
						<h4 class="text-sm font-medium text-gray-800 dark:text-white">Current</h4>
						<div
							class="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700"
						>
							{#if currentProfilePic}
								<img
									src={currentProfilePic}
									alt="Current profile"
									class="h-full w-full object-cover"
								/>
							{:else}
								<User class="h-10 w-10 text-gray-500 dark:text-gray-400" />
							{/if}
						</div>
					</div>

					<!-- Preview -->
					<div class="flex flex-col items-center gap-3">
						<h4 class="text-sm font-medium text-gray-800 dark:text-white">Preview</h4>
						<div
							class="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700"
						>
							{#if previewImage()}
								<img
									src={previewImage()}
									alt="Preview"
									class="h-full w-full object-cover"
								/>
							{:else}
								<User class="h-10 w-10 text-gray-500 dark:text-gray-400" />
							{/if}
						</div>
					</div>
				</div>

				<div class="flex flex-col gap-2 w-full">
					<input
						bind:this={fileInput}
						id="profilePic"
						type="file"
						accept="image/*"
						onchange={handleFileUpload}
						class="block w-full rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-500 file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-indigo-500 file:to-purple-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:from-indigo-600 hover:file:to-purple-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
					/>
					<div class="text-xs text-gray-500 dark:text-gray-400">
						Supports JPG, PNG, GIF up to 10MB
					</div>
				</div>

				<div class="flex w-full items-center gap-4">
					<hr class="flex-1 border-gray-200 dark:border-gray-700" />
					<span class="text-sm text-gray-500 dark:text-gray-400">or</span>
					<hr class="flex-1 border-gray-200 dark:border-gray-700" />
				</div>
				<!-- Avatar Options -->
				<div class="w-full space-y-3">
					<h4 class="text-sm font-medium text-gray-800 dark:text-white">
						Choose a default avatar
					</h4>
					<div class="grid grid-cols-4 gap-3">
						{#each avatarUrls as avatarUrl, i}
							<Button.Root
								onclick={() => selectAvatar(i)}
								class="h-14 w-14 overflow-hidden rounded-full ring-2 ring-transparent transition-all duration-200 hover:scale-105 hover:ring-gray-300 dark:hover:ring-gray-600 {selectedAvatarIndex ===
								i
									? 'ring-indigo-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-800'
									: ''}"
							>
								<img
									src={avatarUrl}
									alt="Avatar {i + 1}"
									class="h-full w-full object-cover"
								/>
							</Button.Root>
						{/each}
					</div>
				</div>
			</div>
			<!-- Action Buttons -->
			<div class="mt-6 flex w-full justify-end gap-3">
				<Button.Root
					onclick={handleClose}
					class="rounded-lg border border-gray-200 bg-white px-6 py-2 text-gray-700 shadow hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 hover:shadow-xl"
				>
					Cancel
				</Button.Root>
				<form method="post" action="?/updateProfilePicture" use:enhance={handleSave}>
					<input type="hidden" name="profilePictureUrl" value={previewImage()} />
					<Button.Root
						type="submit"
						class="rounded-lg border bg-green-600 px-6 py-2 font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl"
					>
						Save
					</Button.Root>
				</form>
			</div>

			<!-- Close Button -->
			<Dialog.Close
				onclick={handleClose}
				class="absolute top-4 right-4 rounded-md p-1 transition-colors hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:outline-none active:scale-[0.98] dark:hover:bg-gray-700 dark:focus-visible:ring-offset-gray-800"
			>
				<span class="sr-only">Close</span>
			</Dialog.Close>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
