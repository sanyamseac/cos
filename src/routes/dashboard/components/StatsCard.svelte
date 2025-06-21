<script lang="ts">
	import { ChartLineDown, ChartLineUp } from 'phosphor-svelte'
	interface Props {
		title: string
		value: string
		trend?: string
		trendUp?: boolean
		size?: 'small' | 'medium' | 'large' | 'wide' | 'tall'
		gradient?: 'blue' | 'emerald' | 'purple' | 'orange' | 'pink' | 'teal'
	}

	let {
		title,
		value,
		trend,
		trendUp = true,
		size = 'medium',
		gradient = 'blue',
	}: Props = $props()

	const sizeClasses = {
		small: 'p-4 min-h-[80px]',
		medium: 'p-4 min-h-[100px]',
		large: 'p-4 min-h-[200px]',
		wide: 'p-6 min-w-[140px]',
		tall: 'p-4 min-h-[300px]',
	}

	const textColorClasses = {
		blue: 'text-blue-100',
		emerald: 'text-emerald-100',
		purple: 'text-purple-100',
		orange: 'text-orange-100',
		pink: 'text-pink-100',
		teal: 'text-teal-100',
	}
</script>

<div
	class="transform rounded-xl shadow-lg transition-all duration-300 border {sizeClasses[size]}"
>
	<div class="flex-1">
		<p class="text-sm font-medium opacity-90 dark:text-white">{title}</p>
		<p
			class="mt-2 text-3xl font-bold {size === 'large'
				? 'text-4xl'
				: size === 'tall'
					? 'text-2xl'
					: ''}"
		>
			{value}
		</p>
		{#if trend}
			<div class="mt-3 mb-1 flex items-center gap-1">
				{#if trendUp}
					<ChartLineUp class="dark:text-white" />
				{:else}
					<ChartLineDown class="dark:text-white" />
				{/if}
				<p class=" text-xs opacity-90">
					<span class="dark:text-white/90">{trend}</span>
				</p>
			</div>
		{/if}
	</div>
</div>
