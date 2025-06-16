import { redirect, fail, error } from '@sveltejs/kit'
import * as auth from '$lib/server/session'
import type { PageServerLoad } from './$types'
import { db } from '$lib/server/db'
import * as schema from '$lib/server/db/schema'
import { eq, and, isNull, asc, desc } from 'drizzle-orm'
import type { Actions } from '@sveltejs/kit'
import { generateId } from '$lib/helper'

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user)
		return redirect(302, `/login?redirect=${encodeURIComponent(event.url.href)}`)
	if (!auth.CONSUMER.includes(event.locals.user.role)) throw error(403, 'Access denied')

	const canteenAcronym = event.params.canteenId
	try {
		const canteen = await db
			.select()
			.from(schema.canteens)
			.where(and(eq(schema.canteens.acronym, canteenAcronym)))
			.then((results) => results[0])

		if (!canteen) {
			throw error(404, 'Canteen not found')
		}

		const canteenId = canteen.id

		const [menuItems, variants, addons] = await Promise.all([
			db
				.select()
				.from(schema.menuItems)
				.where(
					and(
						eq(schema.menuItems.canteenId, canteenId),
						eq(schema.menuItems.active, true),
					),
				)
				.orderBy(desc(schema.menuItems.available), asc(schema.menuItems.name)),
			db
				.select()
				.from(schema.variants)
				.where(eq(schema.variants.active, true))
				.orderBy(desc(schema.variants.available), asc(schema.variants.price)),
			db
				.select()
				.from(schema.addons)
				.where(eq(schema.addons.active, true))
				.orderBy(desc(schema.addons.available), asc(schema.addons.price)),
		])

		const variantsByItem: Record<number, any[]> = {}
		for (const v of variants) {
			if (!variantsByItem[v.itemId]) variantsByItem[v.itemId] = []
			variantsByItem[v.itemId].push(v)
		}
		const addonsByItem: Record<number, any[]> = {}
		for (const a of addons) {
			if (!addonsByItem[a.itemId]) addonsByItem[a.itemId] = []
			addonsByItem[a.itemId].push(a)
		}

		const menuItemsWithDetails = menuItems.map((item) => ({
			...item,
			variants: variantsByItem[item.id] || [],
			addons: addonsByItem[item.id] || [],
		}))

		const menuCategories = menuItemsWithDetails.reduce(
			(acc: Record<string, typeof menuItemsWithDetails>, item) => {
				if (!acc[item.category]) {
					acc[item.category] = []
				}
				acc[item.category].push(item)
				return acc
			},
			{},
		)

		return {
			user: event.locals.user,
			canteen,
			menuCategories,
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
		const addonIds = formData
			.getAll('addonIds')
			.map((id) => Number(id))
			.filter((id) => !isNaN(id))

		if (!menuItemId || isNaN(menuItemId)) {
			throw fail(400, { error: 'Invalid menu item' })
		}

		try {
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

			let basket = await db
				.select()
				.from(schema.baskets)
				.where(
					and(
						eq(schema.baskets.createdBy, locals.user.id),
						eq(schema.baskets.canteenId, canteenId),
					),
				)
				.limit(1)

			if (basket.length === 0) {
				const [newBasket] = await db
					.insert(schema.baskets)
					.values({
						id: generateId(),
						canteenId,
						createdBy: locals.user.id,
					})
					.returning()
				basket = [newBasket]
			}

			const potentialItems = await db
				.select()
				.from(schema.basketItems)
				.where(
					and(
						eq(schema.basketItems.basketId, basket[0].id),
						eq(schema.basketItems.menuItemId, menuItemId),
						variantId
							? eq(schema.basketItems.variantId, variantId)
							: isNull(schema.basketItems.variantId),
					),
				)

			let existingItem = null

			for (const item of potentialItems) {
				const itemAddons = await db
					.select({ addonId: schema.basketAddons.addonId })
					.from(schema.basketAddons)
					.where(eq(schema.basketAddons.basketItemId, item.id))

				const itemAddonIds = itemAddons.map((addon) => addon.addonId).sort()
				const newAddonIds = (addonIds || []).sort()

				if (
					itemAddonIds.length === newAddonIds.length &&
					itemAddonIds.every((id, index) => id === newAddonIds[index])
				) {
					existingItem = item
					break
				}
			}

			if (existingItem) {
				await db
					.update(schema.basketItems)
					.set({ quantity: existingItem.quantity + quantity })
					.where(eq(schema.basketItems.id, existingItem.id))
			} else {
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

				if (addonIds && addonIds.length > 0) {
					const addonValues = addonIds.map((addonId) => ({
						basketItemId: newBasketItem.id,
						addonId,
					}))
					await db.insert(schema.basketAddons).values(addonValues)
				}
			}

			return { success: true }
		} catch (error) {
			console.error('Error adding item to basket:', error)
			throw fail(500, { error: 'Failed to add item to basket' })
		}
	},
}
