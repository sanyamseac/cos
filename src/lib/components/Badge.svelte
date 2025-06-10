<script lang="ts">
	interface BadgeProps {
		class?: string
		variant?: 'default' | 'secondary' | 'destructive' | 'outline'
		size?: 'default' | 'sm' | 'lg'
		children?: any
	}

	let {
		class: className = '',
		variant = 'default',
		size = 'default',
		children,
		...restProps
	}: BadgeProps = $props()

	const baseClasses =
		'inline-flex items-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'

	const variants = {
		default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
		secondary: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
		destructive: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
		outline: 'border border-gray-200 text-gray-700 dark:border-gray-600 dark:text-gray-300',
	}

	const sizes = {
		default: 'px-2.5 py-0.5 text-xs',
		sm: 'px-2 py-0.5 text-xs',
		lg: 'px-3 py-1 text-sm',
	}

	// If custom classes are provided, use them instead of default variant classes
	const finalClasses =
		className.includes('bg-') || className.includes('text-')
			? `${baseClasses} ${sizes[size]} ${className}`
			: `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`
</script>

<span class={finalClasses} {...restProps}>
	{@render children?.()}
</span>
