<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation'
	import { Button } from 'bits-ui'
	import { ChevronLeft, RefreshCcw } from 'lucide-svelte'

    let { canteen } = $props()
</script>

<div class="flex items-center justify-between pb-4">
    <h1
        class="text-4xl font-sensation text-gray-800 dark:text-white sm:text-5xl md:text-6xl"
    >
        {canteen.name}
    </h1>
    <Button.Root
        class="px-2 cursor-pointer"
        onclick={() => goto('/menu')}
    >
        <ChevronLeft class="ml-3 mb-0.5 h-9 w-9" />
    </Button.Root>
</div>
