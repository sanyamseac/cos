<script lang="ts">
	import { Button } from 'bits-ui'
	import { Clock, Receipt, Package, CheckCircle, XCircle, ArrowLeft, Eye } from 'lucide-svelte'
	import type { PageData } from './$types'
	import { goto } from '$app/navigation'
	import { fly, fade } from 'svelte/transition'
	import Elements from '$lib/components/Elements.svelte'

	let { data }: { data: PageData } = $props()

	// Helper functions
	function formatCurrency(amount: string | number) {
		return `₹${Number(amount).toFixed(2)}`
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('en-IN', {
			year: 'numeric',
			month: 'short',
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

	function getPaymentMethodText(prepaid: boolean) {
		return prepaid ? 'Prepaid (Wallet)' : 'Pay on Delivery'
	}

	function getPaymentMethodColor(prepaid: boolean) {
		return prepaid 
			? 'text-green-600 dark:text-green-400' 
			: 'text-blue-600 dark:text-blue-400'
	}
</script>

<svelte:head>
	<title>My Orders - Canteen Ordering System</title>
</svelte:head>

<div
	class="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
>
	<Elements />

	<div class="relative z-10 space-y-8 px-4 py-6">
		<h1
			class="mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent"
		>
			Orders
		</h1>

		<div class="mx-auto max-w-4xl mt-10">
			{#if data.orders && data.orders.length > 0}
				<div class="space-y-4">
					{#each data.orders as { order, canteen }, index}
						{@const StatusIcon = getStatusIcon(order.status)}
						<div 
							class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
							in:fly={{ y: 20, delay: index * 100, duration: 300 }}
						>
							<div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
								<div class="flex-1">
									<div class="mb-2 flex flex-wrap items-center gap-2">
										<h3 class="text-lg font-semibold text-gray-900 dark:text-white">
											Order #{order.orderNumber}
										</h3>
										<span class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium {getStatusColor(order.status)}">
											<StatusIcon size={12} />
											{order.status.charAt(0).toUpperCase() + order.status.slice(1)}
										</span>
									</div>
									
									<div class="space-y-1 text-sm text-gray-600 dark:text-gray-300">
										<p class="flex items-center gap-2">
											<span class="font-medium">Canteen:</span>
											{canteen?.name || 'Unknown Canteen'}
										</p>
										<p class="flex items-center gap-2">
											<span class="font-medium">Amount:</span>
											<span class="font-semibold text-gray-900 dark:text-white">
												{formatCurrency(order.totalAmount)}
											</span>
										</p>
										<p class="flex items-center gap-2">
											<span class="font-medium">Payment:</span>
											<span class="{getPaymentMethodColor(order.prepaid)}">
												{getPaymentMethodText(order.prepaid)}
											</span>
										</p>
										<p class="flex items-center gap-2">
											<span class="font-medium">Ordered:</span>
											{formatDate(order.createdAt.toString())}
										</p>
									</div>
								</div>

								<div class="flex flex-col gap-2 md:flex-row">
									<Button.Root
										class="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-indigo-700"
										onclick={() => goto(`/orders/${order.id}`)}
									>
										<Eye size={16} />
										View Details
									</Button.Root>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<div class="py-16 text-center" in:fade={{ duration: 300 }}>
					<div class="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
						<Receipt size={32} class="text-gray-400" />
					</div>
					<h3 class="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
						No orders yet
					</h3>
					<p class="mb-6 text-gray-600 dark:text-gray-300">
						Start ordering from our canteens to see your orders here.
					</p>
					<Button.Root
						class="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition-all hover:bg-indigo-700"
						onclick={() => goto('/menu')}
					>
						Browse Menu
					</Button.Root>
				</div>
			{/if}
		</div>
	</div>
</div>
