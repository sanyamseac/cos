import { fail, redirect, error } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import * as auth from '$lib/server/session'
import { db } from '$lib/server/db'
import * as schema from '$lib/server/db/schema'
import { eq, desc, and } from 'drizzle-orm'
import { formatPrice } from '$lib/utils'
import { sendToUser, type NotificationPayload } from '$lib/server/notificationService'

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user)
		return redirect(302, `/login?redirect=${encodeURIComponent(event.url.href)}`)

	if (!auth.ADMIN.includes(event.locals.user.role)) throw error(403, 'Access denied')

	const consumerId = event.params.consumerId

	try {
		const [consumer, canteens, wallets, walletTransactions, orders, baskets] =
			await Promise.all([
				db.select().from(schema.user).where(eq(schema.user.id, consumerId)),

				db.select().from(schema.canteens).where(eq(schema.canteens.active, true)),

				db
					.select({
						wallet: schema.wallets,
						canteen: schema.canteens,
					})
					.from(schema.wallets)
					.leftJoin(schema.canteens, eq(schema.wallets.canteenId, schema.canteens.id))
					.where(eq(schema.wallets.userId, consumerId)),

				db
					.select({
						transaction: schema.walletTransactions,
						wallet: schema.wallets,
						canteen: schema.canteens,
						performedBy: schema.user,
					})
					.from(schema.walletTransactions)
					.leftJoin(
						schema.wallets,
						eq(schema.walletTransactions.walletId, schema.wallets.id),
					)
					.leftJoin(schema.canteens, eq(schema.wallets.canteenId, schema.canteens.id))
					.leftJoin(
						schema.user,
						eq(schema.walletTransactions.performedBy, schema.user.id),
					)
					.where(eq(schema.wallets.userId, consumerId))
					.orderBy(desc(schema.walletTransactions.createdAt))
					.limit(20),

				db
					.select({
						order: schema.orders,
						canteen: schema.canteens,
					})
					.from(schema.orders)
					.leftJoin(schema.canteens, eq(schema.orders.canteenId, schema.canteens.id))
					.where(eq(schema.orders.userId, consumerId))
					.orderBy(desc(schema.orders.createdAt))
					.limit(10),

				db
					.select({
						basket: schema.baskets,
						canteen: schema.canteens,
					})
					.from(schema.baskets)
					.leftJoin(schema.canteens, eq(schema.baskets.canteenId, schema.canteens.id))
					.where(eq(schema.baskets.createdBy, consumerId))
					.orderBy(desc(schema.baskets.updatedAt)),
			])

		return {
			user: event.locals.user,
			consumer: consumer[0],
			canteens,
			wallets,
			walletTransactions,
			orders,
			baskets,
		}
	} catch (err) {
		console.error('Error loading consumer details:', err)
		throw error(500, 'Failed to load consumer details')
	}
}

export const actions: Actions = {
	addMoney: async (event) => {
		if (!event.locals.user) {
			throw fail(401, { message: 'Unauthorized' })
		}

		if (!auth.ADMIN.includes(event.locals.user.role))
			return fail(403, { message: 'Access denied' })

		const formData = await event.request.formData()
		const consumerId = event.params.consumerId
		const canteenId = parseInt(formData.get('canteenId') as string)
		const amount = parseFloat(formData.get('amount') as string)
		const reference = formData.get('reference') as string

		if (!consumerId || !canteenId || !amount) {
			throw fail(400, { message: 'Invalid input data' })
		}

		try {
			// Check if wallet exists, if not create it
			let wallet = await db
				.select()
				.from(schema.wallets)
				.where(
					and(
						eq(schema.wallets.userId, consumerId),
						eq(schema.wallets.canteenId, canteenId),
					),
				)
				.limit(1)

			if (!wallet.length) {
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

			await db.insert(schema.walletTransactions).values({
				walletId: wallet[0].id,
				amount: amount.toString(),
				reference: reference || `Manual transaction by ${event.locals.user.role}`,
				performedBy: event.locals.user.id,
			})

			const payload: NotificationPayload = {
				title: 'Money Added',
				body: `${formatPrice(amount)} added to your wallet.`,
				icon: '/favicon.png',
				badge: '/favicon.png',
				tag: 'default',
				data: '',
				url: `/profile`,
				requireInteraction: false,
				actions: [
					{
						action: 'view',
						title: 'View',
					},
					{
						action: 'dismiss',
						title: 'Dismiss',
					},
				],
			}

			await sendToUser(event.locals.user.id, payload)

			return { success: true, message: 'Money added successfully' }
		} catch (error) {
			console.error('Error adding money:', error)
			throw fail(500, { message: 'Failed to add money' })
		}
	},
}
