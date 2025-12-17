<script lang="ts">
	let activeSection: string = 'overview';

	function scrollToSection(id: string) {
		activeSection = id;
		document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
	}
</script>

<svelte:head>
	<title>Documentation - COS</title>
</svelte:head>

<div class="min-h-screen bg-white dark:bg-gray-900">
	<div class="container mx-auto px-4 py-8">
		<div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
			<!-- Sidebar Navigation -->
			<aside class="lg:col-span-1">
				<div class="sticky top-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
					<h2 class="text-lg font-bold mb-4 dark:text-white">Documentation</h2>
					<nav class="space-y-2">
						<button
							onclick={() => scrollToSection('overview')}
							class="block w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition {activeSection ===
							'overview'
								? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-medium'
								: 'text-gray-700 dark:text-gray-300'}"
						>
							Overview
						</button>
						<button
							onclick={() => scrollToSection('users')}
							class="block w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition {activeSection ===
							'users'
								? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-medium'
								: 'text-gray-700 dark:text-gray-300'}"
						>
							For Users
						</button>
						<button
							onclick={() => scrollToSection('canteen')}
							class="block w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition {activeSection ===
							'canteen'
								? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-medium'
								: 'text-gray-700 dark:text-gray-300'}"
						>
							For Canteen Managers
						</button>
						<button
							onclick={() => scrollToSection('developers')}
							class="block w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition {activeSection ===
							'developers'
								? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-medium'
								: 'text-gray-700 dark:text-gray-300'}"
						>
							For Developers
						</button>
						<button
							onclick={() => scrollToSection('stakeholders')}
							class="block w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition {activeSection ===
							'stakeholders'
								? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-medium'
								: 'text-gray-700 dark:text-gray-300'}"
						>
							For Stakeholders
						</button>
					</nav>
				</div>
			</aside>

			<!-- Main Content -->
			<main class="lg:col-span-3">
				<div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
					<!-- Overview Section -->
					<section id="overview" class="mb-12 scroll-mt-4">
						<h1 class="text-4xl font-bold mb-6 dark:text-white">Central Ordering System (COS)</h1>
						<p class="text-lg text-gray-700 dark:text-gray-300 mb-4">
							COS is a comprehensive web application designed to streamline canteen ordering
							processes. It enables students and staff to browse menus, place orders, and track
							their status in real-time, while providing canteen managers with powerful tools to
							manage operations efficiently.
						</p>

						<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
							<div class="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/30">
								<h3 class="text-xl font-semibold mb-2 dark:text-white">Real-time Updates</h3>
								<p class="text-gray-700 dark:text-gray-300">
									Get instant notifications about order status changes through Server-Sent Events
									and Web Push notifications.
								</p>
							</div>
							<div class="p-6 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg border border-cyan-100 dark:border-cyan-900/30">
								<h3 class="text-xl font-semibold mb-2 dark:text-white">Shared Baskets</h3>
								<p class="text-gray-700 dark:text-gray-300">
									Create group orders with friends and colleagues, perfect for coordinating team
									meals.
								</p>
							</div>
							<div class="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900/30">
								<h3 class="text-xl font-semibold mb-2 dark:text-white">PWA Support</h3>
								<p class="text-gray-700 dark:text-gray-300">
									Install COS as a Progressive Web App on your device for a native app-like
									experience.
								</p>
							</div>
							<div class="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/30">
								<h3 class="text-xl font-semibold mb-2 dark:text-white">Flexible Menu Management</h3>
								<p class="text-gray-700 dark:text-gray-300">
									Customize menu items with variants, addons, and operating hours to match your
									needs.
								</p>
							</div>
						</div>
					</section>

					<!-- Users Section -->
					<section id="users" class="mb-12 scroll-mt-4">
						<h2 class="text-3xl font-bold mb-6 dark:text-white">For Users (Consumers)</h2>

						<div class="space-y-6">
							<div>
								<h3 class="text-2xl font-semibold mb-3 dark:text-white">Getting Started</h3>
								<ol class="list-decimal ml-6 space-y-2 text-gray-700 dark:text-gray-300">
									<li>Log in using your institutional credentials</li>
									<li>Browse available canteens and their menus</li>
									<li>Add items to your basket with desired variants and addons</li>
									<li>Proceed to checkout and place your order</li>
									<li>Track your order status in real-time from the Orders page</li>
								</ol>
							</div>

							<div>
								<h3 class="text-2xl font-semibold mb-3 dark:text-white">Browsing Menus</h3>
								<p class="text-gray-700 dark:text-gray-300 mb-2">
									Navigate to the Menu section to view all available canteens. Each canteen displays:
								</p>
								<ul class="list-disc ml-6 space-y-1 text-gray-700 dark:text-gray-300">
									<li>Operating hours and current status (open/closed)</li>
									<li>Available menu items with descriptions and prices</li>
									<li>Item variants (e.g., sizes, flavors)</li>
									<li>Optional addons and customizations</li>
									<li>Dietary information and food type indicators</li>
								</ul>
							</div>

							<div>
								<h3 class="text-2xl font-semibold mb-3 dark:text-white">Placing Orders</h3>
								<p class="text-gray-700 dark:text-gray-300 mb-2">
									There are two ways to place orders:
								</p>
								<div class="ml-6 space-y-3">
									<div>
										<h4 class="font-semibold text-gray-900 dark:text-white">Individual Orders</h4>
										<p class="text-gray-700 dark:text-gray-300">
											Add items to your basket, set a pickup time, and complete the order. You'll
											receive notifications as your order is prepared.
										</p>
									</div>
									<div>
										<h4 class="font-semibold text-gray-900 dark:text-white">Shared Baskets</h4>
										<p class="text-gray-700 dark:text-gray-300">
											Create a shared basket and invite others using a shareable link. Everyone can
											add their items, and the basket creator confirms the final order. Perfect for
											group lunches!
										</p>
									</div>
								</div>
							</div>

							<div>
								<h3 class="text-2xl font-semibold mb-3 dark:text-white">Managing Your Account</h3>
								<ul class="list-disc ml-6 space-y-1 text-gray-700 dark:text-gray-300">
									<li>View your profile and update personal information</li>
									<li>Check your order history and transaction records</li>
									<li>Manage notification preferences</li>
									<li>View your account balance and add funds</li>
								</ul>
							</div>

							<div>
								<h3 class="text-2xl font-semibold mb-3 dark:text-white">Notifications</h3>
								<p class="text-gray-700 dark:text-gray-300 mb-2">
									Stay informed about your orders through multiple channels:
								</p>
								<ul class="list-disc ml-6 space-y-1 text-gray-700 dark:text-gray-300">
									<li>In-app notifications for order status changes</li>
									<li>Web push notifications (requires permission)</li>
									<li>Email notifications for important updates</li>
									<li>Real-time updates on the Orders page via SSE</li>
								</ul>
							</div>
						</div>
					</section>

					<!-- Canteen Managers Section -->
					<section id="canteen" class="mb-12 scroll-mt-4">
						<h2 class="text-3xl font-bold mb-6 dark:text-white">For Canteen Managers</h2>

						<div class="space-y-6">
							<div>
								<h3 class="text-2xl font-semibold mb-3 dark:text-white">Dashboard Overview</h3>
								<p class="text-gray-700 dark:text-gray-300 mb-2">
									Your canteen dashboard provides real-time insights into operations:
								</p>
								<ul class="list-disc ml-6 space-y-1 text-gray-700 dark:text-gray-300">
									<li>Today's revenue and order statistics</li>
									<li>Pending orders requiring attention</li>
									<li>Popular menu items and trends</li>
									<li>Quick access to order management</li>
								</ul>
							</div>

							<div>
								<h3 class="text-2xl font-semibold mb-3 dark:text-white">Managing Menu Items</h3>
								<p class="text-gray-700 dark:text-gray-300 mb-2">
									From the Items page, you can:
								</p>
								<ul class="list-disc ml-6 space-y-1 text-gray-700 dark:text-gray-300">
									<li>Add new menu items with descriptions, prices, and images</li>
									<li>Create item variants (e.g., Small, Medium, Large)</li>
									<li>Define optional addons with additional charges</li>
									<li>Set availability status and mark items as out of stock</li>
									<li>Categorize items by type (Veg, Non-Veg, Vegan, etc.)</li>
									<li>Update item details and pricing in real-time</li>
								</ul>
							</div>

							<div>
								<h3 class="text-2xl font-semibold mb-3 dark:text-white">Order Management</h3>
								<p class="text-gray-700 dark:text-gray-300 mb-2">
									Process incoming orders efficiently:
								</p>
								<ol class="list-decimal ml-6 space-y-2 text-gray-700 dark:text-gray-300">
									<li>
										<strong>New Orders:</strong> Review order details including items, customer info,
										and special requests
									</li>
									<li>
										<strong>Accept/Reject:</strong> Confirm orders you can fulfill or reject with a reason
									</li>
									<li>
										<strong>Update Status:</strong> Mark orders as preparing, ready for pickup, or completed
									</li>
									<li>
										<strong>Communication:</strong> Customers receive automatic notifications at each
										stage
									</li>
								</ol>
							</div>

							<div>
								<h3 class="text-2xl font-semibold mb-3 dark:text-white">Operating Hours</h3>
								<p class="text-gray-700 dark:text-gray-300 mb-2">
									Configure your canteen's schedule:
								</p>
								<ul class="list-disc ml-6 space-y-1 text-gray-700 dark:text-gray-300">
									<li>Set daily operating hours for each day of the week</li>
									<li>Mark special closure days or holidays</li>
									<li>Temporarily close for breaks or maintenance</li>
									<li>
										System automatically prevents orders outside operating hours
									</li>
								</ul>
							</div>

							<div>
								<h3 class="text-2xl font-semibold mb-3 dark:text-white">Analytics & Reports</h3>
								<p class="text-gray-700 dark:text-gray-300">
									Access detailed insights about your canteen's performance including revenue trends,
									popular items, peak ordering times, and customer preferences to make informed
									business decisions.
								</p>
							</div>
						</div>
					</section>

					<!-- Developers Section -->
					<section id="developers" class="mb-12 scroll-mt-4">
						<h2 class="text-3xl font-bold mb-6 dark:text-white">For Developers</h2>

						<div class="space-y-6">
							<div>
								<h3 class="text-2xl font-semibold mb-3 dark:text-white">Technology Stack</h3>
								<div class="grid grid-cols-2 gap-4 mt-3">
									<div>
										<h4 class="font-semibold text-gray-900 dark:text-white mb-2">Frontend</h4>
										<ul class="list-disc ml-6 text-gray-700 dark:text-gray-300 space-y-1">
											<li>SvelteKit (Svelte 5)</li>
											<li>Tailwind CSS v4</li>
											<li>TypeScript</li>
											<li>Lucide & Phosphor Icons</li>
										</ul>
									</div>
									<div>
										<h4 class="font-semibold text-gray-900 dark:text-white mb-2">Backend</h4>
										<ul class="list-disc ml-6 text-gray-700 dark:text-gray-300 space-y-1">
											<li>PostgreSQL</li>
											<li>Drizzle ORM</li>
											<li>Server-Sent Events</li>
											<li>Web Push API</li>
										</ul>
									</div>
								</div>
							</div>

							<div>
								<h3 class="text-2xl font-semibold mb-3 dark:text-white">Project Structure</h3>
								<div class="bg-gray-900 dark:bg-gray-950 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto border border-gray-700">
									<pre>src/
