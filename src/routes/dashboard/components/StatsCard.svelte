<script lang="ts">
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
		small: 'p-4 min-h-[120px]',
		medium: 'p-4 min-h-[140px]',
		large: 'p-4 min-h-[200px]',
		wide: 'p-6 min-w-[140px]',
	}

	const gradientClasses = {
		blue: 'bg-gradient-to-br from-blue-500 to-blue-700 text-white',
		emerald: 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white',
		purple: 'bg-gradient-to-br from-purple-500 to-purple-700 text-white',
		orange: 'bg-gradient-to-br from-orange-500 to-orange-700 text-white',
		pink: 'bg-gradient-to-br from-pink-500 to-pink-700 text-white',
		teal: 'bg-gradient-to-br from-teal-500 to-teal-700 text-white',
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
	class="transform rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl {sizeClasses[
		size
	]} {gradientClasses[gradient]}"
>
	<div class="flex-1">
		<p class="text-sm font-medium opacity-90 {textColorClasses[gradient]}">{title}</p>
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
			<p class="mt-3 flex items-center gap-1 text-xs opacity-90">
				<span
					class={trendUp
						? 'rounded-full bg-white/20 px-2 py-1 text-white'
						: 'rounded-full bg-white/20 px-2 py-1 text-white'}
				>
					{trendUp ? '📈' : '📉'}
				</span>
				<span class="text-white/90">{trend}</span>
			</p>
		{/if}
	</div>
</div>
