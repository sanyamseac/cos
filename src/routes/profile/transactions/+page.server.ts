import { fail, redirect, error } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { db } from '$lib/server/db'
import * as schema from '$lib/server/db/schema'
import { eq, desc, and } from 'drizzle-orm'

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user)
		return redirect(302, `/login?redirect=${encodeURIComponent(event.url.href)}`)

	try {
		const Transactions = await db
			.select({
				transaction: schema.walletTransactions,
				wallet: schema.wallets,
				canteen: schema.canteens,
			})
			.from(schema.walletTransactions)
			.leftJoin(schema.wallets, eq(schema.walletTransactions.walletId, schema.wallets.id))
			.leftJoin(schema.canteens, eq(schema.wallets.canteenId, schema.canteens.id))
			.where(eq(schema.wallets.userId, event.locals.user.id))
			.orderBy(desc(schema.walletTransactions.createdAt))
			.limit(15)

		return {
			user: event.locals.user,
			Transactions,
		}
	} catch (err) {
		console.error('Error loading profile data:', err)
		throw error(500, 'Failed to load profile data')
	}
}
