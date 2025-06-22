<script lang="ts">
	import { enhance } from "$app/forms"
	import { Button } from "bits-ui"
	import { LogOut } from "lucide-svelte"
    import ConfirmDialog from "$lib/components/ConfirmDialog.svelte"

    let showConfirm = $state(false)
    let formRef: HTMLFormElement | null = $state(null)
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
        <form bind:this={formRef} method="post" action="login?/logout" use:enhance>
        </form>
        <Button.Root
                type="normal"
                onclick={() => showConfirm = true}
                class="px-2"
            >
            <LogOut class="ml-3 mt-0.5 h-7 w-7" />
        </Button.Root>
    </div>
</div>

<ConfirmDialog
    bind:open={showConfirm}
    variant="danger"
    title="Logout"
    description="Are you sure you want to logout?"
    confirmText="Logout"
    cancelText="Cancel"
    onConfirm={() => {
        if (formRef) formRef.requestSubmit()
        showConfirm = false
    }}
    onClose={() => showConfirm = false}
/>