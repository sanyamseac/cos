import { db } from '$lib/server/db'
import { menuItems, variants, addons, canteens } from '$lib/server/db/schema'
import { eq, and, desc, asc } from 'drizzle-orm'
import { error, fail, redirect } from '@sveltejs/kit'
import * as auth from '$lib/server/session'
import type { PageServerLoad, Actions } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) throw redirect(302, '/login')
    if (!auth.CANTEENS.includes(locals.user.role)) throw error(403, 'Access denied')

    try {
        const canteenAcronym = locals.user.email.split('@')[0]
        const canteenResult = await db
            .select()
            .from(canteens)
            .where(and(
                eq(canteens.acronym, canteenAcronym),
                eq(canteens.active, true)
            ))
            .limit(1)

        if (!canteenResult.length) throw error(404, 'Canteen not found')

        const canteen = canteenResult[0]
        const canteenId = canteen.id

        const [menuItemsList, variantsList, addonsList] = await Promise.all([
            db
                .select()
                .from(menuItems)
                .where(
                    and(
                        eq(menuItems.canteenId, canteenId),
                        eq(menuItems.active, true),
                    ),
                )
                .orderBy(asc(menuItems.name)),
            db
                .select()
                .from(variants)
                .where(eq(variants.active, true))
                .orderBy(asc(variants.name)),
            db
                .select()
                .from(addons)
                .where(eq(addons.active, true))
                .orderBy(asc(addons.name)),
        ])

        const variantsByItem: Record<number, any[]> = {}
        for (const v of variantsList) {
            if (!variantsByItem[v.itemId]) variantsByItem[v.itemId] = []
            variantsByItem[v.itemId].push(v)
        }
        const addonsByItem: Record<number, any[]> = {}
        for (const a of addonsList) {
            if (!addonsByItem[a.itemId]) addonsByItem[a.itemId] = []
            addonsByItem[a.itemId].push(a)
        }

        const menuItemsWithDetails = menuItemsList.map((item) => ({
            ...item,
            variants: variantsByItem[item.id] || [],
            addons: addonsByItem[item.id] || [],
        }))

        const menuCategories = menuItemsWithDetails.reduce(
            (acc: Record<string, typeof menuItemsWithDetails>, item) => {
                if (!acc[item.category]) {
                    acc[item.category] = []
                }
                acc[item.category].push(item)
                return acc
            },
            {},
        )

        return {
            canteen,
            menuCategories
        }
    } catch (err) {
        console.error('Error fetching canteen items:', err)
        throw error(500, 'Failed to load items')
    }
}

export const actions: Actions = {
    updateCanteenStatus: async ({ request, locals }) => {
        if (!locals.user) {
            return fail(401, { error: 'Unauthorized' })
        }

        const formData = await request.formData()
        const open = formData.get('open') === 'true'

        try {
            await db
                .update(canteens)
                .set({ open })
                .where(eq(canteens.acronym, locals.user.name))
            
            return { success: true }
        }
        catch (err) {
            console.error('Error updating canteen status:', err)
            return fail(500, { error: 'Failed to update canteen status' })
        }
    },

    updateItemAvailability: async ({ request, locals }) => {
        if (!locals.user)
            return fail(401, { error: 'Unauthorized' })

        const formData = await request.formData()
        const itemId = Number(formData.get('itemId'))
        const available = formData.get('available') === 'true'

        try {
            const canteen = await db
                .select({
                    id: canteens.id,
                    acronym: canteens.acronym,
                })
                .from(canteens)
                .leftJoin(menuItems, eq(canteens.id, menuItems.canteenId))
                .where(and(
                    eq(menuItems.id, itemId),
                    eq(canteens.active, true),
                    eq(menuItems.active, true)
                ))

            if (!canteen.length)
                return fail(404, { error: 'Canteen or item not found' })

            if (canteen[0].acronym !== locals.user.name)
                return fail(403, { error: 'Access denied' })

            await Promise.all([
                db
                    .update(menuItems)
                    .set({ available })
                    .where(eq(menuItems.id, itemId)),

                db
                    .update(variants)
                    .set({ available })
                    .where(eq(variants.itemId, itemId)),

                db
                    .update(addons)
                    .set({ available })
                    .where(eq(addons.itemId, itemId))
            ])

            return { success: true }
        } catch (err) {
            console.error('Error updating item availability:', err)
            return fail(500, { error: 'Failed to update item availability' })
        }
    },

    updateVariantAvailability: async ({ request, locals }) => {
        if (!locals.user) {
            return fail(401, { error: 'Unauthorized' })
        }

        const formData = await request.formData()
        const variantId = Number(formData.get('variantId'))
        const available = formData.get('available') === 'true'

        try {
            const canteen = await db
                .select({
                    id: canteens.id,
                    acronym: canteens.acronym,
                })
                .from(canteens)
                .leftJoin(menuItems, eq(canteens.id, menuItems.canteenId))
                .leftJoin(variants, eq(variants.itemId, menuItems.id))
                .where(and(
                    eq(variants.id, variantId),
                    eq(canteens.active, true),
                    eq(menuItems.active, true),
                    eq(variants.active, true)
                ))

            if (!canteen.length)
                return fail(404, { error: 'Canteen or item not found' })

            if (canteen[0].acronym !== locals.user.name)
                return fail(403, { error: 'Access denied' })

            await db
                .update(variants)
                .set({ available })
                .where(eq(variants.id, variantId))

            return { success: true }
        } catch (err) {
            console.error('Error updating variant availability:', err)
            return fail(500, { error: 'Failed to update variant availability' })
        }
    },

    updateAddonAvailability: async ({ request, locals }) => {
        if (!locals.user) {
            return fail(401, { error: 'Unauthorized' })
        }

        const formData = await request.formData()
        const addonId = Number(formData.get('addonId'))
        const available = formData.get('available') === 'true'

        try {
            const canteen = await db
                .select({
                    id: canteens.id,
                    acronym: canteens.acronym,
                })
                .from(canteens)
                .leftJoin(menuItems, eq(canteens.id, menuItems.canteenId))
                .leftJoin(addons, eq(addons.itemId, menuItems.id))
                .where(and(
                    eq(addons.id, addonId),
                    eq(canteens.active, true),
                    eq(menuItems.active, true),
                    eq(addons.active, true)
                ))

            if (!canteen.length)
                return fail(404, { error: 'Canteen or item not found' })

            if (canteen[0].acronym !== locals.user.name)
                return fail(403, { error: 'Access denied' })

            await db
                .update(addons)
                .set({ available })
                .where(eq(addons.id, addonId))

            return { success: true }
        } catch (err) {
            console.error('Error updating addon availability:', err)
            return fail(500, { error: 'Failed to update addon availability' })
        }
    }
}
