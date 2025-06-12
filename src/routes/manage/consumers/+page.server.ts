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
				role: schema.user.role,
				profilePicture: schema.user.profilePicture,
				totalWalletBalance: sql<string>`COALESCE(SUM(CASE WHEN ${schema.canteens.active} = true THEN ${schema.wallets.balance} ELSE 0 END), '0.00')`,
				orderCount: sql<number>`COALESCE(COUNT(DISTINCT ${schema.orders.id}), 0)`,
			})
			.from(schema.user)
			.leftJoin(schema.wallets, eq(schema.user.id, schema.wallets.userId))
			.leftJoin(schema.canteens, eq(schema.wallets.canteenId, schema.canteens.id))
			.leftJoin(schema.orders, eq(schema.user.id, schema.orders.userId))
			.groupBy(
				schema.user.id,
				schema.user.name,
				schema.user.email,
				schema.user.role
			)
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