├── lib/
│   ├── components/        # Reusable UI components
│   ├── server/            # Server-side logic
│   │   ├── db/           # Database schema & connection
│   │   ├── emailService.ts
│   │   ├── notificationService.ts
│   │   └── sse-events.ts
│   └── utils/            # Utility functions
├── routes/               # SvelteKit routes
│   ├── api/             # API endpoints
│   ├── auth/            # Authentication
│   ├── basket/          # Basket management
│   ├── canteen/         # Canteen operations
│   ├── menu/            # Menu browsing
│   ├── orders/          # Order tracking
│   └── ...
└── static/              # Static assets & PWA files</pre>
								</div>
							</div>

							<div>
								<h3 class="text-2xl font-semibold mb-3 dark:text-white">Development Setup</h3>
								<p class="text-gray-700 dark:text-gray-300 mb-3">Prerequisites: Node.js 20+, Docker, pnpm</p>
								<div class="bg-gray-900 dark:bg-gray-950 text-gray-100 p-4 rounded-lg font-mono text-sm space-y-2 border border-gray-700">
									<div># Clone repository</div>
									<div class="text-green-400">git clone [repository-url]</div>
									<div class="text-green-400">cd cos</div>
									<div class="mt-3"># Install dependencies</div>
									<div class="text-green-400">pnpm install</div>
									<div class="mt-3"># Start database</div>
									<div class="text-green-400">npm run db:start</div>
									<div class="mt-3"># Push schema</div>
									<div class="text-green-400">npm run db:push</div>
									<div class="mt-3"># Start dev server</div>
									<div class="text-green-400">npm run dev</div>
								</div>
							</div>

							<div>
								<h3 class="text-2xl font-semibold mb-3 dark:text-white">Key Features to Understand</h3>
								<div class="space-y-3">
									<div>
										<h4 class="font-semibold text-gray-900 dark:text-white">Server-Sent Events (SSE)</h4>
										<p class="text-gray-700 dark:text-gray-300">
											Real-time order updates are pushed to clients via SSE. The implementation is in
											<code class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">src/lib/server/sse-events.ts</code>
											with endpoints under
											<code class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">src/routes/api/sse/</code>.
										</p>
									</div>
									<div>
										<h4 class="font-semibold text-gray-900 dark:text-white">Session Management</h4>
										<p class="text-gray-700 dark:text-gray-300">
											Uses secure session cookies with Argon2 password hashing. Session handling is in
											<code class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">src/lib/server/session.ts</code>.
										</p>
									</div>
									<div>
										<h4 class="font-semibold text-gray-900 dark:text-white">Database Schema</h4>
										<p class="text-gray-700 dark:text-gray-300">
											Drizzle ORM schema definitions are in
											<code class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">src/lib/server/db/schema.ts</code
											>. Use <code class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">npm run db:studio</code> to
											explore the database visually.
										</p>
									</div>
									<div>
										<h4 class="font-semibold text-gray-900 dark:text-white">PWA Configuration</h4>
										<p class="text-gray-700 dark:text-gray-300">
											Service worker and manifest files are in the
											<code class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">static/</code> directory. Web Push
											notifications use VAPID keys for authentication.
										</p>
									</div>
								</div>
							</div>

							<div>
								<h3 class="text-2xl font-semibold mb-3 dark:text-white">API Endpoints</h3>
								<div class="space-y-2">
									<div class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded border border-gray-200 dark:border-gray-600">
										<code class="font-semibold dark:text-blue-300">/api/sse/orders/*</code>
										<span class="text-gray-600 dark:text-gray-400 ml-2">- Server-Sent Events for order updates</span>
									</div>
									<div class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded border border-gray-200 dark:border-gray-600">
										<code class="font-semibold dark:text-blue-300">/api/push/subscribe</code>
										<span class="text-gray-600 dark:text-gray-400 ml-2">- Subscribe to push notifications</span>
									</div>
									<div class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded border border-gray-200 dark:border-gray-600">
										<code class="font-semibold dark:text-blue-300">/api/push/unsubscribe</code>
										<span class="text-gray-600 dark:text-gray-400 ml-2">- Unsubscribe from push notifications</span>
									</div>
									<div class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded border border-gray-200 dark:border-gray-600">
										<code class="font-semibold dark:text-blue-300">/api/push/vapid-key</code>
										<span class="text-gray-600 dark:text-gray-400 ml-2">- Get VAPID public key</span>
									</div>
								</div>
							</div>

							<div>
								<h3 class="text-2xl font-semibold mb-3 dark:text-white">Contributing Guidelines</h3>
								<ul class="list-disc ml-6 space-y-1 text-gray-700 dark:text-gray-300">
									<li>Follow the existing code style and use Prettier for formatting</li>
									<li>Write TypeScript with proper type definitions</li>
									<li>Use SvelteKit's form actions for server-side operations</li>
									<li>Test changes locally with Docker database before committing</li>
									<li>Keep components small and focused on single responsibilities</li>
									<li>Document complex logic with comments</li>
								</ul>
							</div>
						</div>
					</section>

					<!-- Stakeholders Section -->
					<section id="stakeholders" class="mb-12 scroll-mt-4">
						<h2 class="text-3xl font-bold mb-6 dark:text-white">For Stakeholders</h2>

						<div class="space-y-6">
							<div>
								<h3 class="text-2xl font-semibold mb-3 dark:text-white">Business Value</h3>
								<p class="text-gray-700 dark:text-gray-300 mb-3">
									COS streamlines canteen operations and improves customer satisfaction through:
								</p>
								<ul class="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300">
									<li>
										<strong>Reduced Wait Times:</strong> Pre-orders allow canteens to prepare food in
										advance, minimizing customer wait times
									</li>
									<li>
										<strong>Improved Efficiency:</strong> Digital order management eliminates manual
										order taking and reduces errors
									</li>
									<li>
										<strong>Better Planning:</strong> Analytics help canteens forecast demand and manage
										inventory effectively
									</li>
									<li>
										<strong>Enhanced Experience:</strong> Real-time updates and notifications keep customers
										informed and satisfied
									</li>
								</ul>
							</div>

							<div>
								<h3 class="text-2xl font-semibold mb-3 dark:text-white">Key Metrics</h3>
								<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-900/30">
										<h4 class="font-semibold text-blue-900 dark:text-blue-300 mb-2">Operational Efficiency</h4>
										<p class="text-gray-700 dark:text-gray-300 text-sm">
											Track order processing times, completion rates, and staff productivity
										</p>
									</div>
									<div class="bg-cyan-50 dark:bg-cyan-900/20 p-4 rounded-lg border border-cyan-100 dark:border-cyan-900/30">
										<h4 class="font-semibold text-cyan-900 dark:text-cyan-300 mb-2">Revenue Insights</h4>
										<p class="text-gray-700 dark:text-gray-300 text-sm">
											Monitor daily revenue, popular items, and peak ordering periods
										</p>
									</div>
									<div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-900/30">
										<h4 class="font-semibold text-green-900 dark:text-green-300 mb-2">Customer Satisfaction</h4>
										<p class="text-gray-700 dark:text-gray-300 text-sm">
											Measure order accuracy, delivery times, and user engagement
										</p>
									</div>
									<div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-900/30">
										<h4 class="font-semibold text-blue-900 dark:text-blue-300 mb-2">System Performance</h4>
										<p class="text-gray-700 dark:text-gray-300 text-sm">
											Monitor uptime, response times, and concurrent user capacity
										</p>
									</div>
								</div>
							</div>

							<div>
								<h3 class="text-2xl font-semibold mb-3 dark:text-white">Security & Privacy</h3>
								<p class="text-gray-700 dark:text-gray-300 mb-3">
									COS implements industry-standard security practices:
								</p>
								<ul class="list-disc ml-6 space-y-1 text-gray-700 dark:text-gray-300">
									<li>Secure password hashing with Argon2</li>
									<li>Session-based authentication with secure cookies</li>
									<li>HTTPS encryption for all data transmission</li>
									<li>Regular security updates and dependency management</li>
									<li>Data privacy compliance with user consent for notifications</li>
									<li>Database access controls and connection pooling</li>
								</ul>
							</div>

							<div>
								<h3 class="text-2xl font-semibold mb-3 dark:text-white">Scalability</h3>
								<p class="text-gray-700 dark:text-gray-300 mb-3">
									The system is designed to scale with institutional needs:
								</p>
								<ul class="list-disc ml-6 space-y-1 text-gray-700 dark:text-gray-300">
									<li>
										<strong>Horizontal Scaling:</strong> Can be deployed across multiple instances with
										load balancing
									</li>
									<li>
										<strong>Database Optimization:</strong> PostgreSQL with proper indexing handles high
										transaction volumes
									</li>
									<li>
										<strong>Containerized Deployment:</strong> Docker enables consistent deployment across
										environments
									</li>
									<li>
										<strong>Efficient Updates:</strong> SSE reduces polling overhead compared to traditional
										REST APIs
									</li>
								</ul>
							</div>

							<div>
								<h3 class="text-2xl font-semibold mb-3 dark:text-white">Integration Capabilities</h3>
								<p class="text-gray-700 dark:text-gray-300 mb-3">
									COS can integrate with existing systems:
								</p>
								<ul class="list-disc ml-6 space-y-1 text-gray-700 dark:text-gray-300">
									<li>Email notifications via Azure Communication Services</li>
									<li>Payment gateway integration for digital transactions</li>
									<li>Identity management system integration for SSO</li>
									<li>Analytics platforms for business intelligence</li>
									<li>REST API endpoints for third-party integrations</li>
								</ul>
							</div>

							<div>
								<h3 class="text-2xl font-semibold mb-3 dark:text-white">Support & Maintenance</h3>
								<p class="text-gray-700 dark:text-gray-300 mb-3">Ongoing support includes:</p>
								<ul class="list-disc ml-6 space-y-1 text-gray-700 dark:text-gray-300">
									<li>Regular feature updates and improvements</li>
									<li>Bug fixes and security patches</li>
									<li>Performance monitoring and optimization</li>
									<li>Database backup and disaster recovery procedures</li>
									<li>Technical support for canteen managers and administrators</li>
								</ul>
							</div>

							<div>
								<h3 class="text-2xl font-semibold mb-3 dark:text-white">Future Roadmap</h3>
								<p class="text-gray-700 dark:text-gray-300 mb-3">Planned enhancements include:</p>
								<ul class="list-disc ml-6 space-y-1 text-gray-700 dark:text-gray-300">
									<li>Advanced analytics dashboard with predictive insights</li>
									<li>Mobile native applications for iOS and Android</li>
									<li>Loyalty programs and reward points system</li>
									<li>Integration with campus ID cards for seamless payments</li>
									<li>Expanded notification channels (SMS, WhatsApp)</li>
									<li>Multi-language support for diverse user bases</li>
								</ul>
							</div>
						</div>
					</section>

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
