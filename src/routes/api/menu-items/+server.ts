import { json } from '@sveltejs/kit'
import { db } from '$lib/server/db'
import * as schema from '$lib/server/db/schema'
import * as auth from '$lib/server/session'
import { eq } from 'drizzle-orm'
import type { RequestHandler } from './$types'

// GET - List all menu items
export const GET: RequestHandler = async ({ url, locals }) => {
    if (!locals.user || !auth.ADMIN.includes(locals.user.role)) {
        return json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const canteenId = url.searchParams.get('canteenId')

        let items
        if (canteenId) {
            items = await db
                .select()
                .from(schema.menuItems)
                .where(eq(schema.menuItems.canteenId, parseInt(canteenId)))
        } else {
            items = await db.select().from(schema.menuItems)
        }

        return json(items)
    } catch (error) {
        console.error('Error fetching menu items:', error)
        return json({ error: 'Failed to fetch menu items' }, { status: 500 })
    }
}

// POST - Create a new menu item
export const POST: RequestHandler = async ({ request, locals }) => {
    if (!locals.user || !auth.ADMIN.includes(locals.user.role)) {
        return json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { canteenId, category, name, price, isAvailable, isNonVeg } = body

        if (!canteenId || !category || !name || !price) {
            return json({ error: 'CanteenId, category, name, and price are required' }, { status: 400 })
        }

        const [newItem] = await db.insert(schema.menuItems).values({
            canteenId: parseInt(canteenId),
            category,
            name,
            price: price.toString(),
            isAvailable: isAvailable ?? true,
            isNonVeg: isNonVeg ?? false
        }).returning()

        return json(newItem, { status: 201 })
    } catch (error) {
        console.error('Error creating menu item:', error)
        return json({ error: 'Failed to create menu item' }, { status: 500 })
    }
}

// PUT - Update a menu item
export const PUT: RequestHandler = async ({ request, locals }) => {
    if (!locals.user || !auth.ADMIN.includes(locals.user.role)) {
        return json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { id, canteenId, category, name, price, isAvailable, isNonVeg } = body

        if (!id) {
            return json({ error: 'Menu item ID is required' }, { status: 400 })
        }

        const updateData: any = {}
        if (canteenId !== undefined) updateData.canteenId = parseInt(canteenId)
        if (category !== undefined) updateData.category = category
        if (name !== undefined) updateData.name = name
        if (price !== undefined) updateData.price = price.toString()
        if (isAvailable !== undefined) updateData.isAvailable = isAvailable
        if (isNonVeg !== undefined) updateData.isNonVeg = isNonVeg

        const [updatedItem] = await db
            .update(schema.menuItems)
            .set(updateData)
            .where(eq(schema.menuItems.id, id))
            .returning()

        if (!updatedItem) {
            return json({ error: 'Menu item not found' }, { status: 404 })
        }

        return json(updatedItem)
    } catch (error) {
        console.error('Error updating menu item:', error)
        return json({ error: 'Failed to update menu item' }, { status: 500 })
    }
}

// DELETE - Delete a menu item
export const DELETE: RequestHandler = async ({ request, locals }) => {
    if (!locals.user || !auth.ADMIN.includes(locals.user.role)) {
        return json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { id } = body

        if (!id) {
            return json({ error: 'Menu item ID is required' }, { status: 400 })
        }

        const [deletedItem] = await db
            .delete(schema.menuItems)
            .where(eq(schema.menuItems.id, id))
            .returning()

        if (!deletedItem) {
            return json({ error: 'Menu item not found' }, { status: 404 })
        }

        return json({ message: 'Menu item deleted successfully' })
    } catch (error) {
        console.error('Error deleting menu item:', error)
        return json({ error: 'Failed to delete menu item' }, { status: 500 })
    }
}
