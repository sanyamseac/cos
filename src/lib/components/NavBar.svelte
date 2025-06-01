<script lang="ts">
	import { Select, NavigationMenu } from "bits-ui";
	import { onMount } from "svelte";
	import { page } from '$app/state';
	import Check from "phosphor-svelte/lib/Check";
	import Palette from "phosphor-svelte/lib/Palette";
	import CaretUpDown from "phosphor-svelte/lib/CaretUpDown";
	import CaretDoubleUp from "phosphor-svelte/lib/CaretDoubleUp";
	import CaretDoubleDown from "phosphor-svelte/lib/CaretDoubleDown";
	import Airplane from "phosphor-svelte/lib/Airplane";
	import SignIn from "phosphor-svelte/lib/SignIn";
	import { Utensils, History, ShoppingBasket, User, LogIn, CookingPot } from "lucide-svelte";

	type ThemeMode = string;

	const themes = [
		{ value: "light", label: "Light" },
		{ value: "dark", label: "Dark" },
		{ value: "system", label: "System" },
	];

	const components: { title: string; href: string; img: any}[] = [
		{
			title: "Dashboard",
			href: "/dashboard",
			img: Utensils
		},
		{
			title: "Menu",
			href: "/menu",
			img: CookingPot
		},
		{
			title: "Basket",
			href: "/basket",
			img: ShoppingBasket
		},
		{
			title: "Orders",
			href: "/orders",
			img: History
		},
	];

	let themeMode = $state<string>('system')

	function updateTheme(mode: string) {
		themeMode = mode

		if (mode === 'system') {
			// Follow system preference
			const isDarkSystem = window.matchMedia('(prefers-color-scheme: dark)').matches
			if (isDarkSystem) {
				document.documentElement.classList.add('dark')
			} else {
				document.documentElement.classList.remove('dark')
			}
		} else if (mode === 'dark') {
			document.documentElement.classList.add('dark')
		} else {
			document.documentElement.classList.remove('dark')
		}
	}

	function getThemeLabel(mode: ThemeMode) {
		return themes.find(theme => theme.value === mode)?.label || 'System';
	}

	const FullName = $derived(getThemeLabel(themeMode));

	onMount(() => {
		themeMode = localStorage.getItem('theme') as string
		updateTheme(themeMode)
	})

	$effect(() => {
		localStorage.setItem('theme', themeMode)
	})
</script>
<nav
	class="fixed bottom-0 md:top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-gray-800 dark:bg-gray-900/95 dark:supports-[backdrop-filter]:bg-gray-900/60"
>
	<div class="mx-auto w-full px-4 md:px-6 lg:px-8">
		<div class="flex h-16 items-center justify-between">
			<!-- Logo -->
			<div class="hidden flex items-center md:inline">
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

			<NavigationMenu.Root class="relative w-full md:w-auto z-10 flex justify-between inline" orientation="vertical">
				<NavigationMenu.List
					class="group flex list-none items-center justify-between p-1"
				>
					{#each components as component}
						<NavigationMenu.Item>
							<NavigationMenu.Link
								class="hover:text-accent-foreground focus:bg-muted focus:text-accent-foreground data-[state=open]:shadow-mini dark:hover:bg-muted dark:data-[state=open]:bg-muted focus:outline-hidden group inline-flex h-8 w-max items-center justify-center rounded-[7px] bg-transparent px-4 py-2 text-md font-medium transition-colors hover:bg-white disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-white"
								href={component.href}
							>
								<component.img class="md:hidden"/>
								<span class="hidden md:inline"> {component.title} </span>
							</NavigationMenu.Link>
						</NavigationMenu.Item>
					{/each}
					{#if !page.data.user}
						<NavigationMenu.Item>
							<NavigationMenu.Link
								class="hover:text-accent-foreground focus:bg-muted focus:text-accent-foreground data-[state=open]:shadow-mini dark:hover:bg-muted dark:data-[state=open]:bg-muted focus:outline-hidden group inline-flex h-8 w-max items-center justify-center rounded-[7px] bg-transparent px-4 py-2 text-md font-medium transition-colors hover:bg-white disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-white"
								href="/login"
							>
								<LogIn />
								<span class="hidden md:inline"> Login </span>
							</NavigationMenu.Link>
						</NavigationMenu.Item>
					{:else}
						<NavigationMenu.Item>
							<NavigationMenu.Link
								class="hover:text-accent-foreground focus:bg-muted focus:text-accent-foreground data-[state=open]:shadow-mini dark:hover:bg-muted dark:data-[state=open]:bg-muted focus:outline-hidden group inline-flex h-8 w-max items-center justify-center rounded-[7px] bg-transparent px-4 py-2 text-md font-medium transition-colors hover:bg-white disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-white"
								href="/profile"
							>
								<User />
								<span class="hidden md:inline"> Profile </span>
							</NavigationMenu.Link>
						</NavigationMenu.Item>
					{/if}
					<!-- <NavigationMenu.Item>
						<Select.Root type="single" onValueChange={(value) => updateTheme(value as ThemeMode)} items={themes} value={themeMode}>
							<Select.Trigger
								class="m-2 h-10 rounded-9px border-border-input bg-background data-placeholder:text-foreground-alt/50 inline-flex w-[120px] select-none items-center border px-[8px] text-md transition-colors"
								aria-label="Select a theme"
							>
								<Palette class="text-muted-foreground mr-[9px] size-5" />
								{FullName}
								<CaretUpDown class="text-muted-foreground ml-auto size-5" />
							</Select.Trigger>
							<Select.Portal>
								<Select.Content
								class="focus-override border-muted bg-background shadow-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 outline-hidden z-50 h-38 max-h-[var(--bits-select-content-available-height)] w-[var(--bits-select-anchor-width)] min-w-[var(--bits-select-anchor-width)] select-none rounded-xl border px-1 py-3 data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1"
								sideOffset={20}
								>
								<Select.ScrollUpButton class="flex w-full items-center justify-center">
									<CaretDoubleUp class="size-3" />
								</Select.ScrollUpButton>
								<Select.Viewport class="p-1">
									{#each themes as theme}
									<Select.Item
										class="rounded-button data-highlighted:bg-muted outline-hidden data-disabled:opacity-50 flex h-10 w-full select-none items-center py-3 pl-5 pr-1.5 text-md capitalize"
										value={theme.value}
										label={theme.label}
									>
										{#snippet children({ selected })}
										{theme.label}
										{#if selected}
											<div class="ml-auto">
											<Check aria-label="check" />
											</div>
										{/if}
										{/snippet}
									</Select.Item>
									{/each}
								</Select.Viewport>
								<Select.ScrollDownButton class="flex w-full items-center justify-center">
									<CaretDoubleDown class="size-3" />
								</Select.ScrollDownButton>
								</Select.Content>
							</Select.Portal>
						</Select.Root>
					</NavigationMenu.Item> -->
					<NavigationMenu.Indicator
					class="data-[state=hidden]:animate-fade-out data-[state=visible]:animate-fade-in top-full z-10 flex h-2.5 items-end justify-center overflow-hidden opacity-100 transition-[all,transform_250ms_ease] duration-200 data-[state=hidden]:opacity-0"
					>
					<div
						class="bg-border relative top-[70%] size-2.5 rotate-[45deg] rounded-tl-[2px]"
					></div>
					</NavigationMenu.Indicator>
				</NavigationMenu.List>
			</NavigationMenu.Root>
		</div>
	</div>
</nav>
