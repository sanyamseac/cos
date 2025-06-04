<script lang="ts">
	import type { PageData } from './$types'
	import { enhance } from '$app/forms'
	import { goto } from '$app/navigation'
	import type { PgTimestamp } from 'drizzle-orm/pg-core'
	import CrudModal from '$lib/components/CrudModal.svelte'

	let { data }: { data: PageData } = $props()

	let showAddMoneyModal = $state(false)
	let selectedCanteenId = $state('')
	let amount = $state('')
	let reference = $state('')

	function openAddMoneyModal() {
		showAddMoneyModal = true
	}

	function closeAddMoneyModal() {
		showAddMoneyModal = false
		selectedCanteenId = ''
		amount = ''
		reference = ''
	}

	// Define fields for the add money form
	let addMoneyFields = [		{
			name: 'canteenId',
			label: 'Select Canteen',
			type: 'select' as const,
			required: true,
			placeholder: 'Choose a canteen...',
			options: (data.canteens || []).map(canteen => ({
				value: canteen.id,
				label: canteen.name
			}))
		},
		{
			name: 'amount',
			label: 'Amount (₹)',
			type: 'number' as const,
			required: true,
			placeholder: 'Enter amount',
			step: '0.01'
		},
		{
			name: 'reference',
			label: 'Reference',
			type: 'text' as const,
			required: false,
			placeholder: 'Payment reference or note'
		}
	]

	function formatCurrency(value: string | number) {
		return `₹${parseFloat(value.toString()).toFixed(2)}`
	}

	function formatDate(dateString: string | Date) {
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
			case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
			case 'confirmed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
			case 'preparing': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
			case 'ready': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
			case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
			case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
			default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
		}
	}
	function getTotalWalletBalance() {
		return (data.wallets || []).reduce((sum, w) => sum + parseFloat(w.wallet.balance), 0)
	}
</script>

<svelte:head>
	<title>user Details - {data.user.name} - COS</title>
</svelte:head>

