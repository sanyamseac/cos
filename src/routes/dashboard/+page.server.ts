import { redirect, error } from '@sveltejs/kit'
import * as auth from '$lib/server/session'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user)
		return redirect(302, `/login?redirect=${encodeURIComponent(event.url.href)}`)
	if (!auth.CONSUMER.includes(event.locals.user.role))
		throw error(403, 'Access denied')
	return { user: event.locals.user }
}
