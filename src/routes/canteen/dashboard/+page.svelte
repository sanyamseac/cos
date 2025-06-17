<script lang="ts">
	import { Dialog } from 'bits-ui'
	import { formatPrice } from '$lib/utils'
	import {
		Clock,
		DollarSign,
		Package,
		CheckCircle,
		AlertCircle,
		PlayCircle,
		Eye,
		Lock,
	} from 'lucide-svelte'
	import { enhance } from '$app/forms'
	import Elements from '$lib/components/Elements.svelte'

	let { data, form } = $props()

	let selectedOrder: any = $state(null)
	let pinDialogOpen = $state(false)
	let pinInput = $state('')
	let orderDetailsOpen = $state(false)
	let statusUpdateLoading = $state(false)

	function getStatusColor(status: string) {
		switch (status) {
			case 'pending':
				return 'bg-yellow-100 text-yellow-800 border-yellow-200'
			case 'confirmed':
				return 'bg-blue-100 text-blue-800 border-blue-200'
			case 'preparing':
				return 'bg-orange-100 text-orange-800 border-orange-200'
			case 'ready':
				return 'bg-purple-100 text-purple-800 border-purple-200'
			case 'completed':
				return 'bg-green-100 text-green-800 border-green-200'
			case 'cancelled':
				return 'bg-red-100 text-red-800 border-red-200'
			default:
				return 'bg-gray-100 text-gray-800 border-gray-200'
		}
	}

	function getStatusIcon(status: string) {
		switch (status) {
			case 'pending':
				return Clock
			case 'confirmed':
				return AlertCircle
			case 'preparing':
				return PlayCircle
			case 'ready':
				return Package
			case 'completed':
				return CheckCircle
			default:
				return Clock
		}
	}

	function canUpdateStatus(currentStatus: string, newStatus: string) {
		const statusFlow: Record<string, string[]> = {
			pending: ['preparing'],
			confirmed: ['preparing'],
			preparing: ['ready'],
			ready: ['completed'],
		}
		return statusFlow[currentStatus]?.includes(newStatus) || false
	}

	function getNextStatus(currentStatus: string) {
		const nextStatus: Record<string, string> = {
			pending: 'preparing',
			confirmed: 'preparing',
			preparing: 'ready',
			ready: 'completed',
		}
		return nextStatus[currentStatus]
	}

	function handleOrderCardClick(order: any) {
		selectedOrder = order
		if (order.status === 'ready') {
			pinDialogOpen = true
		} else {
			orderDetailsOpen = true
		}
	}

	function handleStatusUpdate(orderId: number, newStatus: string) {
		if (newStatus === 'completed') {
			const order = data.orders.find((o: any) => o.id === orderId)
			selectedOrder = order
			pinDialogOpen = true
		} else {
			// Update status directly for non-completion status changes
			updateOrderStatus(orderId, newStatus, '')
		}
	}

	function updateOrderStatus(orderId: number, status: string, pin: string) {
		statusUpdateLoading = true
		const formData = new FormData()
		formData.append('orderId', orderId.toString())
		formData.append('status', status)
		if (pin) formData.append('pin', pin)

		fetch('?/updateOrderStatus', {
			method: 'POST',
			body: formData,
		})
			.then((response) => {
				if (response.ok) {
					location.reload() // Refresh to show updated data
				}
			})
			.finally(() => {
				statusUpdateLoading = false
				pinDialogOpen = false
				pinInput = ''
			})
	}

	function formatDateTime(date: Date) {
		return new Date(date).toLocaleString('en-IN', {
			hour: '2-digit',
			minute: '2-digit',
			day: '2-digit',
			month: 'short',
		})
	}
</script>

<div
	class="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
