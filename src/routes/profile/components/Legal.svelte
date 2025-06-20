<script lang="ts">
	import { Lock } from 'lucide-svelte'
</script>

<div
	class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
>
	<div class="mb-6 flex items-center gap-3">
		<div class="rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 p-2">
			<Lock class="h-5 w-5 text-white" />
		</div>
		<h3 class="text-lg font-semibold text-gray-800 dark:text-white">Legal</h3>
	</div>
	<div class="space-y-3">
		<a
			href="/terms"
			class="block font-medium text-gray-700 transition-all duration-200 hover:underline dark:text-gray-300"
		>
			Terms and Conditions
		</a>
		<a
			href="/privacy"
			class="block font-medium text-gray-700 transition-all duration-200 hover:underline dark:text-gray-300"
		>
			Privacy Policy
		</a>
	</div>
</div>