<div class="max-w-[1400px] mx-auto px-4 py-6 pb-20">
	<div class="mb-6 flex items-center justify-between">
		<div>
			<button 
				onclick={() => goto('/manage/consumers')}
				class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mb-2 flex items-center"
			>
				<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
				</svg>
				Back to users
			</button>
			<h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">{data.user.name}</h1>
			<p class="text-gray-600 dark:text-gray-400">{data.user.email}</p>
		</div>
		<button
			onclick={openAddMoneyModal}
			class="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
		>
			Add Money
		</button>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">		<!-- user Overview -->
		<div class="lg:col-span-1">
			<div class="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 mb-6">
				<h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">user Overview</h2>
				<div class="space-y-3">
					<div>
						<span class="text-sm text-gray-500 dark:text-gray-400">User ID</span>
						<p class="font-medium text-gray-900 dark:text-gray-100">{data.user.id}</p>
					</div>
					<div>
						<span class="text-sm text-gray-500 dark:text-gray-400">Email</span>
						<p class="font-medium text-gray-900 dark:text-gray-100">{data.user.email}</p>
					</div>
					<div>
						<span class="text-sm text-gray-500 dark:text-gray-400">Role</span>
						<p class="font-medium capitalize text-gray-900 dark:text-gray-100">{data.user.role}</p>
					</div>
					<div>
						<span class="text-sm text-gray-500 dark:text-gray-400">Total Wallet Balance</span>
						<p class="font-bold text-green-600 dark:text-green-400 text-lg">{formatCurrency(getTotalWalletBalance())}</p>
					</div>
				</div>
			</div>

			<!-- Wallet Balances by Canteen -->
			<div class="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
				<h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Wallet Balances</h2>
				{#if data.wallets && data.wallets.length > 0}
					<div class="space-y-3">
						{#each data.wallets as { wallet, canteen }}
							<div class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
								<div>
									<p class="font-medium text-gray-900 dark:text-gray-100">{canteen?.name || 'Unknown Canteen'}</p>
									<p class="text-sm text-gray-500 dark:text-gray-400">{canteen?.acronym || ''}</p>
								</div>
								<p class="font-bold text-green-600 dark:text-green-400">{formatCurrency(wallet.balance)}</p>
							</div>
						{/each}
					</div>
				{:else}
					<p class="text-gray-500 dark:text-gray-400 text-center py-4">No wallet found</p>
				{/if}
			</div>
		</div>
		<!-- Main Content -->
		<div class="lg:col-span-2 space-y-6">
			<!-- Recent Orders -->
			<div class="bg-white dark:bg-gray-800 shadow-lg rounded-lg">
				<div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
					<h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200">Recent Orders</h2>
				</div>
				{#if data.orders && data.orders.length > 0}
					<div class="overflow-x-auto">
						<table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
							<thead class="bg-gray-50 dark:bg-gray-700">
								<tr>
									<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Order #</th>
									<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Canteen</th>
									<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
									<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Amount</th>
									<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
								</tr>
							</thead>
							<tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
								{#each data.orders as { order, canteen }}
									<tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
										<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
											{order.orderNumber}
										</td>
										<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
											{canteen?.name || 'Unknown'}
										</td>
										<td class="px-6 py-4 whitespace-nowrap">
											<span class="px-2 py-1 text-xs font-medium rounded-full {getStatusColor(order.status)}">
												{order.status}
											</span>
										</td>
										<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
											{formatCurrency(order.totalAmount)}
										</td>
										<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
											{formatDate(order.createdAt)}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{:else}
					<div class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
						No orders found
					</div>
				{/if}
			</div>			<!-- Active Baskets -->
			<div class="bg-white dark:bg-gray-800 shadow-lg rounded-lg">
				<div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
					<h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200">Active Baskets</h2>
				</div>
				{#if data.baskets && data.baskets.length > 0}
					<div class="p-6">
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							{#each data.baskets as { basket, canteen }}
								<div class="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-700">
									<div class="flex justify-between items-start mb-2">
										<h3 class="font-medium text-gray-900 dark:text-gray-100">
											{basket.name || 'Unnamed Basket'}
										</h3>
										{#if basket.isShared}
											<span class="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
												Shared
											</span>
										{/if}
									</div>
									<p class="text-sm text-gray-600 dark:text-gray-400 mb-2">{canteen?.name || 'Unknown Canteen'}</p>
									<p class="text-xs text-gray-500 dark:text-gray-500">Updated: {formatDate(basket.updatedAt)}</p>
								</div>
							{/each}
						</div>
					</div>
				{:else}
					<div class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
						No active baskets
					</div>
				{/if}
			</div>			<!-- Recent Wallet Transactions -->
			<div class="bg-white dark:bg-gray-800 shadow-lg rounded-lg">
				<div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
					<h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200">Recent Wallet Transactions</h2>
				</div>
				{#if data.walletTransactions && data.walletTransactions.length > 0}
					<div class="overflow-x-auto">
						<table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
							<thead class="bg-gray-50 dark:bg-gray-700">
								<tr>
									<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Canteen</th>
									<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Amount</th>
									<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Reference</th>
									<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Performed By</th>
									<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
								</tr>
							</thead>
							<tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
								{#each data.walletTransactions as { transaction, canteen, performedBy }}
									<tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
										<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
											{canteen?.name || 'Unknown'}
										</td>
										<td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
											<span class="{parseFloat(transaction.amount) > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">
												{parseFloat(transaction.amount) > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
											</span>
										</td>
										<td class="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
											{transaction.reference || 'No reference'}
										</td>
										<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
											{performedBy?.name || 'Unknown'}
										</td>
										<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
											{formatDate(transaction.createdAt)}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{:else}
					<div class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
						No transactions found
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<!-- Add Money Modal -->
<CrudModal
	bind:open={showAddMoneyModal}
	editing={false}
	entityName="Wallet Transaction"
	fields={addMoneyFields}
	addAction="?/addMoney"
	updateAction=""
	onClose={closeAddMoneyModal}
/>
