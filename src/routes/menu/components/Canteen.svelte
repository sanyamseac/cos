<script lang="ts">
    import { goto } from '$app/navigation';
    import { ChefHat, Clock } from 'lucide-svelte';

    let { canteen } = $props();
</script>
<div
    class="group cursor-pointer overflow-hidden border-b transition-all duration-300 hover:scale-[1.02] hover:shadow-xl dark:border-gray-700 {canteen.open ? '' : 'opacity-50 pointer-events-none'}"
    onclick={() => canteen.open && goto(`/menu/${canteen.acronym}`)}
>
    <div class="flex items-center justify-between gap-3 py-3">
        <div class="flex items-center gap-4">
            <img
                src={canteen.image}
                alt={canteen.name}
                class="h-12 w-12 rounded-xl"
            />
            <div>
                <h3
                    class="flex items-center gap-1 text-xl font-bold text-gray-900 transition-colors group-hover:text-green-600 dark:text-white dark:group-hover:text-green-400"
                >
                    {canteen.name}
                    <span class="text-sm"> {canteen.open
                        ? ''
                        : ' (Closed)'}
                    </span>
                </h3>
                <div
                    class="text-sm text-gray-500 dark:text-gray-400"
                >
                    <span>{canteen.timings}</span>
                </div>
                {#if canteen.description}
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                        {canteen.description}
                    </p>
                {/if}
            </div>
        </div>
    </div>
</div>