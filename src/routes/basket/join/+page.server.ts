import { redirect, fail } from '@sveltejs/kit'
import type { PageServerLoad, Actions } from './$types'
import { db } from '$lib/server/db'
import * as schema from '$lib/server/db/schema'
import { eq, and, sql } from 'drizzle-orm'

export const load: PageServerLoad = async (event) => {
    if (!event.locals.user) {
        return redirect(302, `/login?redirect=${encodeURIComponent(event.url.href)}`)
    }

    const code = event.url.searchParams.get('code')

    if (!code) {
        // Redirect to basket page if no code provided
        return redirect(302, '/basket')
    }

    return {
        code,
        user: event.locals.user
    }
}

export const actions: Actions = {
    joinBasket: async ({ request, locals }) => {
        if (!locals.user) {
            throw fail(401, { error: 'Not authenticated' })
        }

        const formData = await request.formData()
        const accessCode = formData.get('accessCode') as string

        if (!accessCode || accessCode.length !== 8) {
            throw fail(400, { error: 'Invalid access code' })
        }

        try {
            // Find basket by access code
            const basketAccess = await db
                .select({
                    basket: schema.baskets,
                    owner: {
                        id: schema.user.id,
                        name: schema.user.name,
                    },
                    expiresAt: schema.basketAccess.expiresAt,
                })
                .from(schema.basketAccess)
                .leftJoin(schema.baskets, eq(schema.basketAccess.basketId, schema.baskets.id))
                .leftJoin(schema.user, eq(schema.baskets.createdBy, schema.user.id))
                .where(and(
                    eq(schema.basketAccess.accessCode, accessCode.toUpperCase()),
                    eq(schema.basketAccess.isOwner, true),
                    sql`${schema.basketAccess.expiresAt} > NOW()`
                ))
                .limit(1)

            if (basketAccess.length === 0) {
                throw fail(400, { error: 'Invalid or expired basket code' })
            }

            const { basket, owner } = basketAccess[0]

            if (!basket) {
                throw fail(400, { error: 'Basket not found' })
            }

            // Check if user is already in this basket
            const existingAccess = await db
                .select()
                .from(schema.basketAccess)
                .where(and(
                    eq(schema.basketAccess.basketId, basket.id),
                    eq(schema.basketAccess.userId, locals.user.id)
                ))
                .limit(1)

            if (existingAccess.length > 0) {
                return {
                    success: true,
                    message: `You're already in ${owner?.name}'s basket`,
                }
            }

            // Add user to basket
            await db
                .insert(schema.basketAccess)
                .values({
                    basketId: basket.id,
                    userId: locals.user.id,
                    isOwner: false,
                    expiresAt: basketAccess[0].expiresAt,
                })

            return {
                success: true,
                message: `You've joined ${owner?.name}'s basket`,
            }
        } catch (error) {
            console.error('Error joining basket:', error)
            if (error instanceof Object && 'status' in error) {
                throw error
            }
            throw fail(500, { error: 'Failed to join basket' })
        }
    }
}
