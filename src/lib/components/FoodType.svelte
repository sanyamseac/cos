<script lang="ts">
	import { Egg, Drumstick, Leaf, ShieldQuestion } from 'lucide-svelte'

	let { type = 'veg', size = 20, class: className = '' } = $props()
</script>

{#if type === 'veg'}
	<Leaf class="text-green-500 {className}" {size} />
{:else if type === 'non-veg'}
	<Drumstick class="text-red-500 {className}" {size} />
{:else if type === 'egg'}
	<Egg class="text-orange-700 {className}" {size} />
{:else}
	<ShieldQuestion class="text-gray-500 {className}" {size} />
{/if}
