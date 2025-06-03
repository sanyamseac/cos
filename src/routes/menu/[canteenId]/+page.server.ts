import { redirect, fail, error } from '@sveltejs/kit'
import * as auth from '$lib/server/session'
import type { PageServerLoad } from './$types'
import { db } from '$lib/server/db'
import * as schema from '$lib/server/db/schema'
import { eq, and } from 'drizzle-orm'
import type { Actions } from '@sveltejs/kit'

export const load: PageServerLoad = async (event) => {
	// Check authentication and role
	if (!event.locals.user)
		return redirect(302, `/login?redirect=${encodeURIComponent(event.url.href)}`)
	if (!auth.CONSUMER.includes(event.locals.user.role)) throw error(403, 'Access denied')

	const canteenAcronym = event.params.canteenId
	try {
		// Get canteen info
		const canteen = await db
			.select()
			.from(schema.canteens)
			.where(
				and(eq(schema.canteens.acronym, canteenAcronym), eq(schema.canteens.active, true)),
			)
			.then((results) => results[0])

		if (!canteen) {
			throw error(404, 'Canteen not found')
		}

		const canteenId = canteen.id

		// Get menu items for the canteen
		const menuItems = await db
			.select()
			.from(schema.menuItems)
			.where(
				and(eq(schema.menuItems.canteenId, canteenId), eq(schema.menuItems.active, true)),
			)

		// Get all variants for the menu items
		const variants = await db
			.select()
			.from(schema.variants)
			.where(eq(schema.variants.active, true))

		// Get all addons for the menu items
		const addons = await db.select().from(schema.addons).where(eq(schema.addons.active, true))

		// Organize menu items by category
		const menuCategories = menuItems.reduce((acc: Record<string, typeof menuItems>, item) => {
			if (!acc[item.category]) {
				acc[item.category] = []
			}
			acc[item.category].push(item)
			return acc
		}, {})

		return {
			user: event.locals.user,
			canteen,
			menuCategories,
			variants,
			addons,
			menuItems,
		}
	} catch (err) {
		console.error('Error fetching canteen data:', err)
		throw error(500, 'Failed to load canteen data')
	}
}

export const actions: Actions = {}
