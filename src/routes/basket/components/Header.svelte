<script lang="ts">
	import { Button } from 'bits-ui'
	import { ArrowLeft, Share2, UserPlus } from 'lucide-svelte'
	import JoinBasket from './JoinBasket.svelte';

	let open = $state(false)
</script>
<JoinBasket bind:open />
<div class="flex items-center justify-between pb-4">
	<div>
		<h1
			class="text-4xl font-sensation text-gray-800 dark:text-white sm:text-5xl md:text-6xl"
		>
			basket
		</h1>
	</div>
	<div>
		<Button.Root
			class="px-2 cursor-pointer"
			onclick={()=>{open = true}}
		>
			<UserPlus class="ml-3 mt-0.5 h-7 w-7" />
		</Button.Root>
	</div>
</div>
