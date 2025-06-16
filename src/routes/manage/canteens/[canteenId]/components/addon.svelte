<script lang="ts">
	import CrudModal from '$lib/components/CrudModal.svelte'
	import FoodType from '$lib/components/FoodType.svelte'
    import { Button } from 'bits-ui';
    import { Plus, Edit } from 'lucide-svelte';

    let { item } = $props();

    let crudModalValues = $state({
		show: false,
		entity: '',
		editing: false,
		item: null as any,
	})

	function getFoodTypeIcon(type: string) {
		if (type === 'veg') return '🟢'
		if (type === 'non-veg') return '🔴'
		if (type === 'egg') return '🟠'
		return ''
	}

	function openCrudModal(entity: string, editing = true, item: any = null) {
		crudModalValues.entity = entity
		crudModalValues.editing = editing
		crudModalValues.item = item
		crudModalValues.show = true
	}

	function closeCrudModal() {
		crudModalValues.show = false
		crudModalValues.entity = ''
		crudModalValues.editing = false
		crudModalValues.item = null
	}

    let addonFields = $derived([
        {
            name: 'itemId',
            label: 'Item ID',
            type: 'hidden' as const,
            value: (crudModalValues.item?.itemId || crudModalValues.item?.id)?.toString() || '',
        },
        {
            name: 'name',
            label: 'Name',
            type: 'text' as const,
            required: true,
            placeholder: 'Enter addon name',
        },
        {
            name: 'price',
            label: 'Price',
            type: 'number' as const,
            required: true,
            step: '0.01',
            placeholder: '0.00',
        },
        {
            name: 'type',
            label: 'Food Type',
            type: 'select' as const,
            required: true,
            options: [
                { value: 'veg', label: 'Vegetarian' },
                { value: 'non-veg', label: 'Non-Vegetarian' },
                { value: 'egg', label: 'Contains Egg' },
            ],
        },
        {
            name: 'available',
            label: 'Available',
            type: 'switch' as const,
            value: crudModalValues.editing ? crudModalValues.item?.available : true,
        },
        {
            name: 'active',
            label: 'Active',
            type: 'switch' as const,
            value: crudModalValues.editing ? crudModalValues.item?.active : true,
        },
    ])
</script>
<div>
    <div class="mb-3 flex items-center justify-between">
        <h4
            class="font-medium text-gray-700 dark:text-gray-300"
        >
            Addons
        </h4>
        <Button.Root
            onclick={() =>
                openCrudModal('addon', false, {
                    itemId: item.id,
                })}
            class="flex items-center gap-1 rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-700 transition-all hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800"
        >
            <Plus size={12} />
            Add Addon
        </Button.Root>
    </div>
    {#if item.addons && item.addons.length > 0}
        <div class="space-y-2">
            {#each item.addons as addon}
                <div
                    class="flex items-center justify-between rounded-md bg-gray-50 p-2 dark:bg-gray-700"
                >
                    <div class="flex items-center gap-2">
                        <FoodType 
                            type={addon.type}
                            size={16} />
                        <span class="text-sm font-medium"
                            >{addon.name}</span
                        >
                        <span class="text-sm text-green-600"
                            >₹{addon.price}</span
                        >
                        <div class="flex gap-1">
                            {#if !addon.active}
                                <span
                                    class="inline-block rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200"
                                >
                                    Inactive
                                </span>
                            {/if}
                            {#if !addon.available}
                                <span
                                    class="inline-block rounded-full bg-orange-100 px-1.5 py-0.5 text-xs font-medium text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                                >
                                    Unavailable
                                </span>
                            {/if}
                        </div>
                    </div>
                    <Button.Root
                        onclick={() =>
                            openCrudModal(
                                'addon',
                                true,
                                addon,
                            )}
                        class="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                    >
                        <Edit size={12} />
                    </Button.Root>
                </div>
            {/each}
        </div>
    {:else}
        <p class="text-sm text-gray-500 dark:text-gray-400">
            No addons configured
        </p>
    {/if}

    <CrudModal
		bind:open={crudModalValues.show}
		editing={crudModalValues.editing}
		entityName={crudModalValues.entity}
		item={crudModalValues.item}
		fields={addonFields}
		addAction='?/addAddon'
		updateAction='?/updateAddon'
		onClose={closeCrudModal}
	/>
</div>