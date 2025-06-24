<script lang="ts">
	import { Switch } from 'bits-ui'
	import { enhance } from '$app/forms'
	import type { PageData } from './$types'
	import Elements from '$lib/components/Elements.svelte'
	import { invalidateAll } from '$app/navigation'
	import { formatPrice } from '$lib/utils'
	import { Hourglass, Timer } from 'lucide-svelte'

	let { data }: { data: PageData } = $props()
	let showError = $state(false)
</script>

<div
	class="relative min-h-screen overflow-hidden bg-gradient-to-br from-green-50 via-green-50 to-purple-50 pb-20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
>
	<Elements />
	<div class="relative z-10 space-y-8 px-4 py-6 md:px-8 md:py-10">
		<div class="flex-row">
			<div class="flex items-center justify-between">
				<div>
					<h1
						class="font-sensation text-4xl text-gray-800 sm:text-5xl md:text-6xl dark:text-white"
					>
						{data.canteen.name} Management
					</h1>
				</div>
			</div>
		</div>

		<div class="transform pt-6 transition-all duration-300">
			<span>{data.canteen.timings}</span>

			{#if data.canteen.description}
				<p class="mt-4">
					{data.canteen.description}
				</p>
			{/if}

			<div class="mt-6 flex flex-wrap gap-8">
				<div class="flex items-center gap-2 rounded-lg bg-white/70 px-4 py-2 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800/70 dark:ring-gray-700">
					<span class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
						<Hourglass class="h-5 w-5" />
					</span>
					<div>
						<div class="text-xs text-gray-500 dark:text-gray-400">Current Wait Time</div>
						<div class="text-lg font-semibold text-gray-800 dark:text-gray-100">
							{data.canteen.waitingTime ? Math.round(data.canteen.waitingTime / 60) : 0} <span class="text-xs font-normal">min</span>
						</div>
					</div>
				</div>
				<div class="flex items-center gap-2 rounded-lg bg-white/70 px-4 py-2 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800/70 dark:ring-gray-700">
					<span class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
						<Timer class="h-5 w-5" />
					</span>
					<div>
						<div class="text-xs text-gray-500 dark:text-gray-400">Average Cooking Time</div>
						<div class="text-lg font-semibold text-gray-800 dark:text-gray-100">
							{data.canteen.averageCookingTime ? Math.round(data.canteen.averageCookingTime / 60) : 0} <span class="text-xs font-normal">min</span>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="flex items-center justify-between">
			{#if data.canteen.open}
				<span class="text-green-600 dark:text-green-400">Canteen is Open</span>
			{:else}
				<span class="text-red-600 dark:text-red-400">Canteen is Closed</span>
			{/if}
			<form
				method="post"
				name="canteen"
				action="?/updateCanteenStatus"
				use:enhance={() => {
					return async ({ result }) => {
						if (result.type === 'success') invalidateAll()
						else {
							showError = true
							setTimeout(() => {
								showError = false
							}, 3000)
						}
					}
				}}
			>
				<input type="hidden" name="open" value={!data.canteen.open} />
				<Switch.Root
					onCheckedChange={(checked) => {
						const form = document.querySelector(`form[name="canteen"]`)
						if (form) (form as HTMLFormElement).requestSubmit()
					}}
					checked={data.canteen.open}
					class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500 data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-200 dark:data-[state=unchecked]:bg-gray-700"
				>
					<Switch.Thumb
						class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-1"
					/>
				</Switch.Root>
			</form>
		</div>

		{#if showError}
			<div class="text-red-500">An error occurred while updating. Please try again.</div>
		{/if}

		<div class="space-y-6">
			{#each Object.entries(data.menuCategories) as [category, items]}
				<div class="rounded-lg border p-4">
					<h2 class="border-b pb-2 text-xl font-bold dark:border-gray-600">{category}</h2>
					{#if items.length === 0}
						<p class="text-gray-500 dark:text-gray-400">
							No items available in this category.
						</p>
					{/if}
					{#each items as item}
						<div class="border-b py-4 dark:border-gray-600">
							<div class="flex items-center justify-between">
								<div class="text-lg font-semibold">
									{item.name} ({formatPrice(item.price)})
									<span class="ml-2 text-xs text-gray-500 dark:text-gray-400"
										>Making time: {item.cookingTime
											? Math.round(item.cookingTime / 60)
											: 0} min</span
									>
								</div>
								<form
									method="post"
									name={item.id.toString()}
									action="?/updateItemAvailability"
									use:enhance={() => {
										return async ({ result }) => {
											if (result.type === 'success') invalidateAll()
											else {
												showError = true
												setTimeout(() => {
													showError = false
												}, 3000)
											}
										}
									}}
								>
									<input type="hidden" name="itemId" value={item.id} />
									<input type="hidden" name="available" value={!item.available} />
									<Switch.Root
										onCheckedChange={(checked) => {
											const form = document.querySelector(
												`form[name="${item.id}"]`,
											)
											if (form) (form as HTMLFormElement).requestSubmit()
										}}
										checked={item.available}
										class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500 data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-200 dark:data-[state=unchecked]:bg-gray-700"
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
												<span
													>{addon.name} ({formatPrice(addon.price)})</span
												>
												<form
													method="post"
													name={`addon-${addon.id}`}
													action="?/updateAddonAvailability"
													use:enhance={() => {
														return async ({ result }) => {
															if (result.type === 'success')
																invalidateAll()
															else {
																showError = true
																setTimeout(() => {
																	showError = false
																}, 3000)
															}
														}
													}}
												>
													<input
														type="hidden"
														name="addonId"
														value={addon.id}
													/>
													<input
														type="hidden"
														name="available"
														value={!addon.available}
													/>
													<Switch.Root
														checked={addon.available}
														class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500 data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-200 dark:data-[state=unchecked]:bg-gray-700"
														onCheckedChange={(e) => {
															const form = document.querySelector(
																`form[name="addon-${addon.id}"]`,
															) as HTMLFormElement
															if (form) form.requestSubmit()
														}}
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
												<span
													>{variant.name} (+{formatPrice(
														variant.price,
													)})</span
												>
												<form
													method="post"
													name={`variant-${variant.id}`}
													action="?/updateVariantAvailability"
													use:enhance={() => {
														return async ({ result }) => {
															if (result.type === 'success')
																invalidateAll()
															else {
																showError = true
																setTimeout(() => {
																	showError = false
																}, 3000)
															}
														}
													}}
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
														checked={variant.available}
														class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500 data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-200 dark:data-[state=unchecked]:bg-gray-700"
														onclick={(e) => {
															const form = document.querySelector(
																`form[name="variant-${variant.id}"]`,
															) as HTMLFormElement
															if (form) form.requestSubmit()
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
			{/each}
		</div>
	</div>
</div>
