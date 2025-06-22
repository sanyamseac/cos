<script lang="ts">
	import { invalidateAll } from '$app/navigation'
	import { Button } from 'bits-ui'
	import { RefreshCcw } from 'lucide-svelte'
</script>

<div class="flex items-center justify-between pb-4">
    <h1
        class="text-4xl font-sensation text-gray-800 dark:text-white sm:text-5xl md:text-6xl"
    >
        menu
    </h1>
    <Button.Root
        class="px-2 cursor-pointer"
        onclick={() => invalidateAll()}
    >
        <RefreshCcw class="ml-3 mt-0.5 h-7 w-7" />
    </Button.Root>
</div>
