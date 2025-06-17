<script lang="ts">
	import { NavigationMenu } from 'bits-ui'
	import { page } from '$app/state'
	import {
		Utensils,
		History,
		ShoppingBasket,
		User,
		LogIn,
		CookingPot,
	} from 'lucide-svelte'

	const getNavigationComponents = (userRole: string | undefined) => {
		if (userRole === 'canteen') {
			return [
				{
					title: 'Dashboard',
					href: '/canteen/dashboard',
					img: Utensils,
				},
			]
		}

		// Default components for consumers and other users
		return [
			{
				title: 'Dashboard',
				href: '/dashboard',
				img: Utensils,
			},
			{
				title: 'Menu',
				href: '/menu',
				img: CookingPot,
			},
			{
				title: 'Basket',
				href: '/basket',
				img: ShoppingBasket,
			},
			{
				title: 'Orders',
				href: '/orders',
				img: History,
			},
		]
	}

	$: components = getNavigationComponents(page.data.user?.role)
</script>

<nav
	class="fixed bottom-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 md:sticky md:top-0 dark:border-gray-800 dark:bg-gray-900/95 dark:supports-[backdrop-filter]:bg-gray-900/60"
>
	<div class="mx-auto w-full px-4 md:px-6 lg:px-8">
		<div class="flex h-16 items-center justify-between">
			<!-- Logo -->
			<div class="flex hidden items-center md:inline">
				<a href="/" class="flex items-center space-x-2">
					<div
						class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400"
					>
						<span class="text-md font-bold text-white">C</span>
					</div>
					<span class="text-xl font-bold text-gray-900 dark:text-white"
						>Canteen Ordering System</span
					>
				</a>
			</div>

			<NavigationMenu.Root
				class="relative z-10 flex inline w-full justify-between md:w-auto"
				orientation="vertical"
			>
				<NavigationMenu.List class="group flex list-none items-center justify-between p-1">
					{#each components as component}
						<NavigationMenu.Item>
							<NavigationMenu.Link
								class="hover:text-accent-foreground focus:bg-muted focus:text-accent-foreground data-[state=open]:shadow-mini dark:hover:bg-muted dark:data-[state=open]:bg-muted group text-md inline-flex h-8 w-[18vw] items-center justify-center rounded-[7px] bg-transparent px-4 py-2 py-6 font-medium transition-colors hover:bg-white focus:outline-hidden disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-white md:w-max {page
									.url.pathname === component.href
									? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
									: ''}"
								href={component.href}
								active={page.url.pathname === component.href}
							>
								<div class="flex flex-col items-center justify-center">
									<component.img class="md:hidden" />
									<span class="text-[9px] md:text-sm"> {component.title} </span>
								</div>
							</NavigationMenu.Link>
						</NavigationMenu.Item>
					{/each}
					{#if !page.data.user}
						<NavigationMenu.Item>
							<NavigationMenu.Link
								class="hover:text-accent-foreground focus:bg-muted focus:text-accent-foreground data-[state=open]:shadow-mini dark:hover:bg-muted dark:data-[state=open]:bg-muted group text-md inline-flex h-8 w-[18vw] items-center justify-center rounded-[7px] bg-transparent px-4 py-2 py-6 font-medium transition-colors hover:bg-white focus:outline-hidden disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-white md:w-max {page
									.url.pathname === '/login'
									? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
									: ''}"
								href="/login"
							>
								<div class="flex flex-col items-center justify-center">
									<LogIn class="md:hidden" />
									<span class="text-[9px] md:text-sm"> Login </span>
								</div>
							</NavigationMenu.Link>
						</NavigationMenu.Item>
					{:else}
						<NavigationMenu.Item>
							<NavigationMenu.Link
								class="hover:text-accent-foreground focus:bg-muted focus:text-accent-foreground data-[state=open]:shadow-mini dark:hover:bg-muted dark:data-[state=open]:bg-muted group text-md inline-flex h-8 w-[18vw] items-center justify-center rounded-[7px] bg-transparent px-4 py-2 py-6 font-medium transition-colors hover:bg-white focus:outline-hidden disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-white md:w-max {page
									.url.pathname === '/profile'
									? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
									: ''}"
								href="/profile"
							>
								<div class="flex flex-col items-center justify-center">
									<User class="md:hidden" />
									<span class="text-[9px] md:text-sm"> Profile </span>
								</div>
							</NavigationMenu.Link>
						</NavigationMenu.Item>
					{/if}
					<NavigationMenu.Indicator
						class="data-[state=hidden]:animate-fade-out data-[state=visible]:animate-fade-in top-full z-10 flex h-2.5 items-end justify-center overflow-hidden opacity-100 transition-[all,transform_250ms_ease] duration-200 data-[state=hidden]:opacity-0"
					>
						<div
							class="bg-border relative top-[70%] size-2.5 rotate-[45deg] rounded-tl-[2px]"
						></div>
					</NavigationMenu.Indicator>
				</NavigationMenu.List>
				<NavigationMenu.Viewport
					forceMount
					class="text-popover-foreground bg-background data-[state=closed]:animate-scale-out data-[state=open]:animate-scale-in relative mt-2.5 h-[var(--bits-navigation-menu-viewport-height)] w-full origin-[top_center] overflow-hidden rounded-md border shadow-lg transition-[width,_height] duration-200 data-[state=closed]:hidden sm:w-[var(--bits-navigation-menu-viewport-width)]"
				/>
			</NavigationMenu.Root>
		</div>
	</div>
</nav>
