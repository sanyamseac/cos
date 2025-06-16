import { redirect, fail, error } from '@sveltejs/kit'
import * as auth from '$lib/server/session'
import type { PageServerLoad, Actions } from './$types'
import { db } from '$lib/server/db'
import * as schema from '$lib/server/db/schema'
import { asc, desc, eq } from 'drizzle-orm'

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user)
		return redirect(302, `/login?redirect=${encodeURIComponent(event.url.href)}`)
	if (!auth.CONSUMER.includes(event.locals.user.role)) throw error(403, 'Forbidden')

	let canteens = await db
		.select()
		.from(schema.canteens)
		.where(eq(schema.canteens.active, true))
		.orderBy(desc(schema.canteens.open), asc(schema.canteens.name))

	return {
		user: event.locals.user,
		canteens,
	}
}

export const actions: Actions = {}
