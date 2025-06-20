<script lang="ts">
	import { Button, Toggle } from 'bits-ui'
	import {
		Clock,
		Receipt,
		Package,
		CheckCircle,
		XCircle,
		ArrowLeft,
		Eye,
		EyeOff,
		MapPin,
		Calendar,
		CreditCard,
		Wallet,
	} from 'lucide-svelte'
	import type { PageData } from './$types'
	import { goto } from '$app/navigation'
	import { fly, fade } from 'svelte/transition'
	import Elements from '$lib/components/Elements.svelte'
	import { formatPrice } from '$lib/utils/priceUtils'
	import FoodType from '$lib/components/FoodType.svelte'
	import { source } from 'sveltekit-sse'
	import { onMount, onDestroy } from 'svelte'

	let { data }: { data: PageData } = $props()

	let showPin = $state(false)

	// SSE connection for real-time order updates
	let sseConnection: any = null
	let order = $state(data.order)

	// Initialize SSE connection
	onMount(() => {
		console.log('Initializing SSE connection for order detail page')

		sseConnection = source('/api/sse/orders', {
			close({ connect }) {
				console.log('Order detail SSE connection closed, attempting to reconnect...')
				setTimeout(() => connect(), 3000) // Reconnect after 3 seconds
			},
		})

		// Listen for order updates
		const orderUpdates = sseConnection.select('order_update')
		orderUpdates.subscribe((updateData: string) => {
			console.log('Raw SSE order update received:', updateData)
			if (updateData && updateData.trim()) {
				try {
					const update = JSON.parse(updateData)
					console.log('Received order update for order detail:', update)

					// Update this specific order if it matches
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

		// Listen for connection confirmations
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

	// Cleanup SSE connection
	onDestroy(() => {
		if (sseConnection) {
			sseConnection.close()
		}
	})

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('en-IN', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		})
	}

	function getStatusColor(status: string) {
		switch (status) {
			case 'pending':
				return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
			case 'confirmed':
				return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
			case 'preparing':
				return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
			case 'ready':
				return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
			case 'completed':
				return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
			case 'cancelled':
				return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
		}
	}

	function getStatusIcon(status: string) {
		switch (status) {
			case 'pending':
				return Clock
			case 'confirmed':
			case 'preparing':
				return Package
			case 'ready':
			case 'completed':
				return CheckCircle
			case 'cancelled':
				return XCircle
			default:
				return Receipt
		}
	}

	// Get timeline steps based on current status
	function getTimelineSteps(currentStatus: string, order: any) {
		const allSteps = [
			{
				status: 'pending',
				label: 'Order Placed',
				description: 'Your order has been placed successfully',
				timestamp: order.createdAt,
				completed: true,
			},
			{
				status: 'confirmed',
				label: 'Order Confirmed',
				description: 'Your order has been confirmed by the canteen',
				timestamp: order.confirmedAt,
				completed: ['confirmed', 'preparing', 'ready', 'completed'].includes(currentStatus),
			},
			{
				status: 'preparing',
				label: 'Preparing',
				description: 'Your order is being prepared',
				timestamp: order.preparedAt,
				completed: ['preparing', 'ready', 'completed'].includes(currentStatus),
			},
			{
				status: 'ready',
				label: 'Ready for Pickup',
				description: 'Your order is ready for pickup',
				timestamp: order.readyAt,
				completed: ['ready', 'completed'].includes(currentStatus),
			},
			{
				status: 'completed',
				label: 'Order Completed',
				description: 'Your order has been delivered/picked up',
				timestamp: order.completedAt,
				completed: currentStatus === 'completed',
			},
		]

		// If cancelled, show only placed and cancelled
		if (currentStatus === 'cancelled') {
			return [
				allSteps[0], // Order placed
				{
					status: 'cancelled',
					label: 'Order Cancelled',
					description: 'Your order has been cancelled',
					timestamp: order.cancelledAt,
					completed: true,
				},
			]
		}

		return allSteps
	}

	function calculateItemTotal(item: any) {
		const basePrice = Number(item.orderItem.unitPrice)
		const variantPrice = Number(item.orderItem.variantPrice || 0)
		const addonsPrice = item.addons.reduce(
			(sum: number, addon: any) => sum + Number(addon.orderAddon.unitPrice),
			0,
		)
		return (basePrice + variantPrice + addonsPrice) * item.orderItem.quantity
	}

	const timelineSteps = $derived(getTimelineSteps(order.status, data.order))
	const StatusIcon = getStatusIcon(data.order.status)
</script>

<svelte:head>
	<title>Order #{data.order.orderNumber} - Canteen Ordering System</title>
</svelte:head>

<div
	class="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
>
	<Elements />

	<div class="relative z-10 space-y-8 p-6">
		<div class="mb-6">
			<Button.Root
				class="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
				onclick={() => goto('/orders')}
			>
				<ArrowLeft size={16} />
				<span>Back to Orders</span>
			</Button.Root>
		</div>

		<div class="mx-auto max-w-6xl space-y-6">
			<div
				class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
				in:fly={{ y: 20, duration: 300 }}
			>
				<div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
					<div>
						<div class="mb-3 flex flex-wrap items-center gap-3">
							<h1
								class="text-2xl font-bold text-gray-900 md:text-3xl dark:text-white"
							>
								Order #{order?.orderNumber || 'Loading...'}
							</h1>
							<span
								class="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium {getStatusColor(
									order?.status || 'pending',
								)}"
							>
								{#if order}
									{@const StatusIcon = getStatusIcon(order.status)}
									<StatusIcon size={14} />
									{order.status.charAt(0).toUpperCase() + order.status.slice(1)}
								{/if}
							</span>
						</div>

						<div
							class="grid grid-cols-1 gap-3 text-sm text-gray-600 md:grid-cols-2 dark:text-gray-300"
						>
							<div class="flex items-center gap-2">
								<MapPin size={16} class="text-gray-400" />
								<span class="font-medium">Canteen:</span>
								{data.canteen?.name || 'Unknown Canteen'}
							</div>
							<div class="flex items-center gap-2">
								<Calendar size={16} class="text-gray-400" />
								<span class="font-medium">Ordered:</span>
								{formatDate(data.order.createdAt.toString())}
							</div>
							<div class="flex items-center gap-2">
								{#if data.order.prepaid}
									<Wallet size={16} class="text-green-600" />
									<span class="font-medium">Payment:</span>
									<span class="text-green-600 dark:text-green-400"
										>Prepaid (Wallet)</span
									>
								{:else}
									<CreditCard size={16} class="text-blue-600" />
									<span class="font-medium">Payment:</span>
									<span class="text-blue-600 dark:text-blue-400"
										>Pay on Delivery</span
									>
								{/if}
							</div>
							<div class="flex items-center gap-2">
								<Receipt size={16} class="text-gray-400" />
								<span class="font-medium">Total:</span>
								<span class="font-semibold text-gray-900 dark:text-white">
									{formatPrice(data.order.totalAmount)}
								</span>
							</div>
						</div>
					</div>

					<!-- PIN Section -->
					<div
						class="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700"
					>
						<div class="flex items-center justify-between gap-3">
							<div>
								<h3 class="font-medium text-gray-900 dark:text-white">
									Pickup PIN
								</h3>
								<div class="flex items-center gap-2">
									<span
										class="font-mono text-lg font-bold text-gray-900 dark:text-white"
									>
										{showPin ? data.order.otp : '••••'}
									</span>
									<Toggle.Root
										class="rounded p-1 hover:bg-gray-200 dark:hover:bg-gray-600"
										bind:pressed={showPin}
										aria-label="Toggle PIN visibility"
									>
										{#if showPin}
											<EyeOff size={16} class="text-gray-500" />
										{:else}
											<Eye size={16} class="text-gray-500" />
										{/if}
									</Toggle.Root>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
				<!-- Order Timeline -->
				<div class="lg:col-span-1">
					<div
						class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
						in:fly={{ y: 20, delay: 100, duration: 300 }}
					>
						<h2 class="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
							Order Timeline
						</h2>

						<div class="space-y-4">
							{#each timelineSteps as step, index}
								{@const StatusIcon = getStatusIcon(step.status)}
								<div class="flex gap-3">
									<div class="flex flex-col items-center">
										<div
											class="flex h-8 w-8 items-center justify-center rounded-full {step.completed
												? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300'
												: 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'}"
										>
											<StatusIcon size={14} />
										</div>
										{#if index < timelineSteps.length - 1}
											<div
												class="mt-1 h-8 w-px {step.completed
													? 'bg-green-200 dark:bg-green-800'
													: 'bg-gray-200 dark:bg-gray-600'}"
											></div>
										{/if}
									</div>
									<div class="min-w-0 flex-1 pb-4">
										<h4
											class="text-sm font-medium {step.completed
												? 'text-gray-900 dark:text-white'
												: 'text-gray-500 dark:text-gray-400'}"
										>
											{step.label}
										</h4>
										<p class="text-xs text-gray-500 dark:text-gray-400">
											{step.description}
										</p>
										{#if step.timestamp}
											<p
												class="mt-1 text-xs text-gray-400 dark:text-gray-500"
											>
												{formatDate(step.timestamp)}
											</p>
										{/if}
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>

				<!-- Order Items -->
				<div class="lg:col-span-2">
					<div
						class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
						in:fly={{ y: 20, delay: 200, duration: 300 }}
					>
						<h2 class="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
							Order Items
						</h2>
						<div class="space-y-4">
							{#each data.orderItems || [] as item, index}
								<div
									class=" rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
								>
									<div class="mb-3 flex items-start justify-between gap-4">
										<div class="flex items-center items-start gap-2">
											<img
												src={item.menuItem?.image || '/default-item.png'}
												alt={item.menuItem?.name || 'Unknown Item'}
												class="h-12 w-12 rounded"
											/>
											<div class="min-w-0 flex-1">
												<div class="mt-3 mb-1 flex items-center gap-2">
													<h3
														class="ml-1 truncate text-base font-semibold text-gray-900 sm:text-lg dark:text-white"
													>
														{item.menuItem?.name || 'Unknown Item'}
													</h3>
													<FoodType
														type={item.menuItem?.type}
														size={20}
													/>
												</div>
											</div>
										</div>

										<div class="flex-shrink-0 text-right">
											<div
												class="text-lg font-bold text-gray-900 dark:text-white"
											>
												{formatPrice(item.orderItem.subtotal)}
											</div>
											<div class="text-xs text-gray-500 dark:text-gray-400">
												{item.orderItem.quantity} × {formatPrice(
													Number(item.orderItem.subtotal) /
														item.orderItem.quantity,
												)}
											</div>
										</div>
									</div>

									<div class="mb-4 space-y-2">
										{#if item.variant}
											<div class="flex items-center justify-between text-sm">
												<span class="text-gray-600 dark:text-gray-300"
													>{item.variant.name}</span
												>
												<span
													class="font-medium text-gray-900 dark:text-white"
												>
													{formatPrice(
														Number(item.menuItem?.price) +
															Number(item.variant.price),
													)}
												</span>
											</div>
										{/if}

										{#if item.addons.length > 0}
											<div class="text-sm">
												<span
													class="mb-1 block text-gray-600 dark:text-gray-300"
													>Add-ons:</span
												>
												<div
													class="space-y-1 border-l-2 border-gray-200 pl-2 dark:border-gray-600"
												>
													{#each item.addons as addon}
														<div
															class="flex items-center justify-between"
														>
															<div>
																<span
																	class="text-gray-700 dark:text-gray-300"
																	>{addon.addon?.name}</span
																>
																<FoodType
																	type={addon.addon?.type}
																	size={14}
																	class="inline"
																/>
															</div>
															<span
																class="font-medium text-gray-900 dark:text-white"
															>
																{formatPrice(addon.addon?.price)}
															</span>
														</div>
													{/each}
												</div>
											</div>
										{/if}
									</div>
								</div>
							{/each}
						</div>

						<!-- Order Total -->
						<div class="mt-6 border-t border-gray-200 pt-4 dark:border-gray-600">
							<div
								class="flex justify-between text-lg font-bold text-gray-900 dark:text-white"
							>
								<span>Total Amount</span>
								<span>{formatPrice(data.order.totalAmount)}</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
