<script lang="ts">
	import type { PageData } from './$types'

	import Elements from '$lib/components/Elements.svelte'
	import { source } from 'sveltekit-sse'
	import { onMount, onDestroy } from 'svelte'
	import Header from './components/Header.svelte'
	import Details from './components/Details.svelte'
	import Timeline from './components/Timeline.svelte'
	import Items from './components/Items.svelte'
	import { Dialog } from 'bits-ui'
	import { goto } from '$app/navigation'

	let { data }: { data: PageData } = $props()
	let sseConnection: any = null
	let order = $state(data.order)
	let cancelDialogOpen = $state(false)
	let cancelLoading = $state(false)
	let cancelError = $state('')

	onMount(() => {
		console.log('Initializing SSE connection for order detail page')

		sseConnection = source('/api/sse/orders', {
			close({ connect }) {
				console.log('Order detail SSE connection closed, attempting to reconnect...')
				setTimeout(() => connect(), 3000)
			},
		})

		const orderUpdates = sseConnection.select('order_update')
		orderUpdates.subscribe((updateData: string) => {
			console.log('Raw SSE order update received:', updateData)
			if (updateData && updateData.trim()) {
				try {
					const update = JSON.parse(updateData)
					console.log('Received order update for order detail:', update)

					if (order && order.id.toString() === update.orderId.toString()) {
						console.log(
							`Updating order detail ${update.orderId} from ${order.status} to ${update.status}`,
						)
						order = {
							...order,
							status: update.status,
							updatedAt: new Date(update.timestamp),
						}
					}
				} catch (error) {
					console.error('Error parsing order update:', error, 'Raw data:', updateData)
				}
			}
		})

		const connected = sseConnection.select('connected')
		connected.subscribe((data: string) => {
			if (data) {
				console.log('Order detail SSE connected:', data)
				try {
					const connectionInfo = JSON.parse(data)
					console.log('Order detail connection info:', connectionInfo)
				} catch (e) {
					console.log('Order detail connection confirmation received:', data)
				}
			}
		})
	})

	onDestroy(() => {
		if (sseConnection) {
			sseConnection.close()
		}
	})

	async function handleCancelOrder() {
		cancelLoading = true
		cancelError = ''
		const formData = new FormData()
		const res = await fetch('?\/cancelOrder', { method: 'POST', body: formData })
		if (res.ok) {
			order = { ...order, status: 'cancelled' }
			cancelDialogOpen = false
			goto('/orders')
		} else {
			const data = await res.json().catch(() => ({}))
			cancelError = data?.message || 'Failed to cancel order'
		}
		cancelLoading = false
	}
</script>

<svelte:head>
	<title>Order {data.order.orderNumber}</title>
</svelte:head>

<div
	class="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
>
	<Elements />
	<div class="relative z-10 space-y-4 p-6 md:px-8 md:py-10">
		<Header {order} />
		{#if order.status !== 'completed' && order.status !== 'cancelled'}
			<div class="mb-4 flex justify-end">
				<button
					class="ring-offset-background focus-visible:ring-ring inline-flex h-10 items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium whitespace-nowrap text-white transition-colors hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
					onclick={() => (cancelDialogOpen = true)}
					aria-label="Cancel Order"
				>
					Cancel Order
				</button>
			</div>
		{/if}
		<Details {data} />
		<hr class="my-6 border-gray-200 dark:border-gray-700" />
		<div class="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-3">
			<Timeline {data} {order} />
			<hr class="my-6 block border-gray-200 lg:hidden dark:border-gray-700" />
			<Items {data} />
		</div>
	</div>
</div>

<!-- Cancel Confirmation Dialog -->
<Dialog.Root bind:open={cancelDialogOpen}>
	<Dialog.Portal>
		<Dialog.Overlay class="fixed inset-0 z-50 bg-black/80" />
		<Dialog.Content
			class="fixed top-[50%] left-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg duration-200 sm:rounded-lg dark:bg-gray-800"
		>
			<Dialog.Title class="text-lg font-semibold text-red-600">Cancel Order?</Dialog.Title>
			<Dialog.Description class="text-sm text-gray-600 dark:text-gray-400">
				Are you sure you want to cancel this order? This action cannot be undone.
			</Dialog.Description>
			{#if cancelError}
				<div class="mt-2 text-sm text-red-600">{cancelError}</div>
			{/if}
			<div class="mt-4 flex justify-end gap-2">
				<button
					class="ring-offset-background focus-visible:ring-ring border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-10 items-center justify-center rounded-md border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
					onclick={() => (cancelDialogOpen = false)}
					aria-label="No, go back"
				>
					No, go back
				</button>
				<button
					class="ring-offset-background focus-visible:ring-ring inline-flex h-10 items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium whitespace-nowrap text-white transition-colors hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
					disabled={cancelLoading}
					onclick={handleCancelOrder}
					aria-label="Yes, cancel order"
				>
					{cancelLoading ? 'Cancelling...' : 'Yes, cancel order'}
				</button>
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
