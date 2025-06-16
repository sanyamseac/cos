import { redirect, error } from '@sveltejs/kit'
import * as auth from '$lib/server/session'
import { db } from '$lib/server/db'
import * as schema from '$lib/server/db/schema'
import { eq, desc, sum, count, and, gte, lt, sql } from 'drizzle-orm'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user)
		return redirect(302, `/login?redirect=${encodeURIComponent(event.url.href)}`)
	if (!auth.CONSUMER.includes(event.locals.user.role)) throw error(403, 'Access denied')

	try {
		const userId = event.locals.user.id
		const now = new Date()
		const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
		const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

		const currentHour = now.getHours()
		const timeRangeStart = new Date(now)
		timeRangeStart.setHours(currentHour - 2, 0, 0, 0)
		const timeRangeEnd = new Date(now)
		timeRangeEnd.setHours(currentHour + 2, 59, 59, 999)

		const [
			thisMonthSpentResult,
			lastMonthSpentResult,
			favoriteCanteenResult,
			quickOrdersResult,
			canteenStatsResult,
		] = await Promise.all([
			db
				.select({
					total: sum(schema.orders.totalAmount),
					count: count(),
				})
				.from(schema.orders)
				.where(
					and(
						eq(schema.orders.userId, userId),
						gte(schema.orders.createdAt, thisMonth),
						eq(schema.orders.status, 'completed'),
					),
				),

			db
				.select({
					total: sum(schema.orders.totalAmount),
					count: count(),
				})
				.from(schema.orders)
				.where(
					and(
						eq(schema.orders.userId, userId),
						gte(schema.orders.createdAt, lastMonth),
						lt(schema.orders.createdAt, thisMonth),
						eq(schema.orders.status, 'completed'),
					),
				),

			db
				.select({
					canteen: schema.canteens,
					orderCount: count(),
				})
				.from(schema.orders)
				.leftJoin(schema.canteens, eq(schema.orders.canteenId, schema.canteens.id))
				.where(and(eq(schema.orders.userId, userId), eq(schema.canteens.active, true)))
				.groupBy(schema.canteens.id)
				.orderBy(desc(count()))
				.limit(1),

			db
				.select({
					menuItem: schema.menuItems,
					canteen: schema.canteens,
					orderCount: count(),
				})
				.from(schema.orderItems)
				.leftJoin(schema.orders, eq(schema.orderItems.orderId, schema.orders.id))
				.leftJoin(schema.menuItems, eq(schema.orderItems.menuItemId, schema.menuItems.id))
				.leftJoin(schema.canteens, eq(schema.menuItems.canteenId, schema.canteens.id))
				.where(
					and(
						eq(schema.orders.userId, userId),
						eq(schema.menuItems.available, true),
						eq(schema.canteens.active, true),
					),
				)
				.groupBy(schema.menuItems.id, schema.canteens.id)
				.orderBy(desc(count()))
				.limit(6),

			db
				.select({
					canteen: schema.canteens,
					totalSpent: sum(schema.orders.totalAmount),
					orderCount: count(),
				})
				.from(schema.orders)
				.leftJoin(schema.canteens, eq(schema.orders.canteenId, schema.canteens.id))
				.where(
					and(
						eq(schema.orders.userId, userId),
						eq(schema.orders.status, 'completed'),
						eq(schema.canteens.active, true),
						gte(schema.orders.createdAt, thisMonth),
					),
				)
				.groupBy(schema.canteens.id)
				.orderBy(desc(sum(schema.orders.totalAmount))),
		])

		const thisMonthSpent = parseFloat(thisMonthSpentResult[0]?.total || '0')
		const lastMonthSpent = parseFloat(lastMonthSpentResult[0]?.total || '0')
		const thisMonthOrders = thisMonthSpentResult[0]?.count || 0
		const lastMonthOrders = lastMonthSpentResult[0]?.count || 0

		const spentTrend =
			lastMonthSpent > 0
				? (((thisMonthSpent - lastMonthSpent) / lastMonthSpent) * 100).toFixed(1)
				: thisMonthSpent > 0
					? '100'
					: '0'
		const ordersTrend = thisMonthOrders - lastMonthOrders

		return {
			user: event.locals.user,
			stats: {
				totalSpent: thisMonthSpent,
				ordersThisMonth: thisMonthOrders,
				favoriteCanteen: favoriteCanteenResult[0]?.canteen?.name || 'No orders yet',
				spentTrend: {
					value: spentTrend,
					isUp: parseFloat(spentTrend) >= 0,
				},
				ordersTrend: {
					value: ordersTrend,
					isUp: ordersTrend >= 0,
				},
			},
			quickOrders: quickOrdersResult
				.filter((item) => item.menuItem && item.canteen)
				.map((item) => ({
					id: item.menuItem!.id,
					name: item.menuItem!.name,
					price: parseFloat(item.menuItem!.price),
					canteen: item.canteen!.name,
					image: item.menuItem!.image || '/defaultMenuItem.png',
				})),
			canteenStats: canteenStatsResult
				.filter((item) => item.canteen)
				.map((item) => ({
					name: item.canteen!.name,
					spent: parseFloat(item.totalSpent || '0'),
					orders: item.orderCount,
					rating: Math.min(5.0, 4.0 + item.orderCount * 0.1), // TODO: Replace with actual ratings
				})),
		}
	} catch (err) {
		console.error('Error loading dashboard data:', err)
		throw error(500, 'Failed to load dashboard data')
	}
}
