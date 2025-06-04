<script lang="ts">
	import { Button, Toggle } from 'bits-ui'
	import { Clock, Receipt, Package, CheckCircle, XCircle, ArrowLeft, Eye, EyeOff, MapPin, Calendar, CreditCard, Wallet } from 'lucide-svelte'
	import type { PageData } from './$types'
	import { goto } from '$app/navigation'
	import { fly, fade } from 'svelte/transition'

	let { data }: { data: PageData } = $props()

	// Ensure data exists
	if (!data.order) {
		throw new Error('Order not found')
	}

	// State for PIN visibility
	let showPin = $state(false)

	// Helper functions
	function formatCurrency(amount: string | number) {
		return `₹${Number(amount).toFixed(2)}`
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('en-IN', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
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

	function getFoodTypeIcon(type: string) {
		if (type === 'veg') return '🟢'
		if (type === 'non-veg') return '🔴'
		if (type === 'egg') return '🟡'
		return '⚪'
	}

	// Get timeline steps based on current status
	function getTimelineSteps(currentStatus: string, order: any) {
		const allSteps = [
			{
				status: 'pending',
				label: 'Order Placed',
				description: 'Your order has been placed successfully',
				timestamp: order.createdAt,
				completed: true
			},
			{
				status: 'confirmed',
				label: 'Order Confirmed',
				description: 'Your order has been confirmed by the canteen',
				timestamp: order.confirmedAt,
				completed: ['confirmed', 'preparing', 'ready', 'completed'].includes(currentStatus)
			},
			{
				status: 'preparing',
				label: 'Preparing',
				description: 'Your order is being prepared',
				timestamp: order.preparedAt,
				completed: ['preparing', 'ready', 'completed'].includes(currentStatus)
			},
			{
				status: 'ready',
				label: 'Ready for Pickup',
				description: 'Your order is ready for pickup',
				timestamp: order.readyAt,
				completed: ['ready', 'completed'].includes(currentStatus)
			},
			{
				status: 'completed',
				label: 'Order Completed',
				description: 'Your order has been delivered/picked up',
				timestamp: order.completedAt,
				completed: currentStatus === 'completed'
			}
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
					completed: true
				}
			]
		}

		return allSteps
	}

	// Calculate item totals
	function calculateItemTotal(item: any) {
		const basePrice = Number(item.orderItem.unitPrice)
		const variantPrice = Number(item.orderItem.variantPrice || 0)
		const addonsPrice = item.addons.reduce((sum: number, addon: any) => 
			sum + Number(addon.orderAddon.unitPrice), 0)
		return (basePrice + variantPrice + addonsPrice) * item.orderItem.quantity
	}

	const timelineSteps = $derived(getTimelineSteps(data.order.status, data.order))
    const StatusIcon = getStatusIcon(data.order.status)
</script>

<svelte:head>
	<title>Order #{data.order.orderNumber} - Canteen Ordering System</title>
</svelte:head>

<!-- Background with animated elements -->
<div class="fixed inset-0 overflow-hidden">
	<div class="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800"></div>
	<div class="absolute left-1/4 top-20 h-64 w-64 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 opacity-20 blur-3xl"></div>
	<div class="absolute right-1/4 bottom-20 h-40 w-40 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 opacity-20 blur-3xl"></div>
</div>

