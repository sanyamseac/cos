<script lang="ts">
	import { Switch, Label } from 'bits-ui'
	import { enhance } from '$app/forms'
	import type { PageData } from './$types'
	import Elements from '$lib/components/Elements.svelte'

	let { data }: { data: PageData } = $props()
	let items = $state(data.items)

	function setItemAvailable(itemIdx: number, value: boolean) {
		// Optimistically update UI
		items[itemIdx].available = value
		items[itemIdx].addons.forEach((a) => (a.available = value))
		items[itemIdx].variants.forEach((v) => (v.available = value))
		items = [...items] // trigger reactivity
	}

	function setAddonAvailable(itemIdx: number, addonIdx: number, value: boolean) {
		// Optimistically update UI
		items[itemIdx].addons[addonIdx].available = value
		items = [...items]
	}

	function setVariantAvailable(itemIdx: number, variantIdx: number, value: boolean) {
		// Optimistically update UI
		items[itemIdx].variants[variantIdx].available = value
		items = [...items]
	}
</script>

<div
	class="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
>
	<Elements />
	<div class="relative z-10 space-y-8 px-4 py-6 md:px-8 md:py-10">
		<h1
			class="mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent"
		>
			Manage Canteen Items
		</h1>
		<div class="space-y-6">
			{#each items as item, i}
				<div
					class="rounded-xl border bg-white/80 p-4 shadow-lg backdrop-blur-sm dark:border-gray-600 dark:bg-gray-800/80"
				>
					<div class="flex items-center justify-between">
						<div class="text-lg font-semibold">{item.name}</div>
						<form method="post" action="?/updateItemAvailability" use:enhance>
							<input type="hidden" name="itemId" value={item.id} />
							<input type="hidden" name="available" value={!item.available} />
							<Switch.Root
								bind:checked={item.available}
								class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200 dark:data-[state=unchecked]:bg-gray-700"
								onclick={(e) => {
									const newValue = !item.available
									setItemAvailable(i, newValue)
									const form = (e.target as HTMLElement).closest('form')
									if (form) {
										const hiddenInput = form.querySelector(
											'input[name="available"]',
										) as HTMLInputElement
										hiddenInput.value = newValue.toString()
										setTimeout(() => {
											form.requestSubmit()
											setTimeout(() => location.reload(), 20) // Refresh the page after 200ms
										}, 100)
									}
								}}
								name={`item-${item.id}`}
							>
								<Switch.Thumb
									class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-1"
								/>
							</Switch.Root>
						</form>
					</div>
					{#if item.addons.length > 0}
						<div class="mt-4">
							<div class="mb-2 text-sm font-medium">Addons</div>
							<div class="space-y-2">
								{#each item.addons as addon, j}
									<div class="flex items-center justify-between pl-4">
										<span>{addon.name}</span>
										<form
											method="post"
											action="?/updateAddonAvailability"
											use:enhance
										>
											<input type="hidden" name="addonId" value={addon.id} />
											<input
												type="hidden"
												name="available"
												value={!addon.available}
											/>
											<Switch.Root
												bind:checked={addon.available}
												class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200 dark:data-[state=unchecked]:bg-gray-700"
												onclick={(e) => {
													const newValue = !addon.available
													setAddonAvailable(i, j, newValue)
													const form = (e.target as HTMLElement).closest(
														'form',
													)
													if (form) {
														const hiddenInput = form.querySelector(
															'input[name="available"]',
														) as HTMLInputElement
														hiddenInput.value = newValue.toString()
														setTimeout(() => {
															form.requestSubmit()
															setTimeout(() => location.reload(), 200) // Refresh the page after 200ms
														}, 100)
													}
												}}
												name={`addon-${addon.id}`}
											>
												<Switch.Thumb
													class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-1"
												/>
											</Switch.Root>
										</form>
									</div>
								{/each}
							</div>
						</div>
					{/if}
					{#if item.variants.length > 0}
						<div class="mt-4">
							<div class="mb-2 text-sm font-medium">Variants</div>
							<div class="space-y-2">
								{#each item.variants as variant, k}
									<div class="flex items-center justify-between pl-4">
										<span>{variant.name}</span>
										<form
											method="post"
											action="?/updateVariantAvailability"
											use:enhance
										>
											<input
												type="hidden"
												name="variantId"
												value={variant.id}
											/>
											<input
												type="hidden"
												name="available"
												value={!variant.available}
											/>
											<Switch.Root
												bind:checked={variant.available}
												class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200 dark:data-[state=unchecked]:bg-gray-700"
												onclick={(e) => {
													const newValue = !variant.available
													setVariantAvailable(i, k, newValue)
													const form = (e.target as HTMLElement).closest(
														'form',
													)
													if (form) {
														const hiddenInput = form.querySelector(
															'input[name="available"]',
														) as HTMLInputElement
														hiddenInput.value = newValue.toString()
														setTimeout(() => {
															form.requestSubmit()
															setTimeout(() => location.reload(), 200) // Refresh the page after 200ms
														}, 100)
													}
												}}
												name={`variant-${variant.id}`}
											>
												<Switch.Thumb
													class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-1"
												/>
											</Switch.Root>
										</form>
									</div>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</div>
