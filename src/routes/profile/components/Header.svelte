<script>
	import { enhance } from "$app/forms"
	import { Button } from "bits-ui"
	import { LogOut } from "lucide-svelte"
</script>
<div class="flex items-center justify-between pb-4">
    <div>
        <h1
            class="text-4xl font-sensation text-gray-800 dark:text-white sm:text-5xl md:text-6xl"
        >
            profile
        </h1>
    </div>
    <div>
        <form method="post" action="login?/logout" use:enhance>
            <Button.Root
                class="px-2"
            >
                <LogOut class="ml-3 mt-0.5 h-7 w-7" />
            </Button.Root>
        </form>
    </div>
</div>