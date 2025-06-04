import { redirect, fail, error } from '@sveltejs/kit'
import * as auth from '$lib/server/session'
import { db } from '$lib/server/db'
import * as schema from '$lib/server/db/schema'
import { eq, and } from 'drizzle-orm'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user)
		return redirect(302, `/login?redirect=${encodeURIComponent(event.url.href)}`)
	if (!auth.CONSUMER.includes(event.locals.user.role))
		return fail(403, { message: 'Access denied' })

	const orderId = Number(event.params.orderId)
	if (!orderId || isNaN(orderId)) {
		throw error(400, 'Invalid order ID')
	}

	try {
		// Get order with canteen information
		const orders = await db
			.select({
				order: schema.orders,
				canteen: schema.canteens,
			})
			.from(schema.orders)
			.leftJoin(schema.canteens, eq(schema.orders.canteenId, schema.canteens.id))
			.where(and(
				eq(schema.orders.id, orderId),
				eq(schema.orders.userId, event.locals.user.id)
			))
			.limit(1)

		if (orders.length === 0) {
			throw error(404, 'Order not found')
		}

		const orderData = orders[0]

		// Get order items with menu item details, variants, and addons
		const orderItems = await db
			.select({
				orderItem: schema.orderItems,
				menuItem: schema.menuItems,
				variant: schema.variants,
			})
			.from(schema.orderItems)
			.leftJoin(schema.menuItems, eq(schema.orderItems.menuItemId, schema.menuItems.id))
			.leftJoin(schema.variants, eq(schema.orderItems.variantId, schema.variants.id))
			.where(eq(schema.orderItems.orderId, orderId))

		// Get addons for each order item
		const orderItemsWithAddons = await Promise.all(
			orderItems.map(async (item) => {
				const addons = await db
					.select({
						addon: schema.addons,
						orderAddon: schema.orderAddons,
					})
					.from(schema.orderAddons)
					.leftJoin(schema.addons, eq(schema.orderAddons.addonId, schema.addons.id))
					.where(eq(schema.orderAddons.orderItemId, item.orderItem.id))

				return {
					...item,
					addons: addons.filter(addon => addon.addon?.id)
				}
			})
		)

		return { 
			user: event.locals.user,
			order: orderData.order,
			canteen: orderData.canteen,
			orderItems: orderItemsWithAddons
		}
	} catch (err) {
		console.error('Error loading order details:', err)
		if (err instanceof Error && 'status' in err) {
			throw err
		}
		throw error(500, 'Failed to load order details')
	}
}