>
	<Elements />

	<div class="relative z-10 space-y-8 px-4 py-6 md:px-8 md:py-10">
		<!-- Header -->
		<div class="flex items-center justify-between">
			<div>
				<h1
					class="mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent"
				>
					{data.canteen.name} Dashboard
				</h1>
				<p class="text-lg text-gray-700 dark:text-gray-300">Today's operations overview</p>
			</div>
		</div>

		<!-- Revenue Stats -->
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div class="rounded-xl bg-white/80 p-6 shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
				<div class="flex items-center">
					<div
						class="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30"
					>
						<DollarSign class="h-6 w-6 text-green-600 dark:text-green-400" />
					</div>
					<div class="ml-4">
						<p class="text-sm font-medium text-gray-600 dark:text-gray-400">
							Today's Revenue
						</p>
						<p class="text-2xl font-bold text-gray-900 dark:text-white">
							{formatPrice(data.revenue.total)}
						</p>
					</div>
				</div>
			</div>

			<div class="rounded-xl bg-white/80 p-6 shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
				<div class="flex items-center">
					<div
						class="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30"
					>
						<Package class="h-6 w-6 text-blue-600 dark:text-blue-400" />
					</div>
					<div class="ml-4">
						<p class="text-sm font-medium text-gray-600 dark:text-gray-400">
							Orders Today
						</p>
						<p class="text-2xl font-bold text-gray-900 dark:text-white">
							{data.revenue.orderCount}
						</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Orders List -->
		<div class="rounded-xl bg-white/80 p-6 shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
			<h2 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Today's Orders</h2>

			{#if data.orders.length === 0}
				<div class="py-12 text-center">
					<Package class="mx-auto mb-4 h-12 w-12 text-gray-400" />
					<p class="text-gray-500 dark:text-gray-400">No orders today yet</p>
				</div>
			{:else}
				<div class="space-y-4">
					{#each data.orders as order}
						<div
							class="cursor-pointer rounded-lg border bg-white p-4 transition-all hover:shadow-md dark:border-gray-600 dark:bg-gray-700"
							onclick={() => handleOrderCardClick(order)}
						>
							<div class="flex items-center justify-between">
								<div class="flex-1">
									<div class="mb-2 flex items-center gap-3">
										<span class="text-lg font-semibold"
											>#{order.orderNumber}</span
										>
										<span
											class={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusColor(order.status)}`}
										>
											<svelte:component
												this={getStatusIcon(order.status)}
												class="h-3 w-3"
											/>
											{order.status.charAt(0).toUpperCase() +
												order.status.slice(1)}
										</span>
									</div>

									<p class="mb-1 text-sm text-gray-600 dark:text-gray-300">
										Customer: {order.user?.name || 'Unknown'}
									</p>

									<p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
										{formatDateTime(order.createdAt)}
									</p>

									<div class="flex items-center gap-4">
										<span class="text-lg font-bold text-green-600">
											{formatPrice(Number(order.totalAmount))}
										</span>

										<span class="text-sm text-gray-500">
											{order.items.length} item{order.items.length !== 1
												? 's'
												: ''}
										</span>
									</div>
								</div>

								<div class="flex flex-col gap-2">
									{#if canUpdateStatus(order.status, getNextStatus(order.status))}
										<button
											class="ring-offset-background focus-visible:ring-ring border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
											disabled={statusUpdateLoading}
											onclick={(e: Event) => {
												e.stopPropagation()
												handleStatusUpdate(
													order.id,
													getNextStatus(order.status),
												)
											}}
										>
											{#if getNextStatus(order.status) === 'completed'}
												<Lock class="mr-1 h-4 w-4" />
												Complete Order
											{:else}
												Mark as {getNextStatus(order.status)}
											{/if}
										</button>
									{/if}

									<button
										class="ring-offset-background focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
										onclick={(e: Event) => {
											e.stopPropagation()
											selectedOrder = order
											orderDetailsOpen = true
										}}
									>
										<Eye class="mr-1 h-4 w-4" />
										View Details
									</button>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>

<!-- PIN Validation Dialog -->
<Dialog.Root bind:open={pinDialogOpen}>
	<Dialog.Portal>
		<Dialog.Overlay class="fixed inset-0 z-50 bg-black/80" />
		<Dialog.Content
			class="fixed top-[50%] left-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg duration-200 sm:rounded-lg dark:bg-gray-800"
		>
			<Dialog.Title class="text-lg font-semibold"
				>Complete Order #{selectedOrder?.orderNumber}</Dialog.Title
			>
			<Dialog.Description class="text-sm text-gray-600 dark:text-gray-400">
				Enter the order PIN to mark this order as completed.
			</Dialog.Description>

			<div class="grid gap-4 py-4">
				<div class="grid gap-2">
					<label for="pin" class="text-sm font-medium">Order PIN</label>
					<input
						bind:value={pinInput}
						type="text"
						placeholder="Enter PIN"
						class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
					/>
				</div>

				{#if form?.message}
					<div class="text-sm text-red-600 dark:text-red-400">
						{form.message}
					</div>
				{/if}
			</div>

			<div class="flex justify-end gap-2">
				<button
					class="ring-offset-background focus-visible:ring-ring border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-10 items-center justify-center rounded-md border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
					onclick={() => {
						pinDialogOpen = false
						pinInput = ''
					}}
				>
					Cancel
				</button>
				<button
					class="ring-offset-background focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
					disabled={!pinInput.trim() || statusUpdateLoading}
					onclick={() => updateOrderStatus(selectedOrder?.id, 'completed', pinInput)}
				>
					{statusUpdateLoading ? 'Processing...' : 'Complete Order'}
				</button>
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>

<!-- Order Details Dialog -->
<Dialog.Root bind:open={orderDetailsOpen}>
	<Dialog.Portal>
		<Dialog.Overlay class="fixed inset-0 z-50 bg-black/80" />
		<Dialog.Content
			class="fixed top-[50%] left-[50%] z-50 grid max-h-[80vh] w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] gap-4 overflow-y-auto border bg-white p-6 shadow-lg duration-200 sm:rounded-lg dark:bg-gray-800"
		>
			<Dialog.Title class="text-lg font-semibold"
				>Order #{selectedOrder?.orderNumber}</Dialog.Title
			>

			{#if selectedOrder}
				<div class="space-y-4">
					<div class="grid grid-cols-2 gap-4 text-sm">
						<div>
							<span class="font-medium">Customer:</span>
							{selectedOrder.user?.name || 'Unknown'}
						</div>
						<div>
							<span class="font-medium">Status:</span>
							<span
								class={`ml-2 inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium ${getStatusColor(selectedOrder.status)}`}
							>
								{selectedOrder.status.charAt(0).toUpperCase() +
									selectedOrder.status.slice(1)}
							</span>
						</div>
						<div>
							<span class="font-medium">Order Time:</span>
							{formatDateTime(selectedOrder.createdAt)}
						</div>
						<div>
							<span class="font-medium">Total:</span>
							<span class="font-bold text-green-600"
								>{formatPrice(Number(selectedOrder.totalAmount))}</span
							>
						</div>
					</div>

					{#if selectedOrder.notes}
						<div>
							<span class="font-medium">Notes:</span>
							<p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
								{selectedOrder.notes}
							</p>
						</div>
					{/if}

					<div>
						<h4 class="mb-2 font-medium">Order Items:</h4>
						<div class="space-y-2">
							{#each selectedOrder.items as item}
								<div
									class="flex items-start justify-between rounded bg-gray-50 p-2 dark:bg-gray-700"
								>
									<div>
										<div class="font-medium">{item.menuItem?.name}</div>
										{#if item.variant}
											<div class="text-sm text-gray-600 dark:text-gray-400">
												Variant: {item.variant.name}
											</div>
										{/if}
										{#if item.addons && item.addons.length > 0}
											<div class="text-sm text-gray-600 dark:text-gray-400">
												Add-ons: {item.addons.join(', ')}
											</div>
										{/if}
									</div>
									<div class="text-right">
										<div class="font-medium">×{item.quantity}</div>
										<div class="text-sm text-gray-600">
											{formatPrice(Number(item.subtotal))}
										</div>
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>
			{/if}

			<div class="flex justify-end">
				<button
					class="ring-offset-background focus-visible:ring-ring border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-10 items-center justify-center rounded-md border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
					onclick={() => (orderDetailsOpen = false)}
				>
					Close
				</button>
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
