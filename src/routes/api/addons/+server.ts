import { json } from '@sveltejs/kit'
import { db } from '$lib/server/db'
import * as schema from '$lib/server/db/schema'
import * as auth from '$lib/server/session'
import { eq } from 'drizzle-orm'
import type { RequestHandler } from './$types'

// GET - List all addons
export const GET: RequestHandler = async ({ url, locals }) => {
    if (!locals.user || !auth.ADMIN.includes(locals.user.role)) {
        return json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const itemId = url.searchParams.get('itemId')

        let addons
        if (itemId) {
            addons = await db
                .select()
                .from(schema.addons)
                .where(eq(schema.addons.itemId, parseInt(itemId)))
        } else {
            addons = await db.select().from(schema.addons)
        }

        return json(addons)
    } catch (error) {
        console.error('Error fetching addons:', error)
        return json({ error: 'Failed to fetch addons' }, { status: 500 })
    }
}

// POST - Create a new addon
export const POST: RequestHandler = async ({ request, locals }) => {
    if (!locals.user || !auth.ADMIN.includes(locals.user.role)) {
        return json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { itemId, name, price } = body

        if (!itemId || !name || !price) {
            return json({ error: 'ItemId, name, and price are required' }, { status: 400 })
        }

        const [newAddon] = await db.insert(schema.addons).values({
            itemId: parseInt(itemId),
            name,
            price: price.toString()
        }).returning()

        return json(newAddon, { status: 201 })
    } catch (error) {
        console.error('Error creating addon:', error)
        return json({ error: 'Failed to create addon' }, { status: 500 })
    }
}

// PUT - Update an addon
export const PUT: RequestHandler = async ({ request, locals }) => {
    if (!locals.user || !auth.ADMIN.includes(locals.user.role)) {
        return json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { id, itemId, name, price } = body

        if (!id) {
            return json({ error: 'Addon ID is required' }, { status: 400 })
        }

        const updateData: any = {}
        if (itemId !== undefined) updateData.itemId = parseInt(itemId)
        if (name !== undefined) updateData.name = name
        if (price !== undefined) updateData.price = price.toString()

        const [updatedAddon] = await db
            .update(schema.addons)
            .set(updateData)
            .where(eq(schema.addons.id, id))
            .returning()

        if (!updatedAddon) {
            return json({ error: 'Addon not found' }, { status: 404 })
        }

        return json(updatedAddon)
    } catch (error) {
        console.error('Error updating addon:', error)
        return json({ error: 'Failed to update addon' }, { status: 500 })
    }
}

// DELETE - Delete an addon
export const DELETE: RequestHandler = async ({ request, locals }) => {
    if (!locals.user || !auth.ADMIN.includes(locals.user.role)) {
        return json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { id } = body

        if (!id) {
            return json({ error: 'Addon ID is required' }, { status: 400 })
        }

        const [deletedAddon] = await db
            .delete(schema.addons)
            .where(eq(schema.addons.id, id))
            .returning()

        if (!deletedAddon) {
            return json({ error: 'Addon not found' }, { status: 404 })
        }

        return json({ message: 'Addon deleted successfully' })
    } catch (error) {
        console.error('Error deleting addon:', error)
        return json({ error: 'Failed to delete addon' }, { status: 500 })
    }
}
