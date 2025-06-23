<script lang="ts">
	import { Clock, CheckCircle, XCircle, Package, Receipt, ReceiptIndianRupee } from "lucide-svelte"
	import { ShoppingBag } from "phosphor-svelte"

    let { status, size = 16, class: className }: { status: string; size?:number; class?: string } = $props();
</script>
<div class={className}>
    {#if status === 'pending'}
        <Clock {size}/>
    {:else if status === 'confirmed'}
        <CheckCircle {size}/>
    {:else if status === 'preparing'}
        <Package {size}/>
    {:else if status === 'ready'}
        <ShoppingBag {size}/>
    {:else if status === 'completed'}
        <ReceiptIndianRupee {size}/>
    {:else if status === 'cancelled'}
        <XCircle {size}/>
    {/if}
</div>