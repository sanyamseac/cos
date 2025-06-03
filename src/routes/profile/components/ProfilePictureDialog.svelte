<script lang="ts">
	import { Button, Dialog } from 'bits-ui'
	import { User, Save, X, Upload } from 'lucide-svelte'

	interface Props {
		open: boolean
		currentProfilePic?: string | null
		userName?: string
		userEmail?: string
		onSave: (profilePicUrl: string) => void
	}

	let {
		open = $bindable(),
		currentProfilePic,
		userName = 'User',
		userEmail = '',
		onSave,
	}: Props = $props()

	let selectedAvatarIndex = $state(-1)
	let uploadedImage = $state<string | null>(null)
	let fileInput: HTMLInputElement

	// Available SVG avatars
	const avatarUrls = Array.from({ length: 8 }, (_, i) => `/content/avatars/avatar-${i + 1}.svg`)

	function handleFileUpload(event: Event) {
		const target = event.target as HTMLInputElement
		const file = target.files?.[0]
		if (file) {
			const reader = new FileReader()
			reader.onload = (e) => {
				uploadedImage = e.target?.result as string
				selectedAvatarIndex = -1 // Reset avatar selection when file is uploaded
			}
			reader.readAsDataURL(file)
		}
	}

	function selectAvatar(index: number) {
		selectedAvatarIndex = index
		uploadedImage = null // Reset uploaded image when avatar is selected
		if (fileInput) {
			fileInput.value = '' // Clear file input
		}
	}

	function handleSave() {
		let profilePicUrl: string

		if (uploadedImage) {
			profilePicUrl = uploadedImage
		} else if (selectedAvatarIndex >= 0) {
			profilePicUrl = avatarUrls[selectedAvatarIndex]
		} else {
			profilePicUrl = currentProfilePic || '/content/avatars/avatar-1.svg'
		}

		onSave(profilePicUrl)
		open = false
	}

	function handleClose() {
		open = false
		// Reset state when closing
		selectedAvatarIndex = -1
		uploadedImage = null
		if (fileInput) {
			fileInput.value = ''
		}
	}
	// Compute the preview image
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

				<!-- Profile Info Preview -->
				<div class="w-full rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
					<div class="flex items-center gap-3">
						<div
							class="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700"
						>
							{#if previewImage()}
								<img
									src={previewImage()}
									alt="Preview"
									class="h-full w-full object-cover"
								/>
							{:else}
								<User class="h-6 w-6 text-gray-500 dark:text-gray-400" />
							{/if}
						</div>
						<div class="flex flex-col">
							<h3 class="text-base font-semibold text-gray-800 dark:text-white">
								{userName}
							</h3>
							{#if userEmail}
								<p class="text-sm text-gray-600 dark:text-gray-400">{userEmail}</p>
							{/if}
						</div>
					</div>
				</div>

				<!-- Upload Custom Picture -->
				<div class="w-full space-y-3">
					<h4 class="text-sm font-medium text-gray-800 dark:text-white">
						Upload Custom Picture
					</h4>
					<div class="flex flex-col gap-2">
						<input
							bind:this={fileInput}
							id="profilePic"
							type="file"
							accept="image/*"
							onchange={handleFileUpload}
							class="block w-full rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-500 file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-indigo-500 file:to-purple-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:from-indigo-600 hover:file:to-purple-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
						/>
						<div class="text-xs text-gray-500 dark:text-gray-400">
							Supports JPG, PNG, GIF up to 5MB
						</div>
					</div>
				</div>

				<!-- Avatar Options -->
				<div class="w-full space-y-3">
					<h4 class="text-sm font-medium text-gray-800 dark:text-white">
						Or choose a default avatar:
					</h4>
					<div class="grid grid-cols-4 gap-3">
						{#each avatarUrls as avatarUrl, i}
							<button
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
							</button>
						{/each}
					</div>
				</div>
			</div>
			<!-- Action Buttons -->
			<div class="mt-6 flex w-full justify-end gap-3">
				<Button.Root
					onclick={handleClose}
					class="border border-gray-200 bg-white px-6 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
				>
					Cancel
				</Button.Root>
				<Button.Root
					onclick={handleSave}
					class="rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-2 font-semibold text-white shadow-lg transition-all duration-300 hover:from-indigo-600 hover:to-purple-700 hover:shadow-xl"
				>
					<Save class="mr-2 h-4 w-4" />
					Save Changes
				</Button.Root>
			</div>

			<!-- Close Button -->
			<button
				onclick={handleClose}
				class="absolute top-4 right-4 rounded-md p-1 transition-colors hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:outline-none active:scale-[0.98] dark:hover:bg-gray-700 dark:focus-visible:ring-offset-gray-800"
			>
				<X class="h-5 w-5 text-gray-500 dark:text-gray-400" />
				<span class="sr-only">Close</span>
			</button>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
