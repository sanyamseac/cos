<script lang="ts">
	import { Clock, Smartphone, ChefHat, Zap } from 'lucide-svelte'
</script>

<svelte:head>
	<title>IIIT Canteen Ordering System</title>
	<meta
		name="description"
		content="Order food from any IIIT canteen with ease. Skip the queue, customize your orders, and enjoy fresh meals."
	/>
</svelte:head>

<!-- Hero Section -->
<section
	class="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800"
>
	<div class="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
		<div class="text-center">
			<h1 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl dark:text-white">
				Canteens,
				<span class="text-blue-600 dark:text-blue-400">Made Simple.</span>
			</h1>
			<p class="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-300">
				Skip the queues, customize your meals, and enjoy fresh food from any IIIT canteen.
				Order ahead, and get notified when your meal is ready.
			</p>
			<div class="mt-10 flex items-center justify-center gap-x-6">
				<a
					href="/menu"
					class="rounded-md bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-all hover:bg-blue-500 focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:outline-none"
				>
					Let&apos;s Go
				</a>
				<a
					href="/about"
					class="rounded-md border border-gray-300 px-6 py-3 text-base font-semibold text-gray-900 transition-all hover:bg-gray-50 dark:border-gray-600 dark:text-white dark:hover:bg-gray-800"
				>
					Learn More
				</a>
			</div>
		</div>
	</div>
	<!-- Floating elements for visual appeal -->
	<div
		class="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-blue-100 opacity-50 blur-3xl dark:bg-blue-900/20"
	></div>
	<div
		class="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-cyan-100 opacity-50 blur-3xl dark:bg-cyan-900/20"
	></div>
</section>

<!-- Features Section -->
<section class="bg-white py-20 dark:bg-gray-900">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="text-center">
			<h2 class="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
				Why Choose Our Platform?
			</h2>
			<p class="mt-4 text-lg text-gray-600 dark:text-gray-300">
				Experience the future of campus dining with our innovative features
			</p>
		</div>

		<div class="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
			<!-- Feature 1: Skip the Queue -->
			<div class="group relative">
				<div
					class="rounded-2xl border border-gray-200 bg-white p-8 transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:hover:shadow-xl"
				>
					<div
						class="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/20"
					>
						<Clock class="h-6 w-6 text-blue-600 dark:text-blue-400" />
					</div>
					<h3 class="mt-6 text-xl font-semibold text-gray-900 dark:text-white">
						Skip the Queue
					</h3>
					<p class="mt-2 text-gray-600 dark:text-gray-300">
						Order ahead and avoid waiting in long lines. Your food will be ready when
						you arrive.
					</p>
				</div>
			</div>

			<!-- Feature 2: Easy Ordering -->
			<div class="group relative">
				<div
					class="rounded-2xl border border-gray-200 bg-white p-8 transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:hover:shadow-xl"
				>
					<div
						class="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/20"
					>
						<Smartphone class="h-6 w-6 text-green-600 dark:text-green-400" />
					</div>
					<h3 class="mt-6 text-xl font-semibold text-gray-900 dark:text-white">
						Easy Ordering
					</h3>
					<p class="mt-2 text-gray-600 dark:text-gray-300">
						Intuitive interface makes ordering your favorite meals quick and effortless.
					</p>
				</div>
			</div>

			<!-- Feature 3: Real-time Updates -->
			<div class="group relative">
				<div
					class="rounded-2xl border border-gray-200 bg-white p-8 transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:hover:shadow-xl"
				>
					<div
						class="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/20"
					>
						<Zap class="h-6 w-6 text-orange-600 dark:text-orange-400" />
					</div>
					<h3 class="mt-6 text-xl font-semibold text-gray-900 dark:text-white">
						Real-time Updates
					</h3>
					<p class="mt-2 text-gray-600 dark:text-gray-300">
						Get instant notifications about your order status and pickup times.
					</p>
				</div>
			</div>

			<!-- Feature 4: Fresh Quality -->
			<div class="group relative">
				<div
					class="rounded-2xl border border-gray-200 bg-white p-8 transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:hover:shadow-xl"
				>
					<div
						class="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/20"
					>
						<ChefHat class="h-6 w-6 text-red-600 dark:text-red-400" />
					</div>
					<h3 class="mt-6 text-xl font-semibold text-gray-900 dark:text-white">
						Fresh Quality
					</h3>
					<p class="mt-2 text-gray-600 dark:text-gray-300">
						All meals are prepared fresh with high-quality ingredients from trusted
						suppliers.
					</p>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Stats Section -->
