import { redirect, error, fail } from '@sveltejs/kit'
import * as auth from '$lib/server/session'
import { db } from '$lib/server/db'
import * as schema from '$lib/server/db/schema'
import { eq, desc, sum, and, gte, lt, sql, inArray } from 'drizzle-orm'
import type { PageServerLoad, Actions } from './$types'
import { emitOrderStatusUpdate } from '$lib/server/sse-events'

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user)
		return redirect(302, `/login?redirect=${encodeURIComponent(event.url.href)}`)
	if (!auth.CANTEENS.includes(event.locals.user.role)) throw error(403, 'Access denied')

	try {
		// Get canteen ID from user email
		const canteenAcronym = event.locals.user.email.split('@')[0]
		const canteenResult = await db
			.select()
			.from(schema.canteens)
			.where(eq(schema.canteens.acronym, canteenAcronym))
			.limit(1)

		if (!canteenResult.length) {
			throw error(404, 'Canteen not found')
		}

		const canteen = canteenResult[0]
		const canteenId = canteen.id

		// Get today's date range in UTC for IST 5am (previous day) to 6am (current day)
		const now = new Date()
		// Calculate the current time in IST
		const nowIST = new Date(now.getTime() + 5.5 * 60 * 60 * 1000)
		// Get the current date in IST
		const istYear = nowIST.getUTCFullYear()
		const istMonth = nowIST.getUTCMonth()
		const istDate = nowIST.getUTCDate()

		// Start: current day 6am IST (which is current day 00:30 UTC)
		const startOfDay = new Date(Date.UTC(istYear, istMonth, istDate, 0, 30, 0, 0))
		// End: next day 5am IST (which is next day 23:30 UTC)
		const endOfDay = new Date(Date.UTC(istYear, istMonth, istDate + 1, 23, 30, 0, 0))

		// Fetch today's orders for this canteen
		const ordersResult = await db
			.select({
				order: schema.orders,
				user: {
					id: schema.user.id,
					name: schema.user.name,
					email: schema.user.email,
				},
			})
			.from(schema.orders)
			.leftJoin(schema.user, eq(schema.orders.userId, schema.user.id))
			.where(
				and(
					eq(schema.orders.canteenId, canteenId),
					gte(schema.orders.createdAt, startOfDay),
					lt(schema.orders.createdAt, endOfDay)
				),
			)
			.orderBy(desc(schema.orders.createdAt))

		// Get order items for each order
		const orderIds = ordersResult.map((r) => r.order.id)
		const orderItemsResult =
			orderIds.length > 0
				? await db
					.select({
						orderItem: schema.orderItems,
						menuItem: schema.menuItems,
						variant: schema.variants,
					})
					.from(schema.orderItems)
					.leftJoin(
						schema.menuItems,
						eq(schema.orderItems.menuItemId, schema.menuItems.id),
					)
					.leftJoin(
						schema.variants,
						eq(schema.orderItems.variantId, schema.variants.id),
					)
					.where(inArray(schema.orderItems.orderId, orderIds))
				: []

		// Get addons for order items
		const orderItemIds = orderItemsResult.map((r) => r.orderItem.id)
		const addonsResult =
			orderItemIds.length > 0
				? await db
					.select({
						orderItemId: schema.orderAddons.orderItemId,
						addonName: schema.addons.name,
					})
					.from(schema.orderAddons)
					.leftJoin(schema.addons, eq(schema.orderAddons.addonId, schema.addons.id))
					.where(inArray(schema.orderAddons.orderItemId, orderItemIds))
				: []

		// Calculate today's revenue
		const revenueResult = await db
			.select({
				totalRevenue: sum(schema.orders.totalAmount),
				totalOrders: sql<number>`count(*)`.as('totalOrders'),
			})
			.from(schema.orders)
			.where(
				and(
					eq(schema.orders.canteenId, canteenId),
					gte(schema.orders.createdAt, startOfDay),
					lt(schema.orders.createdAt, endOfDay),
					sql`${schema.orders.status} IN ('completed', 'ready')`,
				),
			)

		// Group addons by order item ID
		const addonsMap = new Map()
		for (const addon of addonsResult) {
			if (!addonsMap.has(addon.orderItemId)) {
				addonsMap.set(addon.orderItemId, [])
			}
			if (addon.addonName) {
				addonsMap.get(addon.orderItemId).push(addon.addonName)
			}
		}

		// Group order items by order ID
		const orderItemsMap = new Map()
		for (const item of orderItemsResult) {
			const orderId = item.orderItem.orderId
			if (!orderItemsMap.has(orderId)) {
				orderItemsMap.set(orderId, [])
			}
			orderItemsMap.get(orderId).push({
				...item.orderItem,
				menuItem: item.menuItem,
				variant: item.variant,
				addons: addonsMap.get(item.orderItem.id) || [],
			})
		}

		// Combine orders with their items
		const ordersWithItems = ordersResult.map(({ order, user }) => ({
			...order,
			user,
			items: orderItemsMap.get(order.id) || [],
		}))

		const revenue = revenueResult[0] || { totalRevenue: 0, totalOrders: 0 }

		return {
			canteen,
			orders: ordersWithItems,
			revenue: {
				total: Number(revenue.totalRevenue) || 0,
				orderCount: Number(revenue.totalOrders) || 0,
			},
		}
	} catch (err) {
		console.error('Error loading canteen dashboard:', err)
		throw error(500, 'Failed to load dashboard data')
	}
}

