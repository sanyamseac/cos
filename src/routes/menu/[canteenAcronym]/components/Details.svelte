<script lang="ts">
    let { data } = $props();
</script>
{#if data.canteen}
    <div class="transform pt-6 transition-all duration-300">
        <div class="flex flex-col md:flex-row md:items-center gap-4">
            <span>{data.canteen.timings}</span>
            <span>{data.canteen.open ? 'Open Now' : 'Closed'}</span>
            <span>Estimated Waiting Time: {Math.ceil(data.canteen.waitingTime + data.canteen.averageCookingTime) /60} mins</span>
        </div>

        {#if data.canteen.description}
            <p class="mt-4">
                {data.canteen.description}
            </p>
        {/if}
    </div>
{:else}
    <div class="text-center">
        <p class="text-lg text-gray-600 dark:text-gray-300">Canteen not found</p>
    </div>
{/if}