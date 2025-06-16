import { redirect, fail } from '@sveltejs/kit'
import type { PageServerLoad, Actions } from './$types'
import { db } from '$lib/server/db'
import * as schema from '$lib/server/db/schema'
import { eq, and } from 'drizzle-orm'
import { generateId } from '$lib/helper'

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		return redirect(302, `/login?redirect=${encodeURIComponent(event.url.href)}`)
	}

	const code = event.url.searchParams.get('code')

	if (!code) {
		return redirect(302, '/basket')
	}

	return {
		code,
		user: event.locals.user,
	}
}

export const actions: Actions = {
	joinBasket: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Not authenticated' })
		}

		const formData = await request.formData()
		const accessCode = formData.get('accessCode') as string

		if (!accessCode || accessCode.length !== 8) {
			return fail(400, { error: 'Invalid access code' })
		}

		try {
			const sharedBasket = await db
				.select({
					basket: schema.baskets,
				})
				.from(schema.baskets)
				.leftJoin(schema.user, eq(schema.baskets.createdBy, schema.user.id))
				.where(eq(schema.baskets.basketAccessCode, accessCode.toUpperCase()))
				.limit(1)

			if (sharedBasket.length === 0 || !sharedBasket[0].basket) {
				return fail(400, { error: 'Invalid or expired access code' })
			}

			const { basket } = sharedBasket[0]
			const canteenId = basket.canteenId

			let userBasket = await db
				.select()
				.from(schema.baskets)
				.where(
					and(
						eq(schema.baskets.createdBy, locals.user.id),
						eq(schema.baskets.canteenId, canteenId),
					),
				)
				.limit(1)

			if (userBasket.length === 0) {
				const [newBasket] = await db
					.insert(schema.baskets)
					.values({
						id: generateId(),
						createdBy: locals.user.id,
						canteenId: canteenId,
						basketAccessCode: accessCode.toUpperCase(),
					})
					.returning()
				userBasket = [newBasket]
			} else {
				await db
					.update(schema.baskets)
					.set({
						basketAccessCode: accessCode.toUpperCase(),
						updatedAt: new Date(),
					})
					.where(eq(schema.baskets.id, userBasket[0].id))
			}

			return {
				success: true,
				message: 'Successfully joined the basket. Redirecting to your basket...',
			}
		} catch (error) {
			console.error('Error joining basket:', error)
			return fail(500, { error: 'Failed to join basket' })
		}
	},
}
