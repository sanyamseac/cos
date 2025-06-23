<script lang="ts">
	interface Props {
		value?: number,
		valid?: boolean
	}

	let { value = $bindable(), valid = $bindable() }: Props = $props()

	let mode = $state<'hour' | 'minute'>('hour')
	let selectedHour = $state(18)
	let selectedMinute = $state(0)

	$effect(() => {
		if (value && value > 0) {
			const date = new Date(value)
			let hour = date.getHours()
			let minute = Math.floor(date.getMinutes() / 5) * 5

			if (!isValidHour(hour) || !isValidTime(hour, minute)) {
				const nextValidTime = getNextValidTime()
				selectedHour = nextValidTime.hour
				selectedMinute = nextValidTime.minute
				updateValue()
			} else {
				selectedHour = hour
				selectedMinute = minute
			}
		}
	})

	function getNextValidTime(): { hour: number, minute: number } {
		const now = new Date()
		const currentHour = now.getHours()
		const currentMinute = now.getMinutes()

		if (currentHour >= 0 && currentHour <= 5) {
			if (currentHour < 5) {
				return { hour: currentHour + 1, minute: 0 }
			} else {
				return { hour: 6, minute: 0 }
			}
		}

		// If current time is 6-22
		if (currentHour >= 6 && currentHour <= 22) {
			const nextHour = currentHour + 1
			const nextMinute = currentMinute < 55 ? Math.ceil((currentMinute + 1) / 5) * 5 : 0
			
			if (nextMinute === 0 && nextHour <= 23) {
				return { hour: nextHour + 1, minute: 0 }
			} else if (nextHour <= 23) {
				return { hour: nextHour, minute: nextMinute }
			} else {
				// Next day
				return { hour: 0, minute: 0 }
			}
		}

		// If current time is 23:xx, next valid is 0:00 (next day)
		return { hour: 0, minute: 0 }
	}

	function selectHour(hour: number) {
		if (isValidHour(hour)) {
			selectedHour = hour
			mode = 'minute'
			updateValue()
		}
	}

	function selectMinute(minute: number) {
		if (isValidTime(selectedHour, minute)) {
			selectedMinute = minute
			updateValue()
		}
	}

	function updateValue() {
		const date = new Date()
		date.setHours(selectedHour, selectedMinute, 0, 0)
		value = date.getTime()
	}

	function getPosition(value: number, isOuter: boolean = true) {
		const radius = isOuter ? 95 : 60
		const angle = (value * 30) - 90
		const x = Math.cos(angle * Math.PI / 180) * radius
		const y = Math.sin(angle * Math.PI / 180) * radius
		return { x: isOuter ? x + 125: x + 120, y: isOuter ? y + 125 : y + 120 }
	}

	function getMinutePosition(minute: number) {
		const angle = (minute * 6) - 90
		const x = Math.cos(angle * Math.PI / 180) * 90
		const y = Math.sin(angle * Math.PI / 180) * 90
		return { x: x + 120, y: y + 120 }
	}

	function getHandAngle(value: number, isHour: boolean = true) {
		if (isHour) {
			const hour12 = value % 12
			return (hour12 * 30)
		}
		return (value * 6)
	}

	function isValidHour(hour: number): boolean {
		const inValidRange = hour >= 6 || hour <= 4
		if (!inValidRange) return false
		
		const now = new Date()
		const currentHour = now.getHours()
		
		if (currentHour >= 0 && currentHour <= 4) {
			return (hour >= 0 && hour <= 4) && (hour >= currentHour + 1)
		}
		
		if (currentHour >= 6 && currentHour <= 23) {
			if (hour >= 6 && hour <= 23) {
				return hour >= currentHour + 1
			}
			return hour >= 0 && hour <= 4
		}
		
		return true
	}

	function isValidTime(hour: number, minute: number): boolean {
		if (!isValidHour(hour)) return false
		
		const now = new Date()
		const currentHour = now.getHours()
		const currentMinute = now.getMinutes()
		const selectedTimeMinutes = hour * 60 + minute
		const currentTimeMinutes = currentHour * 60 + currentMinute
		
		if (currentHour >= 0 && currentHour <= 4) {
			return (hour >= 0 && hour <= 4) && (selectedTimeMinutes >= currentTimeMinutes + 60)
		}
		
		if (currentHour >= 6 && currentHour <= 23) {
			if (hour >= 6 && hour <= 23) {
				return selectedTimeMinutes >= currentTimeMinutes + 60
			}
			return hour >= 0 && hour <= 4
		}
		
		return true
	}

	function isNextDay(hour: number): boolean {
		return hour >= 0 && hour <= 4
	}

	const outerHours = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]
	const innerHours = [0, 1, 2, 3, 4, 6, 7, 8, 9, 10, 11] // Removed 5
	const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]

	function getClockPosition(hour: number): number {
		return hour % 12 || 12
	}

	let handAngle = $derived(getHandAngle(mode === 'hour' ? selectedHour : selectedMinute, mode === 'hour'))
	let isOuterHour = $derived(mode === 'hour' && outerHours.includes(selectedHour))
	let handLength = $derived(mode === 'hour' ? (isOuterHour ? 80 : 55) : 85)
	
	$effect(() => {
		valid = isValidTime(selectedHour, selectedMinute)
	})