<div class="relative z-10 min-h-screen p-4 pb-20 md:p-6">
	<!-- Back Button -->
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
		<!-- Order Header -->
		<div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800" in:fly={{ y: 20, duration: 300 }}>
			<div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
				<div>
					<div class="mb-3 flex flex-wrap items-center gap-3">
						<h1 class="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
							Order #{data.order.orderNumber}
						</h1>						<span class="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium {getStatusColor(data.order.status)}">
							{#if data.order}
								{@const StatusIcon = getStatusIcon(data.order.status)}
								<StatusIcon size={14} />
								{data.order.status.charAt(0).toUpperCase() + data.order.status.slice(1)}
							{/if}
						</span>
					</div>
					
					<div class="grid grid-cols-1 gap-3 text-sm text-gray-600 dark:text-gray-300 md:grid-cols-2">
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
								<span class="text-green-600 dark:text-green-400">Prepaid (Wallet)</span>
							{:else}
								<CreditCard size={16} class="text-blue-600" />
								<span class="font-medium">Payment:</span>
								<span class="text-blue-600 dark:text-blue-400">Pay on Delivery</span>
							{/if}
						</div>
						<div class="flex items-center gap-2">
							<Receipt size={16} class="text-gray-400" />
							<span class="font-medium">Total:</span>
							<span class="font-semibold text-gray-900 dark:text-white">
								{formatCurrency(data.order.totalAmount)}
							</span>
						</div>
					</div>
				</div>

				<!-- PIN Section -->
				<div class="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
					<div class="flex items-center justify-between gap-3">
						<div>
							<h3 class="font-medium text-gray-900 dark:text-white">Pickup PIN</h3>
							<div class="flex items-center gap-2">
								<span class="font-mono text-lg font-bold text-gray-900 dark:text-white">
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
				<div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800" in:fly={{ y: 20, delay: 100, duration: 300 }}>
					<h2 class="mb-6 text-lg font-semibold text-gray-900 dark:text-white">Order Timeline</h2>
					
					<div class="space-y-4">
						{#each timelineSteps as step, index}
                        {@const StatusIcon = getStatusIcon(step.status)}
							<div class="flex gap-3">
								<div class="flex flex-col items-center">
									<div class="flex h-8 w-8 items-center justify-center rounded-full {step.completed ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'}">
										<StatusIcon size={14} />
									</div>
									{#if index < timelineSteps.length - 1}
										<div class="mt-1 h-8 w-px {step.completed ? 'bg-green-200 dark:bg-green-800' : 'bg-gray-200 dark:bg-gray-600'}"></div>
									{/if}
								</div>
								<div class="min-w-0 flex-1 pb-4">
									<h4 class="text-sm font-medium {step.completed ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}">
										{step.label}
									</h4>
									<p class="text-xs text-gray-500 dark:text-gray-400">
										{step.description}
									</p>
									{#if step.timestamp}
										<p class="mt-1 text-xs text-gray-400 dark:text-gray-500">
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
				<div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800" in:fly={{ y: 20, delay: 200, duration: 300 }}>
					<h2 class="mb-6 text-lg font-semibold text-gray-900 dark:text-white">Order Items</h2>
							<div class="space-y-4">
						{#each data.orderItems || [] as item, index}
							<div class="rounded-lg border border-gray-100 p-4 dark:border-gray-600" in:fly={{ y: 10, delay: index * 50, duration: 200 }}>
								<div class="flex justify-between">
									<div class="flex-1">
										<div class="flex items-start gap-3">
											<span class="text-lg">{getFoodTypeIcon(item.menuItem?.type || 'veg')}</span>
											<div>
												<h4 class="font-medium text-gray-900 dark:text-white">
													{item.menuItem?.name || 'Unknown Item'}
												</h4>
												
												{#if item.variant}
													<p class="text-sm text-gray-600 dark:text-gray-300">
														Variant: {item.variant.name} (+{formatCurrency(item.orderItem.variantPrice)})
													</p>
												{/if}
												
												{#if item.addons.length > 0}
													<div class="mt-1">
														<p class="text-sm text-gray-600 dark:text-gray-300">Add-ons:</p>
														<ul class="ml-4 text-sm text-gray-600 dark:text-gray-300">
															{#each item.addons as addon}
																<li>• {addon.addon?.name} (+{formatCurrency(addon.orderAddon.unitPrice)})</li>
															{/each}
														</ul>
													</div>
												{/if}
												
												<div class="mt-2 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
													<span>Qty: {item.orderItem.quantity}</span>
													<span>Unit: {formatCurrency(item.orderItem.unitPrice)}</span>
												</div>
											</div>
										</div>
									</div>
									
									<div class="text-right">
										<div class="font-semibold text-gray-900 dark:text-white">
											{formatCurrency(calculateItemTotal(item))}
										</div>
									</div>
								</div>
							</div>
						{/each}
					</div>
					
					<!-- Order Total -->
					<div class="mt-6 border-t border-gray-200 pt-4 dark:border-gray-600">
						<div class="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
							<span>Total Amount</span>
							<span>{formatCurrency(data.order.totalAmount)}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
