import { redirect, fail, error } from '@sveltejs/kit'
import * as auth from '$lib/server/session'
import type { PageServerLoad } from './$types'
import { db } from '$lib/server/db'
import * as schema from '$lib/server/db/schema'
import { eq, and, isNull } from 'drizzle-orm'
import type { Actions } from '@sveltejs/kit'
import { generateId } from '$lib/helper'

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

export const actions: Actions = {
	addToBasket: async ({ request, locals, params }) => {
		if (!locals.user) {
			throw fail(401, { error: 'Not authenticated' })
		}

		const formData = await request.formData()
		const menuItemId = Number(formData.get('menuItemId'))
		const variantId = formData.get('variantId') ? Number(formData.get('variantId')) : undefined
		const quantity = Number(formData.get('quantity')) || 1
		const addonIds = formData.getAll('addonIds').map(id => Number(id)).filter(id => !isNaN(id))

		if (!menuItemId || isNaN(menuItemId)) {
			throw fail(400, { error: 'Invalid menu item' })
		}

		try {
			// Get canteen ID from the acronym
			const canteenAcronym = params.canteenId
			if (!canteenAcronym) {
				throw fail(400, { error: 'Invalid canteen ID' })
			}

			const canteen = await db
				.select()
				.from(schema.canteens)
				.where(eq(schema.canteens.acronym, canteenAcronym))
				.limit(1)

			if (canteen.length === 0) {
				throw fail(404, { error: 'Canteen not found' })
			}

			const canteenId = canteen[0].id

			// Get or create basket for this user and canteen
			let basket = await db
				.select()
				.from(schema.baskets)
				.where(
					and(
						eq(schema.baskets.createdBy, locals.user.id),
						eq(schema.baskets.canteenId, canteenId)
					)
				)
				.limit(1)

			if (basket.length === 0) {
				// Create a new basket
				const [newBasket] = await db
					.insert(schema.baskets)
					.values({
						id: generateId(),
						canteenId,
						isShared: false,
						createdBy: locals.user.id,
					})
					.returning()
				basket = [newBasket]
			}

			// Check if the same item with same variant and same addons already exists in basket
			const potentialItems = await db
				.select()
				.from(schema.basketItems)
				.where(
					and(
						eq(schema.basketItems.basketId, basket[0].id),
						eq(schema.basketItems.menuItemId, menuItemId),
						variantId ? eq(schema.basketItems.variantId, variantId) : isNull(schema.basketItems.variantId)
					)
				)

			let existingItem = null

			// Check each potential item to see if it has the same addons
			for (const item of potentialItems) {
				const itemAddons = await db
					.select({ addonId: schema.basketAddons.addonId })
					.from(schema.basketAddons)
					.where(eq(schema.basketAddons.basketItemId, item.id))

				const itemAddonIds = itemAddons.map(addon => addon.addonId).sort()
				const newAddonIds = (addonIds || []).sort()

				// Check if addon arrays are the same
				if (itemAddonIds.length === newAddonIds.length && 
					itemAddonIds.every((id, index) => id === newAddonIds[index])) {
					existingItem = item
					break
				}
			}

			if (existingItem) {
				// Update quantity if exact same item (including addons) already exists
				await db
					.update(schema.basketItems)
					.set({ quantity: existingItem.quantity + quantity })
					.where(eq(schema.basketItems.id, existingItem.id))
			} else {
				// Add new item to basket (this is a different combination of item + variant + addons)
				const [newBasketItem] = await db
					.insert(schema.basketItems)
					.values({
						basketId: basket[0].id,
						menuItemId,
						variantId,
						quantity,
						addedBy: locals.user.id,
					})
					.returning()

				// Add addons if provided
				if (addonIds && addonIds.length > 0) {
					const addonValues = addonIds.map(addonId => ({
						basketItemId: newBasketItem.id,
						addonId
					}))
					await db.insert(schema.basketAddons).values(addonValues)
				}
			}

			return { success: true }
		} catch (error) {
			console.error('Error adding item to basket:', error)
			throw fail(500, { error: 'Failed to add item to basket' })
		}
	}
}
