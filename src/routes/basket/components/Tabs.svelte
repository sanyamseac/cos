<script lang="ts">
    import CanteenBasket from './canteenBasket.svelte'
	import { tweened } from 'svelte/motion'
	import { cubicOut } from 'svelte/easing'

    let currentTab = $state(0)
	let dragging = $state(false)
	let startX = $state(0)
	let currentX = $state(0)
	let containerEl = $state<HTMLElement>()
	let containerWidth = $state(0)

    let { allItemsGroupedByCanteen, wallets, form } = $props()

	const slideProgress = tweened(0, {
		duration: 300,
		easing: cubicOut
	})

	const numTabs = $derived(allItemsGroupedByCanteen().length)
	
	$effect(() => {
		if (numTabs > 0) {
			slideProgress.set(currentTab)
		}
	})

	function handleTouchStart(e: TouchEvent) {
		if (!containerEl) return
		dragging = true
		startX = e.touches[0].clientX
		currentX = startX
	}

	function handleTouchMove(e: TouchEvent) {
		if (!dragging || !containerEl) return
		e.preventDefault()
		currentX = e.touches[0].clientX
		const deltaX = currentX - startX
		const progress = currentTab - (deltaX / containerWidth)
		const clampedProgress = Math.max(0, Math.min(numTabs - 1, progress))
		slideProgress.set(clampedProgress, { duration: 0 })
	}

	function handleTouchEnd() {
		if (!dragging) return
		dragging = false
		
		const deltaX = currentX - startX
		const threshold = containerWidth * 0.2
		
		if (Math.abs(deltaX) > threshold) {
			if (deltaX > 0 && currentTab > 0) {
				currentTab -= 1
			} else if (deltaX < 0 && currentTab < numTabs - 1) {
				currentTab += 1
			}
		}
		
		slideProgress.set(currentTab)
	}

	function jumpToTab(index: number) {
		if (dragging) return
		currentTab = index
		slideProgress.set(currentTab)
	}
</script>
<div>
    {#if allItemsGroupedByCanteen().length > 1}
        <div class="mb-6">
            <div class="flex space-x-1 rounded-xl bg-gray-200/70 p-1 backdrop-blur-sm dark:bg-gray-800/70">
                {#each allItemsGroupedByCanteen() as canteenGroup, index}
                    <button
                        class="flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 {currentTab === index ? 'bg-gray-100 text-green-700 shadow-sm dark:bg-gray-700' : 'text-gray-600 hover:text-gray-900 dark:bg-gray-800 dark:text-gray-400 dark:hover:text-gray-200'}"
                        onclick={() => jumpToTab(index)}
                    >
                        <img 
                            src={canteenGroup.canteen.image} 
                            class="h-5 w-5 rounded-full" 
                            alt={canteenGroup.canteen.name} 
                        />
                        <span class="hidden sm:inline truncate">{canteenGroup.canteen.name}</span>
                    </button>
                {/each}
            </div>
        </div>
    {/if}

    <div 
        class="overflow-hidden"
        bind:this={containerEl}
        bind:clientWidth={containerWidth}
        ontouchstart={handleTouchStart}
        ontouchmove={handleTouchMove}
        ontouchend={handleTouchEnd}
    >
        <div 
            class="flex transition-transform duration-300 ease-out"
            style="transform: translateX(-{$slideProgress * 100}%)"
        >
            {#each allItemsGroupedByCanteen() as canteenGroup, index}
				<div class="w-full min-h-[70vh] flex-shrink-0">
                    <CanteenBasket
                        {canteenGroup}
                        wallet={wallets.find(
                            (wallet: any) => wallet.canteenId === canteenGroup.canteen.id,
                        )}
                        {form}
                    />
                </div>
            {/each}
        </div>
    </div>
</div>