import { redirect, fail } from '@sveltejs/kit'
import * as auth from '$lib/server/session'
import { db } from '$lib/server/db'
import * as schema from '$lib/server/db/schema'
import { eq, desc } from 'drizzle-orm'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user)
		return redirect(302, `/login?redirect=${encodeURIComponent(event.url.href)}`)
	if (!auth.CONSUMER.includes(event.locals.user.role))
		return fail(403, { message: 'Access denied' })

	try {
		// Get user's orders with canteen information
		const orders = await db
			.select({
				order: schema.orders,
				canteen: schema.canteens,
			})
			.from(schema.orders)
			.leftJoin(schema.canteens, eq(schema.orders.canteenId, schema.canteens.id))
			.where(eq(schema.orders.userId, event.locals.user.id))
			.orderBy(desc(schema.orders.createdAt))

		return { 
			user: event.locals.user,
			orders
		}
	} catch (error) {
		console.error('Error loading orders:', error)
		throw fail(500, { message: 'Failed to load orders' })
	}
}