</script>

<div class="flex flex-col items-center gap-6 p-6 max-w-sm mx-auto">
	<div class="text-center">
		<div class="text-4xl">
			<input 
				bind:value={selectedHour} 
				type="number" 
				min="0" 
				max="23" 
				class="w-14 text-center bg-transparent border-b-2 {isValidTime(selectedHour, selectedMinute) ? 'border-gray-300 dark:border-gray-600 focus:border-green-600' : 'border-red-500 focus:border-red-500'} focus:outline-none text-gray-700 dark:text-gray-300 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]" 
				onchange={() => selectHour(selectedHour)} 
			/>
			: <input 
				bind:value={selectedMinute} 
				type="number" 
				min="0" 
				max="55" 
				step="5" 
				class="w-14 text-center bg-transparent border-b-2 {isValidTime(selectedHour, selectedMinute) ? 'border-gray-300 dark:border-gray-600 focus:border-green-600' : 'border-red-500 focus:border-red-500'} focus:outline-none text-gray-700 dark:text-gray-300 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]" 
				onchange={() => selectMinute(selectedMinute)} 
			/>
		</div>
		<div class="text-sm {isValidTime(selectedHour, selectedMinute) ? 'text-green-600' : 'text-red-500'} mt-3 font-medium">
			{#if isNextDay(selectedHour)}
				Tomorrow
			{:else}
				Today
			{/if}
		</div>
	</div>

	<div class="flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
		<button
			onclick={() => mode = 'hour'}
			class="px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 {mode === 'hour' 
				? 'bg-green-600 text-white shadow-sm' 
				: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}"
		>
			Hour
		</button>
		<button
			onclick={() => mode = 'minute'}
			class="px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 {mode === 'minute' 
				? 'bg-green-600 text-white shadow-sm' 
				: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}"
		>
			Minute
		</button>
	</div>

	<div class="relative w-60 h-60 rounded-full bg-gray-50 dark:bg-gray-900 shadow-inner">
		<div class="absolute top-1/2 left-1/2 w-2 h-2 bg-green-600 rounded-full transform -translate-x-1/2 -translate-y-1/2 z-30"></div>

		<div 
			class="absolute top-1/2 left-1/2 bg-green-600 origin-bottom z-20 transition-all duration-300"
			style="width: 2px; height: {handLength}px; transform: translate(-50%, -100%) rotate({handAngle}deg)"
		></div>

		{#if mode === 'hour'}
			{#each outerHours as hour}
				{@const clockPos = getClockPosition(hour)}
				{@const pos = getPosition(clockPos, true)}
				{@const isValid = isValidHour(hour)}
				<button
					onclick={() => isValid && selectHour(hour)}
					class="absolute w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 z-25 {selectedHour === hour
						? 'bg-green-600 text-white scale-110' 
						: isValid
							? 'text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-green-100 dark:hover:bg-green-700 hover:scale-105'
							: 'text-gray-400 dark:text-gray-700 cursor-not-allowed opacity-30'}"
					style="left: {pos.x - 20}px; top: {pos.y - 20}px"
				>
					{hour}
					{#if isNextDay(hour)}
						<span class="absolute -top-1 -right-1 text-xs text-green-600 font-bold">+1</span>
					{/if}
				</button>
			{/each}

			{#each innerHours as hour}
				{@const clockPos = getClockPosition(hour)}
				{@const pos = getPosition(clockPos, false)}
				{@const isValid = isValidHour(hour)}
				<button
					onclick={() => isValid && selectHour(hour)}
					class="absolute w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 z-25 {selectedHour === hour
						? 'bg-green-600 text-white scale-110' 
						: isValid
							? 'text-gray-700 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-green-700 hover:scale-105'
							: 'text-gray-400 dark:text-gray-700 cursor-not-allowed opacity-30'}"
					style="left: {pos.x - 16}px; top: {pos.y - 16}px"
				>
					{hour}
					{#if isNextDay(hour)}
						<span class="absolute top-[-1px] right-[-1px] text-[10px] text-green-600 font-bold">+1</span>
					{/if}
				</button>
			{/each}
		{:else}
			{#each minutes as minute}
				{@const pos = getMinutePosition(minute)}
				{@const isValid = isValidTime(selectedHour, minute)}
				<button
					onclick={() => isValid && selectMinute(minute)}
					class="absolute w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 z-25 {selectedMinute === minute
						? 'bg-green-600 text-white scale-110' 
						: isValid
							? 'text-gray-700 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-green-700 hover:scale-105'
							: 'text-gray-400 dark:text-gray-700 cursor-not-allowed opacity-30'}"
					style="left: {pos.x - 20}px; top: {pos.y - 20}px"
				>
					{minute.toString().padStart(2, '0')}
				</button>
			{/each}
		{/if}
	</div>
</div>