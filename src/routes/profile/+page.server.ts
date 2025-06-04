import * as auth from '$lib/server/session'
import { fail, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { db } from '$lib/server/db'
import * as schema from '$lib/server/db/schema'
import { eq, desc, and } from 'drizzle-orm'

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user)
		return redirect(302, `/login?redirect=${encodeURIComponent(event.url.href)}`)
	if (!auth.CONSUMER.includes(event.locals.user.role))
		return fail(403, { message: 'Access denied' })

	try {
		// Get wallet information
		const wallets = await db
			.select({
				wallet: schema.wallets,
				canteen: schema.canteens,
			})
			.from(schema.wallets)
			.leftJoin(schema.canteens, eq(schema.wallets.canteenId, schema.canteens.id))
			.where(and(eq(schema.wallets.userId, event.locals.user.id), eq(schema.canteens.active, true)))

		// Get recent wallet transactions
		const recentTransactions = await db
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
			.where(eq(schema.wallets.userId, event.locals.user.id))
			.orderBy(desc(schema.walletTransactions.createdAt))
			.limit(5)

		// For now, returning a fixed profile picture URL
		// This will be replaced with actual database call later
		const profilePictureUrl =
			'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face&auto=format'

		return {
			user: {
				...event.locals.user,
				profilePicture: profilePictureUrl,
			},
			wallets,
			recentTransactions,
		}
	} catch (error) {
		console.error('Error loading profile data:', error)
		return fail(500, { message: 'Failed to load profile data' })
	}
}

export const actions: Actions = {
	updateProfilePicture: async (event) => {
		if (!event.locals.user) return fail(401, { message: 'Unauthorized' })

		const data = await event.request.formData()
		const profilePictureUrl = data.get('profilePictureUrl') as string

		if (!profilePictureUrl) {
			return fail(400, { message: 'Profile picture URL is required' })
		}

		// TODO: Update the profile picture in the database
		// For now, we'll just log the URL and return success
		console.log(
			'Updating profile picture for user',
			event.locals.user.id,
			'to:',
			profilePictureUrl,
		)

		// In a real implementation, you would:
		// 1. Validate the URL or uploaded image
		// 2. Save the URL to the database
		// 3. Handle image uploads to a CDN/storage service if needed

		return { success: true, profilePictureUrl }
	},
}
