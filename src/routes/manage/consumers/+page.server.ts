import { fail, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import * as auth from '$lib/server/session'
import { db } from '$lib/server/db'
import * as schema from '$lib/server/db/schema'
import { eq } from 'drizzle-orm'

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		return redirect(302, `/login?redirect=${encodeURIComponent(event.url.href)}`)
	}
	
	if (!auth.ADMIN.includes(event.locals.user.role)) {
		throw fail(403, { message: 'Access denied' })
	}
	try {
		// Get all consumers with aggregated wallet balances
		const users = await db
			.select({
				id: schema.user.id,
				name: schema.user.name,
				email: schema.user.email,
				role: schema.user.role,
			})
			.from(schema.user)

		// Get wallet summary for each user
		const walletSummaries = await db
			.select({
				userId: schema.wallets.userId,
				totalBalance: schema.wallets.balance,
				canteenCount: schema.wallets.canteenId,
			})
			.from(schema.wallets)
			.leftJoin(schema.canteens, eq(schema.wallets.canteenId, schema.canteens.id))
			.where(eq(schema.canteens.active, true))

		// Get order counts for each user
		const orderCounts = await db
			.select({
				userId: schema.orders.userId,
				orderCount: schema.orders.id,
			})
			.from(schema.orders)

		return {
			users,
			walletSummaries,
			orderCounts,
		}
	} catch (error) {
		console.error('Error loading consumer data:', error)
		throw fail(500, { message: 'Failed to load consumer data' })
	}
}

export const actions: Actions = {}
