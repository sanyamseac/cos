<script lang="ts">
	import { enhance } from '$app/forms'
	import type { ActionData } from './$types'
	import { page } from '$app/state'

	let { form }: { form: ActionData } = $props()
	let redirectUrl = page.url.searchParams.get('redirect') || '/'
</script>

<h1>Login/Register</h1>
<form method="post" action="?/login&redirect={redirectUrl}" use:enhance>
	<label>
		Username
		<input name="username" />
	</label>
	<label>
		Password
		<input type="password" name="password" />
	</label>
	<button>Login</button>
</form>

<form method="post" action="?/oauth&redirect={redirectUrl}" use:enhance>
	<button>CAS</button>
</form>
<p style="color: red">{form?.message ?? ''}</p>
