<script lang="ts">
	import type { PageData } from './$types'
	import { goto } from '$app/navigation'
	import { Users } from 'lucide-svelte'

	export let data: PageData
</script>

<svelte:head>
	<title>Manage Consumers - COS</title>
</svelte:head>

<div class="mx-auto max-w-[1400px] px-4 py-6 pb-20">
	<div class="mb-6">
		<h1 class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">Consumer Management</h1>
		<p class="text-gray-600 dark:text-gray-400">View and manage all registered consumers</p>
	</div>

	<div class="overflow-hidden rounded-lg bg-white shadow-lg dark:bg-gray-800">
		<div class="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
			<h2 class="text-xl font-semibold text-gray-800 dark:text-white">All Consumers</h2>
		</div>

		{#if data.users && data.users.length > 0}
			<div class="overflow-x-auto">
				<table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
					<thead class="bg-gray-50 dark:bg-gray-700">
						<tr>
							<th
								class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300"
							>
								Consumer
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300"
							>
								Email
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300"
							>
								Total Wallet Balance
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300"
							>
								Total Orders
							</th>
						</tr>
					</thead>
					<tbody
						class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800"
					>
						{#each data.users as user}
							<tr
								class="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
								onclick={() => goto(`/manage/consumers/${user.id}`)}
							>
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="flex items-center">
										<div class="h-10 w-10 flex-shrink-0">
											<img
												src={user.profilePicture}
												alt="User Avatar"
												class="h-10 w-10 rounded object-cover"
											/>
										</div>
										<div class="ml-4">
											<div
												class="text-sm font-medium text-gray-900 dark:text-white"
											>
												{user.name}
											</div>
											<div class="text-sm text-gray-500 dark:text-gray-400">
												ID: {user.id}
											</div>
										</div>
									</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="text-sm text-gray-900 dark:text-white">
										{user.email}
									</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="text-sm font-medium text-gray-900 dark:text-white">
										₹{parseFloat(user.totalWalletBalance || '0').toFixed(2)}
									</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="text-sm text-gray-900 dark:text-white">
										{user.orderCount}
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<div class="px-6 py-12 text-center">
				<div class="text-gray-500 dark:text-gray-400">
					<Users class="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-500" />
					<h3 class="mb-2 text-lg font-medium text-gray-900 dark:text-white">
						No consumers found
					</h3>
					<p class="text-gray-500 dark:text-gray-400">
						There are currently no registered consumers in the system.
					</p>
				</div>
			</div>
		{/if}
	</div>
</div>