<section class="bg-blue-50 py-20 dark:bg-gray-800">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="text-center">
			<h2 class="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
				Trusted by IIIT Community
			</h2>
		</div>
		<div class="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
			<div class="text-center">
				<div class="text-4xl font-bold text-blue-600 dark:text-blue-400">500+</div>
				<div class="mt-2 text-lg text-gray-600 dark:text-gray-300">Daily Orders</div>
			</div>
			<div class="text-center">
				<div class="text-4xl font-bold text-blue-600 dark:text-blue-400">98%</div>
				<div class="mt-2 text-lg text-gray-600 dark:text-gray-300">
					Customer Satisfaction
				</div>
			</div>
			<div class="text-center">
				<div class="text-4xl font-bold text-blue-600 dark:text-blue-400">5 min</div>
				<div class="mt-2 text-lg text-gray-600 dark:text-gray-300">Average Wait Time</div>
			</div>
		</div>
	</div>
</section>

<!-- How it Works Section -->
<section class="bg-white py-20 dark:bg-gray-900">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="text-center">
			<h2 class="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
				How It Works
			</h2>
			<p class="mt-4 text-lg text-gray-600 dark:text-gray-300">
				Get your favorite meal in just three simple steps
			</p>
		</div>

		<div class="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-3">
			<div class="text-center">
				<div
					class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20"
				>
					<span class="text-2xl font-bold text-blue-600 dark:text-blue-400">1</span>
				</div>
				<h3 class="mt-6 text-xl font-semibold text-gray-900 dark:text-white">
					Browse & Order
				</h3>
				<p class="mt-2 text-gray-600 dark:text-gray-300">
					Explore our menu, customize your meal, and place your order in seconds.
				</p>
			</div>

			<!-- Step 2: Get Notified -->
			<div class="text-center">
				<div
					class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20"
				>
					<span class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">2</span>
				</div>
				<h3 class="mt-6 text-xl font-semibold text-gray-900 dark:text-white">
					Get Notified
				</h3>
				<p class="mt-2 text-gray-600 dark:text-gray-300">
					Receive real-time updates and notifications when your meal is ready for pickup.
				</p>
			</div>

			<!-- Step 3: Collect & Enjoy -->
			<div class="text-center">
				<div
					class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20"
				>
					<span class="text-2xl font-bold text-purple-600 dark:text-purple-400">3</span>
				</div>
				<h3 class="mt-6 text-xl font-semibold text-gray-900 dark:text-white">
					Collect & Enjoy
				</h3>
				<p class="mt-2 text-gray-600 dark:text-gray-300">
					Collect your freshly prepared meal and enjoy!
				</p>
			</div>
		</div>
	</div>
</section>

<!-- CTA Section -->
<section class="bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-800 dark:to-cyan-800">
	<div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
		<div class="text-center">
			<h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">
				Ready to Start Ordering?
			</h2>
			<p class="mt-4 text-xl text-blue-100">
				Join the (soon to be) hundreds of students who have already made the switch to smart
				ordering.
			</p>
			<div class="mt-8">
				<a
					href="/menu"
					class="inline-block rounded-md bg-white px-8 py-3 text-base font-semibold text-blue-600 shadow-sm transition-all hover:bg-gray-50"
				>
					Start Ordering Now
				</a>
			</div>
		</div>
	</div>
</section>
