<script>
	import { goto } from "$app/navigation"
	import { Button } from "bits-ui"
	import { ReceiptIndianRupee } from "lucide-svelte"
</script>

<div class="text-center">
    <ReceiptIndianRupee size={50} class="text-gray-400 mx-auto mt-16 mb-8" />
    <h2 class="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Your basket is empty</h2>
    <Button.Root
        class="w-full rounded-lg py-3 border font-medium text-white transition-all shadow-sm hover:shadow-lg"
        onclick={() => goto('/menu')}
    >
        Browse Menu
    </Button.Root>
</div>