export const actions: Actions = {
	updateOrderStatus: async (event) => {
		if (!event.locals.user) return fail(401, { message: 'Unauthorized' })
		if (!auth.CANTEENS.includes(event.locals.user.role))
			return fail(403, { message: 'Access denied' })

		const formData = await event.request.formData()
		const orderId = formData.get('orderId')
		const newStatus = formData.get('status')
		const enteredPin = formData.get('pin')

		if (!orderId || !newStatus) {
			return fail(400, { message: 'Order ID and status are required' })
		}

		try {
			// Get the order details
			const orderResult = await db
				.select()
				.from(schema.orders)
				.where(eq(schema.orders.id, Number(orderId)))
				.limit(1)

			if (!orderResult.length) {
				return fail(404, { message: 'Order not found' })
			}

			const order = orderResult[0]
			const previousStatus = order.status

			// If marking as completed, validate PIN
			if (newStatus === 'completed') {
				if (!enteredPin) {
					return fail(400, { message: 'PIN is required to complete order' })
				}
				if (enteredPin !== order.otp) {
					return fail(400, { message: 'Invalid PIN' })
				}
			}

			// Update the order status
			const updateData: any = { status: newStatus }

			// Set appropriate timestamp based on status
			if (newStatus === 'preparing') {
				updateData.preparedAt = new Date()
			} else if (newStatus === 'ready') {
				updateData.readyAt = new Date()
			} else if (newStatus === 'completed') {
				updateData.completedAt = new Date()
			} else if (newStatus === 'cancelled') {
				updateData.cancelledAt = new Date()
				updateData.cancelledBy = event.locals.user.id
			}

			await db
				.update(schema.orders)
				.set(updateData)
				.where(eq(schema.orders.id, Number(orderId)))

			// Emit SSE event for order status update
			try {
				emitOrderStatusUpdate(
					{
						id: orderId.toString(),
						orderNumber: order.orderNumber,
						status: newStatus.toString(),
						canteenId: order.canteenId.toString(),
						userId: order.userId.toString(),
					},
					previousStatus,
				)
				console.log(`SSE event emitted for order ${orderId} to user ${order.userId}`)
			} catch (sseError) {
				console.error('Failed to emit order status update SSE event:', sseError)
			}

			return { success: true, message: `Order ${newStatus} successfully` }
		} catch (err) {
			console.error('Error updating order status:', err)
			return fail(500, { message: 'Failed to update order status' })
		}
	},
}
