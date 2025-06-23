<script lang="ts">
	import type { PageData } from './$types'

	import Elements from '$lib/components/Elements.svelte'
	import { source } from 'sveltekit-sse'
	import { onMount, onDestroy } from 'svelte'
	import Header from './components/Header.svelte'
	import Details from './components/Details.svelte'
	import Timeline from './components/Timeline.svelte'
	import Items from './components/Items.svelte'
	import { Button, Dialog } from 'bits-ui'
	import { goto, invalidateAll } from '$app/navigation'
	import { enhance } from '$app/forms'
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte'

	let { data }: { data: PageData } = $props()
	let sseConnection: any = null
	let order = $derived(data.order)

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
			invalidateAll()
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
		<Details {data} />
		<hr class="my-6 border-gray-200 dark:border-gray-700" />
		<div class="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-3">
			<Timeline {data} {order} />
			<hr class="my-6 block border-gray-200 lg:hidden dark:border-gray-700" />
			<Items {data} />
		</div>
	</div>
</div>
