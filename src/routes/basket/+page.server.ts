import { redirect, fail, error } from '@sveltejs/kit'
import * as auth from '$lib/server/session'
import type { PageServerLoad, Actions } from './$types'
import { db } from '$lib/server/db'
import * as schema from '$lib/server/db/schema'
import { eq, and } from 'drizzle-orm'

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user)
		return redirect(302, `/login?redirect=${encodeURIComponent(event.url.href)}`)
	if (!auth.CONSUMER.includes(event.locals.user.role))
		throw error(403, 'Access denied')

	try {
		// Get all canteens to check baskets for each one
		const allCanteens = await db.select().from(schema.canteens)
		
		// Get basket items for each canteen
		const basketsByCanteen = await Promise.all(
			allCanteens.map(async (canteen) => {
				// Get basket items for this canteen
				const basket = await db
					.select()
					.from(schema.baskets)
					.where(and(eq(schema.baskets.createdBy, event.locals.user!.id), eq(schema.baskets.canteenId, canteen.id)))
					.limit(1)

				if (basket.length === 0) {
					return {
						canteen,
						items: []
					}
				}

				const items = await db
					.select({
						id: schema.basketItems.id,
						quantity: schema.basketItems.quantity,
						menuItem: {
							id: schema.menuItems.id,
							name: schema.menuItems.name,
							description: schema.menuItems.description,
							price: schema.menuItems.price,
							category: schema.menuItems.category,
							type: schema.menuItems.type,
						},
						variant: {
							id: schema.variants.id,
							name: schema.variants.name,
							price: schema.variants.price,
						},
					})
					.from(schema.basketItems)
					.leftJoin(schema.menuItems, eq(schema.basketItems.menuItemId, schema.menuItems.id))
					.leftJoin(schema.variants, eq(schema.basketItems.variantId, schema.variants.id))
					.where(eq(schema.basketItems.basketId, basket[0].id))

				// Get addons for each basket item
				const itemsWithAddons = await Promise.all(
					items.map(async (item) => {
						const itemAddons = await db
							.select({
								id: schema.addons.id,
								name: schema.addons.name,
								price: schema.addons.price,
								type: schema.addons.type,
							})
							.from(schema.basketAddons)
							.leftJoin(schema.addons, eq(schema.basketAddons.addonId, schema.addons.id))
							.where(eq(schema.basketAddons.basketItemId, item.id))

						return {
							...item,
							addons: itemAddons,
						}
					})
				)

				return {
					canteen,
					items: itemsWithAddons
				}
			})
		)

		// Filter out canteens with empty baskets
		const basketsWithItems = basketsByCanteen.filter(basket => basket.items.length > 0)

		return { 
			user: event.locals.user,
			baskets: basketsWithItems
		}
	} catch (err) {
		console.error('Error loading basket:', err)
		throw error(500, 'Failed to load basket')
	}
}

export const actions: Actions = {
	updateQuantity: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Not authenticated' })
		}

		const formData = await request.formData()
		const basketItemId = Number(formData.get('basketItemId'))
		const quantity = Number(formData.get('quantity'))

		if (!basketItemId || isNaN(basketItemId) || !quantity || isNaN(quantity)) {
			return fail(400, { error: 'Invalid parameters' })
		}

		try {
			if (quantity <= 0) {
				// Remove item if quantity is 0 or less
				await db.delete(schema.basketItems).where(eq(schema.basketItems.id, basketItemId))
			} else {
				await db
					.update(schema.basketItems)
					.set({ quantity })
					.where(and(eq(schema.basketItems.id, basketItemId), eq(schema.basketItems.addedBy, locals.user.id)))
			}
			return { success: true }
		} catch (error) {
			console.error('Error updating quantity:', error)
			return fail(500, { error: 'Failed to update quantity' })
		}
	},

	removeItem: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Not authenticated' })
		}

		const formData = await request.formData()
		const basketItemId = Number(formData.get('basketItemId'))

		if (!basketItemId || isNaN(basketItemId)) {
			return fail(400, { error: 'Invalid parameters' })
		}

		try {
			await db
				.delete(schema.basketItems)
				.where(and(eq(schema.basketItems.id, basketItemId), eq(schema.basketItems.addedBy, locals.user.id)))
			return { success: true }
		} catch (error) {
			console.error('Error removing item:', error)
			return fail(500, { error: 'Failed to remove item' })
		}
	},

	clearBasket: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Not authenticated' })
		}

		const formData = await request.formData()
		const canteenId = Number(formData.get('canteenId'))

		if (!canteenId || isNaN(canteenId)) {
			return fail(400, { error: 'Invalid parameters' })
		}

		try {
			const basket = await db
				.select()
				.from(schema.baskets)
				.where(and(eq(schema.baskets.createdBy, locals.user.id), eq(schema.baskets.canteenId, canteenId)))
				.limit(1)

			if (basket.length > 0) {
				await db.delete(schema.basketItems).where(eq(schema.basketItems.basketId, basket[0].id))
			}
			return { success: true }
		} catch (error) {
			console.error('Error clearing basket:', error)
			return fail(500, { error: 'Failed to clear basket' })
		}
	}
}
