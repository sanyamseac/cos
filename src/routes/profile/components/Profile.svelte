<script lang="ts">
	import { Button, Avatar } from 'bits-ui'
	import { User, Mail, Shield, Camera } from 'lucide-svelte'

	let { data, isEditingPic = $bindable() }: { data: any; isEditingPic: any } = $props()
</script>

<div
	class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
>
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-5">
			<div class="relative">
				<Avatar.Root class="h-20 w-20">
					<Avatar.Image
						src={data.user.profilePicture || undefined}
						alt="Profile picture"
						class="h-full w-full rounded-full object-cover"
					/>
					<Avatar.Fallback
						class="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
					>
						<User class="h-10 w-10" />
					</Avatar.Fallback>
				</Avatar.Root>
				<Button.Root
					class="absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 transition-colors hover:bg-blue-600"
					onclick={() => (isEditingPic = true)}
				>
					<Camera class="h-3 w-3 text-white" />
				</Button.Root>
			</div>
			<div class="mt-2 flex flex-col">
				<h2 class="text-2xl font-bold text-gray-800 dark:text-white">
					{data.user.name}
				</h2>
				<div class="mt-1">
					<p class="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
						<Mail class="h-3 w-3" />
						{data.user.email}
					</p>
					<p class="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
						<Shield class="h-3 w-3" />
						{data.user.role}
					</p>
				</div>
			</div>
		</div>
	</div>
</div>
