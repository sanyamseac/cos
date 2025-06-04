import { redirect, fail, error } from '@sveltejs/kit'
import * as auth from '$lib/server/session'
import type { PageServerLoad, Actions } from './$types'
import { db } from '$lib/server/db'
import * as schema from '$lib/server/db/schema'
import { asc, desc, eq } from 'drizzle-orm'

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user)
		return redirect(302, `/login?redirect=${encodeURIComponent(event.url.href)}`)
	if (!auth.ADMIN.includes(event.locals.user.role)) throw error(403, 'Access denied - Admin only')

	let canteens = await db
		.select()
		.from(schema.canteens)
		.orderBy(desc(schema.canteens.open), asc(schema.canteens.name))

	return {
		user: event.locals.user,
		canteens,
	}
}

export const actions: Actions = {
	addCanteen: async ({ request, locals }) => {
		if (!locals.user || !auth.ADMIN.includes(locals.user.role)) throw error(403, 'Unauthorized')

		try {
			const body = await request.formData()
			const name = body.get('name')?.toString()
			const timings = body.get('timings')?.toString()
			const open = body.get('open') === 'true'
			const acronym = body.get('acronym')?.toString()
			const description = body.get('description')?.toString()
			const active = body.get('active') === 'true'

			if (!name || !timings || !acronym || !description) {
				return fail(400, { error: 'Name, timings, acronym, and description are required' })
			}

			const [newCanteen] = await db
				.insert(schema.canteens)
				.values({
					name,
					timings,
					open: open ?? true,
					acronym,
					description,
					active: active ?? true,
				})
				.returning()

			return { success: true, canteen: newCanteen }
		} catch (error) {
			console.error('Error creating canteen:', error)
			return fail(500, { error: 'Failed to create canteen' })
		}
	},

	updateCanteen: async ({ request, locals }) => {
		if (!locals.user || !auth.ADMIN.includes(locals.user.role)) throw error(403, 'Unauthorized')

		try {
			const body = await request.formData()
			const id = parseInt(body.get('id')?.toString() || '')
			const name = body.get('name')?.toString()
			const timings = body.get('timings')?.toString()
			const open = body.get('open') === 'true'
			const description = body.get('description')?.toString()
			const acronym = body.get('acronym')?.toString()
			const active = body.get('active') === 'true'

			if (!id) {
				return fail(400, { error: 'Canteen ID is required' })
			}

			const updateData: any = {}
			if (name) updateData.name = name
			if (timings) updateData.timings = timings
			if (open !== undefined) updateData.open = open
			if (description) updateData.description = description
			if (acronym) updateData.acronym = acronym
			if (active !== undefined) updateData.active = active

			const [updatedCanteen] = await db
				.update(schema.canteens)
				.set(updateData)
				.where(eq(schema.canteens.id, id))
				.returning()

			if (!updatedCanteen) {
				return fail(404, { error: 'Canteen not found' })
			}

			return { success: true, canteen: updatedCanteen }
		} catch (error) {
			console.error('Error updating canteen:', error)
			return fail(500, { error: 'Failed to update canteen' })
		}
	},
}
