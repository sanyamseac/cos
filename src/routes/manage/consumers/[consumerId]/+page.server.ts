import { fail, redirect, error } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import * as auth from '$lib/server/session'
import { db } from '$lib/server/db'
import * as schema from '$lib/server/db/schema'
import { eq, desc, and } from 'drizzle-orm'

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		return redirect(302, `/login?redirect=${encodeURIComponent(event.url.href)}`)
	}
	
	if (!auth.ADMIN.includes(event.locals.user.role)) {
		throw error(403, 'Access denied')
	}

	const consumerId = event.params.consumerId

	try {
		const canteens = await db
			.select()
			.from(schema.canteens)
			.where(eq(schema.canteens.active, true))

		// Get wallet details with canteen information
		const wallets = await db
			.select({
				wallet: schema.wallets,
				canteen: schema.canteens,
			})
			.from(schema.wallets)
			.leftJoin(schema.canteens, eq(schema.wallets.canteenId, schema.canteens.id))
			.where(eq(schema.wallets.userId, consumerId))

		// Get recent wallet transactions
		const walletTransactions = await db
			.select({
				transaction: schema.walletTransactions,
				wallet: schema.wallets,
				canteen: schema.canteens,
				performedBy: schema.user,
			})
			.from(schema.walletTransactions)
			.leftJoin(schema.wallets, eq(schema.walletTransactions.walletId, schema.wallets.id))
			.leftJoin(schema.canteens, eq(schema.wallets.canteenId, schema.canteens.id))
			.leftJoin(schema.user, eq(schema.walletTransactions.performedBy, schema.user.id))
			.where(eq(schema.wallets.userId, consumerId))
			.orderBy(desc(schema.walletTransactions.createdAt))
			.limit(20)

		// Get orders with canteen information
		const orders = await db
			.select({
				order: schema.orders,
				canteen: schema.canteens,
			})
			.from(schema.orders)
			.leftJoin(schema.canteens, eq(schema.orders.canteenId, schema.canteens.id))
			.where(eq(schema.orders.userId, consumerId))
			.orderBy(desc(schema.orders.createdAt))
			.limit(10)

		// Get active baskets
		const baskets = await db
			.select({
				basket: schema.baskets,
				canteen: schema.canteens,
			})
			.from(schema.baskets)
			.leftJoin(schema.canteens, eq(schema.baskets.canteenId, schema.canteens.id))
			.where(eq(schema.baskets.createdBy, consumerId))
			.orderBy(desc(schema.baskets.updatedAt))

		return {
			user: event.locals.user,
			canteens,
			wallets,
			walletTransactions,
			orders,
			baskets,
		}
	} catch (error) {
		console.error('Error loading consumer details:', error)
		throw fail(500, { message: 'Failed to load consumer details' })
	}
}

export const actions: Actions = {
	addMoney: async (event) => {
		if (!event.locals.user) {
			throw fail(401, { message: 'Unauthorized' })
		}

		if (!auth.ADMIN.includes(event.locals.user.role)) {
			throw fail(403, { message: 'Access denied' })
		}

		const formData = await event.request.formData()
		const consumerId = event.params.consumerId
		const canteenId = parseInt(formData.get('canteenId') as string)
		const amount = parseFloat(formData.get('amount') as string)
		const reference = formData.get('reference') as string

		if (!consumerId || !canteenId || !amount || amount <= 0) {
			throw fail(400, { message: 'Invalid input data' })
		}

		try {
			// Check if wallet exists, if not create it
			let wallet = await db
				.select()
				.from(schema.wallets)
				.where(and(eq(schema.wallets.userId, consumerId), eq(schema.wallets.canteenId, canteenId)))
				.limit(1)

			if (!wallet.length) {
				// Create new wallet
				const newWallet = await db
					.insert(schema.wallets)
					.values({
						userId: consumerId,
						canteenId,
						balance: amount.toString(),
					})
					.returning()

				wallet = newWallet
			} else {
				// Update existing wallet
				const currentBalance = parseFloat(wallet[0].balance)
				const newBalance = currentBalance + amount

				await db
					.update(schema.wallets)
					.set({
						balance: newBalance.toString(),
						updatedAt: new Date(),
					})
					.where(eq(schema.wallets.id, wallet[0].id))
			}

			// Record transaction
			await db.insert(schema.walletTransactions).values({
				walletId: wallet[0].id,
				amount: amount.toString(),
				reference: reference || `Manual credit by ${event.locals.user.name}`,
				performedBy: event.locals.user.id,
			})

			return { success: true, message: 'Money added successfully' }
		} catch (error) {
			console.error('Error adding money:', error)
			throw fail(500, { message: 'Failed to add money' })
		}
	},
}
