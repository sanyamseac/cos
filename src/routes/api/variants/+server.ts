import { json } from '@sveltejs/kit'
import { db } from '$lib/server/db'
import * as schema from '$lib/server/db/schema'
import * as auth from '$lib/server/session'
import { eq } from 'drizzle-orm'
import type { RequestHandler } from './$types'

// GET - List all variants
export const GET: RequestHandler = async ({ url, locals }) => {
    if (!locals.user || !auth.ADMIN.includes(locals.user.role)) {
        return json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const itemId = url.searchParams.get('itemId')

        let variants
        if (itemId) {
            variants = await db
                .select()
                .from(schema.variants)
                .where(eq(schema.variants.itemId, parseInt(itemId)))
        } else {
            variants = await db.select().from(schema.variants)
        }

        return json(variants)
    } catch (error) {
        console.error('Error fetching variants:', error)
        return json({ error: 'Failed to fetch variants' }, { status: 500 })
    }
}

// POST - Create a new variant
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

        const [newVariant] = await db.insert(schema.variants).values({
            itemId: parseInt(itemId),
            name,
            price: price.toString()
        }).returning()

        return json(newVariant, { status: 201 })
    } catch (error) {
        console.error('Error creating variant:', error)
        return json({ error: 'Failed to create variant' }, { status: 500 })
    }
}

// PUT - Update a variant
export const PUT: RequestHandler = async ({ request, locals }) => {
    if (!locals.user || !auth.ADMIN.includes(locals.user.role)) {
        return json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { id, itemId, name, price } = body

        if (!id) {
            return json({ error: 'Variant ID is required' }, { status: 400 })
        }

        const updateData: any = {}
        if (itemId !== undefined) updateData.itemId = parseInt(itemId)
        if (name !== undefined) updateData.name = name
        if (price !== undefined) updateData.price = price.toString()

        const [updatedVariant] = await db
            .update(schema.variants)
            .set(updateData)
            .where(eq(schema.variants.id, id))
            .returning()

        if (!updatedVariant) {
            return json({ error: 'Variant not found' }, { status: 404 })
        }

        return json(updatedVariant)
    } catch (error) {
        console.error('Error updating variant:', error)
        return json({ error: 'Failed to update variant' }, { status: 500 })
    }
}

// DELETE - Delete a variant
export const DELETE: RequestHandler = async ({ request, locals }) => {
    if (!locals.user || !auth.ADMIN.includes(locals.user.role)) {
        return json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { id } = body

        if (!id) {
            return json({ error: 'Variant ID is required' }, { status: 400 })
        }

        const [deletedVariant] = await db
            .delete(schema.variants)
            .where(eq(schema.variants.id, id))
            .returning()

        if (!deletedVariant) {
            return json({ error: 'Variant not found' }, { status: 404 })
        }

        return json({ message: 'Variant deleted successfully' })
    } catch (error) {
        console.error('Error deleting variant:', error)
        return json({ error: 'Failed to delete variant' }, { status: 500 })
    }
}
