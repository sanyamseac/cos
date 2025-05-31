import * as auth from '$lib/server/session'
import { fail, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) return redirect(302, `/login?redirect=${encodeURIComponent(event.url.href)}`)
	if (!auth.CONSUMER.includes(event.locals.user.role)) return fail(403, { message: 'Access denied' })
	return { user: event.locals.user }
}
