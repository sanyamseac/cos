import { redirect, fail, error } from '@sveltejs/kit'
import * as auth from '$lib/server/session'
import { db } from '$lib/server/db'
import * as schema from '$lib/server/db/schema'
import { eq, and } from 'drizzle-orm'
import type { PageServerLoad } from './$types'
import { emitOrderStatusUpdate } from '$lib/server/sse-events'

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user)
		return redirect(302, `/login?redirect=${encodeURIComponent(event.url.href)}`)
	if (!auth.CONSUMER.includes(event.locals.user.role)) throw error(403, 'Access denied')

	const orderId = Number(event.params.orderId)
	if (!orderId || isNaN(orderId)) {
		throw error(400, 'Invalid order ID')
	}

	try {
		const orders = await db
			.select({
				order: schema.orders,
				canteen: schema.canteens,
			})
			.from(schema.orders)
			.leftJoin(schema.canteens, eq(schema.orders.canteenId, schema.canteens.id))
			.where(
				and(eq(schema.orders.id, orderId), eq(schema.orders.userId, event.locals.user.id)),
			)
			.limit(1)

		if (orders.length === 0) {
			throw error(404, 'Order not found')
		}

		const orderData = orders[0]

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
					addons: addons.filter((addon) => addon.addon?.id),
				}
			}),
		)

		return {
			user: event.locals.user,
			order: orderData.order,
			canteen: orderData.canteen,
			orderItems: orderItemsWithAddons,
		}
	} catch (err) {
		console.error('Error loading order details:', err)
		if (err instanceof Error && 'status' in err) {
			throw err
		}
		throw error(500, 'Failed to load order details')
	}
}

export const actions = {
	cancelOrder: async (event) => {
		if (!event.locals.user) return fail(401, { message: 'Unauthorized' })
		if (!auth.CONSUMER.includes(event.locals.user.role)) return fail(403, { message: 'Access denied' })

		const orderId = Number(event.params.orderId)
		if (!orderId || isNaN(orderId)) {
			return fail(400, { message: 'Invalid order ID' })
		}

		try {
			const orderResult = await db
				.select()
				.from(schema.orders)
				.where(
					and(
						eq(schema.orders.id, orderId),
						eq(schema.orders.userId, event.locals.user.id)
					)
				)
				.limit(1)

			if (!orderResult.length) {
				return fail(404, { message: 'Order not found' })
			}

			const order = orderResult[0]
			if (order.status === 'completed' || order.status === 'cancelled') {
				return fail(400, { message: 'Order cannot be cancelled' })
			}

			await db
				.update(schema.orders)
				.set({
					status: 'cancelled',
					cancelledAt: new Date(),
					cancelledBy: event.locals.user.id,
				})
				.where(eq(schema.orders.id, orderId))

			try {
				emitOrderStatusUpdate(
					{
						id: orderId.toString(),
						orderNumber: order.orderNumber,
						status: 'cancelled',
						canteenId: order.canteenId.toString(),
						userId: order.userId.toString(),
					},
					order.status,
				)
			} catch (e) {
				console.error('Failed to emit order status update SSE event:', e)
			}

			return { success: true, message: 'Order cancelled successfully' }
		} catch (err) {
			console.error('Error cancelling order:', err)
			return fail(500, { message: 'Failed to cancel order' })
		}
	},
}
