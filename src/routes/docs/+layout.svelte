<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class="min-h-screen bg-white dark:bg-gray-900">
	<div class="container mx-auto px-4 py-8">
		<div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
			<!-- Sidebar Navigation -->
			<aside class="lg:col-span-1">
				<div class="sticky top-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
					<h2 class="text-lg font-bold mb-4 dark:text-white">Documentation</h2>
					<nav class="space-y-2">
						<a
							href="/docs"
							class="block w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition {$page.url.pathname === '/docs'
								? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-medium'
								: 'text-gray-700 dark:text-gray-300'}"
						>
							Overview
						</a>
						<a
							href="/docs/users"
							class="block w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition {$page.url.pathname.includes('/docs/users')
								? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-medium'
								: 'text-gray-700 dark:text-gray-300'}"
						>
							For Students / Customers
						</a>
						<a
							href="/docs/managers"
							class="block w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition {$page.url.pathname.includes('/docs/managers')
								? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-medium'
								: 'text-gray-700 dark:text-gray-300'}"
						>
							For Canteen Managers
						</a>
						<a
							href="/docs/admins"
							class="block w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition {$page.url.pathname.includes('/docs/admins')
								? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-medium'
								: 'text-gray-700 dark:text-gray-300'}"
						>
							For Administrators
						</a>
						<a
							href="/docs/stakeholders"
							class="block w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition {$page.url.pathname.includes('/docs/stakeholders')
								? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-medium'
								: 'text-gray-700 dark:text-gray-300'}"
						>
							For Stakeholders
						</a>
						<a
							href="/docs/developers"
							class="block w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition {$page.url.pathname.includes('/docs/developers')
								? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-medium'
								: 'text-gray-700 dark:text-gray-300'}"
						>
							For Developers
						</a>
					</nav>
				</div>
			</aside>

			<!-- Main Content -->
			<main class="lg:col-span-3">
				<div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
					<slot />
                    
                    <!-- Footer -->
					<div class="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
						<p class="text-gray-600 dark:text-gray-400 text-center">
							For additional support or questions, please contact your system administrator.
						</p>
						<div class="flex justify-center gap-6 mt-4">
							<a href="/privacy" class="text-blue-600 dark:text-blue-400 hover:underline">Privacy Policy</a>
							<a href="/terms" class="text-blue-600 dark:text-blue-400 hover:underline">Terms of Service</a>
						</div>
					</div>
				</div>
			</main>
		</div>
	</div>
</div>
