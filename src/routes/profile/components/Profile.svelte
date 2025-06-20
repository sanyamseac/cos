<script lang="ts">
	import { Button, Avatar } from 'bits-ui'
	import { User, Pencil } from 'lucide-svelte'

	let { data, isEditingPic = $bindable() }: { data: any; isEditingPic: any } = $props()
</script>

<div class="flex flex-col gap-4">
    <div class="relative flex items-center">
        <Avatar.Root class="h-25 w-25">
            <div class="flex h-full w-full items-center justify-center relative">
                <Avatar.Image
                    src={data.user.profilePicture || undefined}
                    alt="Profile picture"
                    class="h-full w-full rounded-xl object-cover"
                />
                <Avatar.Fallback
                    class="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
                >
                    <User />

                </Avatar.Fallback>
                <Button.Root
                    class="absolute -right-2 -bottom-2 flex h-6 w-6 items-center justify-center rounded-md bg-green-600 transition-colors hover:bg-green-700"
                    onclick={() => (isEditingPic = true)}
                >
                    <Pencil class="h-3 w-3 text-white" />
                </Button.Root>
            </div>
        </Avatar.Root>
    </div>
    <div class="">
        <h2 class="text-3xl font-bold text-gray-800 dark:text-gray-200">
            {data.user.name}
        </h2>
        <div class="mt-1">
            <p class="text-xs font-alt text-gray-600 dark:text-gray-400">
                {data.user.email}
            </p>
            {#if (data.user.role !== 'consumer')}
                <p class="text-xs font-alt text-gray-600 dark:text-gray-400">
                    {data.user.role}
                </p>
            {/if}
        </div>
    </div>
</div>