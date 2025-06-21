<script>
	import { ChartNoAxesColumn } from "lucide-svelte"
	import Greeting from "./Greeting.svelte"
	import { Button } from "bits-ui"
	import { goto } from "$app/navigation"

    let { user } = $props()
</script>
<div class="flex-row">
    <div class="flex items-center justify-between pb-4">
        <div>
            <h1
                class="text-4xl font-sensation text-gray-800 dark:text-white sm:text-5xl md:text-6xl"
            >
                dashboard
            </h1>
        </div>
        <div>
            <Button.Root
                class="px-2"
                onclick={() => goto('/leaderboard')}
            >
                <ChartNoAxesColumn class="ml-3 mt-0.5 h-7 w-7" />
            </Button.Root>
        </div>
    </div>
    <Greeting
            userName={user.name}
            class="text-lg text-gray-700 dark:text-gray-500"
        />
</div>