import { db } from '$lib/server/db'
import { menuItems, variants, addons, canteens } from '$lib/server/db/schema'
import { eq } from 'drizzle-orm'
import { error, fail, redirect } from '@sveltejs/kit'
import * as auth from '$lib/server/session'
import type { PageServerLoad, Actions } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
    // Check if user is authenticated and is a canteen
    if (!locals.user) {
        throw redirect(302, '/login')
    }

    if (!auth.CANTEENS.includes(locals.user.role)) {
        throw error(403, 'Access denied')
    }

    try {
        // Get canteen ID from user email (same pattern as dashboard)
        const canteenAcronym = locals.user.email.split('@')[0]
        const canteenResult = await db
            .select()
            .from(canteens)
            .where(eq(canteens.acronym, canteenAcronym))
            .limit(1)

        if (!canteenResult.length) {
            throw error(404, 'Canteen not found')
        }

        const canteen = canteenResult[0]
        const canteenId = canteen.id

        // Fetch menu items for this canteen
        const items = await db
            .select()
            .from(menuItems)
            .where(eq(menuItems.canteenId, canteenId))

        if (items.length === 0) {
            return { items: [] }
        }

        // Get all item IDs
        const itemIds = items.map(item => item.id)

        // Fetch all variants for these items
        const allVariants = await db
            .select()
            .from(variants)
            .where(eq(variants.active, true))

        // Fetch all addons for these items  
        const allAddons = await db
            .select()
            .from(addons)
            .where(eq(addons.active, true))

        // Filter variants and addons that belong to our items
        const relevantVariants = allVariants.filter(variant => itemIds.includes(variant.itemId))
        const relevantAddons = allAddons.filter(addon => itemIds.includes(addon.itemId))

        // Group variants and addons by itemId
        const variantsByItem = relevantVariants.reduce((acc, variant) => {
            if (!acc[variant.itemId]) acc[variant.itemId] = []
            acc[variant.itemId].push(variant)
            return acc
        }, {} as Record<number, typeof relevantVariants>)

        const addonsByItem = relevantAddons.reduce((acc, addon) => {
            if (!acc[addon.itemId]) acc[addon.itemId] = []
            acc[addon.itemId].push(addon)
            return acc
        }, {} as Record<number, typeof relevantAddons>)

        // Combine the data
        const itemsWithDetails = items.map(item => ({
            ...item,
            variants: variantsByItem[item.id] || [],
            addons: addonsByItem[item.id] || []
        }))

        return {
            items: itemsWithDetails
        }
    } catch (err) {
        console.error('Error fetching canteen items:', err)
        throw error(500, 'Failed to load items')
    }
}

export const actions: Actions = {
    updateItemAvailability: async ({ request, locals }) => {
        if (!locals.user) {
            return fail(401, { error: 'Unauthorized' })
        }

        const formData = await request.formData()
        const itemId = Number(formData.get('itemId'))
        const available = formData.get('available') === 'true'

        try {
            // Update the menu item
            await db
                .update(menuItems)
                .set({ available })
                .where(eq(menuItems.id, itemId))

            // Also update all variants and addons for this item
            await db
                .update(variants)
                .set({ available })
                .where(eq(variants.itemId, itemId))

            await db
                .update(addons)
                .set({ available })
                .where(eq(addons.itemId, itemId))

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
