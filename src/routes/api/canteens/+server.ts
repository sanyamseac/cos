import { json } from '@sveltejs/kit'
import { db } from '$lib/server/db'
import * as schema from '$lib/server/db/schema'
import * as auth from '$lib/server/session'
import { eq } from 'drizzle-orm'
import type { RequestHandler } from './$types'

// GET - List all canteens
export const GET: RequestHandler = async ({ locals }) => {
    if (!locals.user || !auth.ADMIN.includes(locals.user.role)) {
        return json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const canteens = await db.select().from(schema.canteens)
        return json(canteens)
    } catch (error) {
        console.error('Error fetching canteens:', error)
        return json({ error: 'Failed to fetch canteens' }, { status: 500 })
    }
}

// POST - Create a new canteen
export const POST: RequestHandler = async ({ request, locals }) => {
    if (!locals.user || !auth.ADMIN.includes(locals.user.role)) {
        return json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { name, timings, is_open } = body

        if (!name || !timings) {
            return json({ error: 'Name and timings are required' }, { status: 400 })
        }

        const [newCanteen] = await db.insert(schema.canteens).values({
            name,
            timings,
            is_open: is_open ?? true
        }).returning()

        return json(newCanteen, { status: 201 })
    } catch (error) {
        console.error('Error creating canteen:', error)
        return json({ error: 'Failed to create canteen' }, { status: 500 })
    }
}

// PUT - Update a canteen
export const PUT: RequestHandler = async ({ request, locals }) => {
    if (!locals.user || !auth.ADMIN.includes(locals.user.role)) {
        return json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { id, name, timings, is_open } = body

        if (!id) {
            return json({ error: 'Canteen ID is required' }, { status: 400 })
        }

        const [updatedCanteen] = await db
            .update(schema.canteens)
            .set({ name, timings, is_open })
            .where(eq(schema.canteens.id, id))
            .returning()

        if (!updatedCanteen) {
            return json({ error: 'Canteen not found' }, { status: 404 })
        }

        return json(updatedCanteen)
    } catch (error) {
        console.error('Error updating canteen:', error)
        return json({ error: 'Failed to update canteen' }, { status: 500 })
    }
}

// DELETE - Delete a canteen
export const DELETE: RequestHandler = async ({ request, locals }) => {
    if (!locals.user || !auth.ADMIN.includes(locals.user.role)) {
        return json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { id } = body

        if (!id) {
            return json({ error: 'Canteen ID is required' }, { status: 400 })
        }

        const [deletedCanteen] = await db
            .delete(schema.canteens)
            .where(eq(schema.canteens.id, id))
            .returning()

        if (!deletedCanteen) {
            return json({ error: 'Canteen not found' }, { status: 404 })
        }

        return json({ message: 'Canteen deleted successfully' })
    } catch (error) {
        console.error('Error deleting canteen:', error)
        return json({ error: 'Failed to delete canteen' }, { status: 500 })
    }
}
