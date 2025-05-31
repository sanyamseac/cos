<script lang="ts">
	import { enhance } from '$app/forms'
	import type { PageServerData } from './$types'

	let { data }: { data: PageServerData } = $props()
</script>

<h1>Hi, {data.user.name}!</h1>
<p>Your user ID is {data.user.id}.</p>
<p>Your email is {data.user.email}.</p>
<p>Your role is {data.user.role}.</p>
<form method="post" action="login?/logout" use:enhance>
	<button>Sign out</button>
</form>
