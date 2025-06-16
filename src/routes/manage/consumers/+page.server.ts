import { fail, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import * as auth from '$lib/server/session'
import { db } from '$lib/server/db'
import * as schema from '$lib/server/db/schema'
import { eq, sql, sum, count } from 'drizzle-orm'

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		return redirect(302, `/login?redirect=${encodeURIComponent(event.url.href)}`)
	}
	if (!auth.ADMIN.includes(event.locals.user.role)) {
		throw fail(403, { message: 'Access denied' })
	}

	try {
		const usersWithStats = await db
			.select({
				id: schema.user.id,
				name: schema.user.name,
				email: schema.user.email,
				profilePicture: schema.user.profilePicture,
				totalWalletBalance: sql<number>`COALESCE(SUM(DISTINCT ${schema.wallets.balance}), 0)`,
				orderCount: sql<number>`COUNT(DISTINCT ${schema.orders.id})`,
			})
			.from(schema.user)
			.leftJoin(schema.wallets, eq(schema.user.id, schema.wallets.userId))
			.leftJoin(schema.orders, eq(schema.user.id, schema.orders.userId))
			.leftJoin(schema.canteens, eq(schema.wallets.canteenId, schema.canteens.id))
			.groupBy(schema.user.id)
			.orderBy(schema.user.name)

		return {
			users: usersWithStats,
		}
	} catch (error) {
		console.error('Error loading consumer data:', error)
		throw fail(500, { message: 'Failed to load consumer data' })
	}
}

export const actions: Actions = {}
