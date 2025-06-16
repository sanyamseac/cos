<script>
	function randomInt(max = 100) {
		return Math.floor(Math.random() * max)
	}
</script>

<div class="absolute inset-0 overflow-hidden opacity-30">
	{#each Array(3) as _, i}
		{@const colors = [
			'from-blue-400 to-purple-500',
			'from-emerald-400 to-teal-500',
			'from-orange-400 to-pink-500',
			'from-yellow-400 to-red-500',
			'from-indigo-400 to-cyan-500',
			'from-rose-400 to-violet-500',
			'from-green-400 to-blue-500',
			'from-red-400 to-orange-500',
		]}
		{@const selectedColor = colors[randomInt(colors.length)]}
		{@const size = 32 + randomInt(20)}
		{@const maxTop = 100 - ((size * 4) / window.innerHeight) * 100}
		{@const maxLeft = 100 - ((size * 4) / window.innerWidth) * 100}
		<div
			class="absolute rounded-full bg-gradient-to-br {selectedColor} blur-3xl"
			style="top: {randomInt(Math.max(maxTop, 10))}%; left: {randomInt(
				Math.max(maxLeft, 10),
			)}%; width: {size * 4}px; height: {size * 4}px;"
		></div>
	{/each}
</div>
