<script lang="ts">
	import { enhance } from "$app/forms"
	import { goto, invalidateAll } from "$app/navigation"
	import ConfirmDialog from "$lib/components/ConfirmDialog.svelte"
	import { Button } from "bits-ui"
	import { ChevronLeft, Trash } from "lucide-svelte"

    let { order } = $props()
    let cancelDialogOpen = $state(false)
	let cancelLoading = $state(false)
	let cancelError = $state('')
	let formRef: HTMLFormElement | null = $state(null)

    async function handleCancelOrder() {
		cancelLoading = true
		if (formRef) formRef.requestSubmit()
	}
</script>
<div class="flex items-center pb-8 justify-between">
    <div>
        <h1
            class="text-4xl font-sensation text-gray-800 dark:text-white sm:text-5xl md:text-6xl"
        >
            {order?.orderNumber || 'Loading...'}
        </h1>
    </div>
    {#if order.status !== 'completed' && order.status !== 'cancelled'}
        <div class="mb-4 flex justify-end">
            <form bind:this={formRef} method="POST" action="?/cancelOrder" use:enhance={() => {
                return async ({ result }) => {
                    if (result.type === 'success') invalidateAll()
                    else cancelError = 'Failed to cancel order';
                    cancelLoading = false;
                }
            }}>
            </form>
            <Button.Root
                class="px-2"
                onclick={() => (cancelDialogOpen = true)}
                aria-label="Cancel Order"
            >
                <Trash class="ml-3 mt-0.5 h-7 w-7"/>
            </Button.Root>
        </div>
    {/if}
</div>

<ConfirmDialog
	bind:open={cancelDialogOpen}
	title="Cancel Order"
	description="Are you sure you want to cancel this order? You will be charged 100% as cancellation fee."
	variant="danger"
	confirmText="Yes, Cancel"
	cancelText="No, Go Back"
	onConfirm={handleCancelOrder}
	onClose={() => (cancelDialogOpen = false)}
	loading={cancelLoading}
/>