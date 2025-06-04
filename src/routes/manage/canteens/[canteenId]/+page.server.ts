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
	if (!auth.ADMIN.includes(event.locals.user.role)) throw error(403, 'Access denied - Admin only')

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

		// Get menu items for the canteen (including inactive ones for admin)
		const menuItems = await db
			.select()
			.from(schema.menuItems)
			.where(eq(schema.menuItems.canteenId, canteenId))

		// Get all variants for the menu items (including inactive ones for admin)
		const variants = await db.select().from(schema.variants)

		// Get all addons for the menu items (including inactive ones for admin)
		const addons = await db.select().from(schema.addons)

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

export const actions: Actions = {
	addMenuItem: async ({ request, locals }) => {
		if (!locals.user || !auth.ADMIN.includes(locals.user.role)) throw error(403, 'Unauthorized')

		try {
			const body = await request.formData()
			const canteenIdStr = body.get('canteenId')?.toString()
			const canteenId = parseInt(canteenIdStr || '')
			const category = body.get('category')?.toString()
			const name = body.get('name')?.toString()
			const price = body.get('price')?.toString()
			const availableValue = body.get('available')?.toString()
			const description = body.get('description')?.toString()
			const type = body.get('type')?.toString() || 'veg'
			const activeValue = body.get('active')?.toString()

			console.log('Raw form data received:', {
				canteenIdStr,
				canteenId,
				category,
				name,
				price,
				available: availableValue,
				active: activeValue,
				type,
				description,
			})

			if (!canteenIdStr || isNaN(canteenId) || !category || !name || !price) {
				console.log('Validation failed:', {
					hasCanteenIdStr: !!canteenIdStr,
					isCanteenIdNaN: isNaN(canteenId),
					hasCategory: !!category,
					hasName: !!name,
					hasPrice: !!price,
				})
				return fail(400, { error: 'CanteenId, category, name, and price are required' })
			}

			// Handle boolean values properly
			const available =
				availableValue === 'true' || availableValue === 'on' || (!availableValue && true)
			const active = activeValue === 'true' || activeValue === 'on' || (!activeValue && true)

			const [newItem] = await db
				.insert(schema.menuItems)
				.values({
					canteenId,
					category,
					name,
					price,
					available,
					type,
					active,
					description: description || null,
				})
				.returning()

			return { success: true, menuItem: newItem }
		} catch (error) {
			console.error('Error creating menu item:', error)
			return fail(500, { error: 'Failed to create menu item' })
		}
	},

	updateMenuItem: async ({ request, locals }) => {
		if (!locals.user || !auth.ADMIN.includes(locals.user.role)) throw error(403, 'Unauthorized')

		try {
			const body = await request.formData()
			const id = parseInt(body.get('id')?.toString() || '')
			const canteenId = body.get('canteenId')?.toString()
			const category = body.get('category')?.toString()
			const name = body.get('name')?.toString()
			const price = body.get('price')?.toString()
			const available = body.get('available')
			const description = body.get('description')?.toString()
			const type = body.get('type')?.toString()
			const active = body.get('active')

			if (!id) {
				return fail(400, { error: 'Menu item ID is required' })
			}

			const updateData: any = {}
			if (canteenId) updateData.canteenId = parseInt(canteenId)
			if (category) updateData.category = category
			if (name) updateData.name = name
			if (price) updateData.price = price
			if (available !== null) updateData.available = available === 'true'
			if (type) updateData.type = type
			if (active !== null) updateData.active = active === 'true'
			if (description) updateData.description = description

			const [updatedItem] = await db
				.update(schema.menuItems)
				.set(updateData)
				.where(eq(schema.menuItems.id, id))
				.returning()

			if (!updatedItem) {
				return fail(404, { error: 'Menu item not found' })
			}

			return { success: true, menuItem: updatedItem }
		} catch (error) {
			console.error('Error updating menu item:', error)
			return fail(500, { error: 'Failed to update menu item' })
		}
	},

	// Addons
	addAddon: async ({ request, locals }) => {
		if (!locals.user || !auth.ADMIN.includes(locals.user.role)) throw error(403, 'Unauthorized')

		try {
			const body = await request.formData()
			const itemId = parseInt(body.get('itemId')?.toString() || '')
			const name = body.get('name')?.toString()
			const price = body.get('price')?.toString()
			const active = body.get('active') === 'true'
			const available = body.get('available') === 'true'
			const type = body.get('type')?.toString() || 'veg'

			if (!itemId || !name || !price) {
				return fail(400, { error: 'ItemId, name, and price are required' })
			}

			const [newAddon] = await db
				.insert(schema.addons)
				.values({
					itemId,
					name,
					price,
					active: active ?? true,
					available: available ?? true,
					type,
				})
				.returning()

			return { success: true, addon: newAddon }
		} catch (error) {
			console.error('Error creating addon:', error)
			return fail(500, { error: 'Failed to create addon' })
		}
	},

	updateAddon: async ({ request, locals }) => {
		if (!locals.user || !auth.ADMIN.includes(locals.user.role)) throw error(403, 'Unauthorized')

		try {
			const body = await request.formData()
			const id = parseInt(body.get('id')?.toString() || '')
			const itemId = body.get('itemId')?.toString()
			const name = body.get('name')?.toString()
			const price = body.get('price')?.toString()
			const active = body.get('active')
			const available = body.get('available')
			const type = body.get('type')?.toString()

			if (!id) {
				return fail(400, { error: 'Addon ID is required' })
			}

			const updateData: any = {}
			if (itemId) updateData.itemId = parseInt(itemId)
			if (name) updateData.name = name
			if (price) updateData.price = price
			if (active !== null) updateData.active = active === 'true'
			if (available !== null) updateData.available = available === 'true'
			if (type) updateData.type = type

			const [updatedAddon] = await db
				.update(schema.addons)
				.set(updateData)
				.where(eq(schema.addons.id, id))
				.returning()

			if (!updatedAddon) {
				return fail(404, { error: 'Addon not found' })
			}

			return { success: true, addon: updatedAddon }
		} catch (error) {
			console.error('Error updating addon:', error)
			return fail(500, { error: 'Failed to update addon' })
		}
	},

	// Variants
	addVariant: async ({ request, locals }) => {
		if (!locals.user || !auth.ADMIN.includes(locals.user.role)) throw error(403, 'Unauthorized')

		try {
			const body = await request.formData()
			const itemId = parseInt(body.get('itemId')?.toString() || '')
			const name = body.get('name')?.toString()
			const price = body.get('price')?.toString()
			const active = body.get('active') === 'true'
			const available = body.get('available') === 'true'

			if (!itemId || !name || !price) {
				return fail(400, { error: 'ItemId, name, and price are required' })
			}

			const [newVariant] = await db
				.insert(schema.variants)
				.values({
					itemId,
					name,
					price,
					active: active ?? true,
					available: available ?? true,
				})
				.returning()

			return { success: true, variant: newVariant }
		} catch (error) {
			console.error('Error creating variant:', error)
			return fail(500, { error: 'Failed to create variant' })
		}
	},

	updateVariant: async ({ request, locals }) => {
		if (!locals.user || !auth.ADMIN.includes(locals.user.role)) throw error(403, 'Unauthorized')

		try {
			const body = await request.formData()
			const id = parseInt(body.get('id')?.toString() || '')
			const itemId = body.get('itemId')?.toString()
			const name = body.get('name')?.toString()
			const price = body.get('price')?.toString()
			const active = body.get('active')
			const available = body.get('available')

			if (!id) {
				return fail(400, { error: 'Variant ID is required' })
			}

			const updateData: any = {}
			if (itemId) updateData.itemId = parseInt(itemId)
			if (name) updateData.name = name
			if (price) updateData.price = price
			if (active !== null) updateData.active = active === 'true'
			if (available !== null) updateData.available = available === 'true'

			const [updatedVariant] = await db
				.update(schema.variants)
				.set(updateData)
				.where(eq(schema.variants.id, id))
				.returning()

			if (!updatedVariant) {
				return fail(404, { error: 'Variant not found' })
			}

			return { success: true, variant: updatedVariant }
		} catch (error) {
			console.error('Error updating variant:', error)
			return fail(500, { error: 'Failed to update variant' })
		}
	},
}
