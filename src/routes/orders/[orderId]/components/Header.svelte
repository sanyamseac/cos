<script>
	import { goto } from "$app/navigation"
	import { Button } from "bits-ui"
	import { ChevronLeft } from "lucide-svelte"

    let { order } = $props()
</script>
<div class="flex items-center pb-8 justify-between">
    <div>
        <h1
            class="text-4xl font-sensation text-gray-800 dark:text-white sm:text-5xl md:text-6xl"
        >
            {order?.orderNumber || 'Loading...'}
        </h1>
    </div>
    <Button.Root
        class="px-2"
        onclick={() => goto('/orders')}
        >
        <ChevronLeft class="ml-3 mb-0.5 h-9 w-9" />
    </Button.Root>
</div>