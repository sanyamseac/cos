import { type RequestHandler } from '@sveltejs/kit'
import fs from 'fs';
import path from 'path';
import { db } from '$lib/server/db'
import * as schema from '$lib/server/db/schema'
import { eq } from 'drizzle-orm'

export const GET: RequestHandler = async ({ params, locals }) => {
    if (!locals.user)
        return new Response('Login to access this API', {status: 403})

    const filename = params.filename
    if (!filename) return new Response('Filename is required', {status: 400})

    try {
        const userId = path.parse(filename).name
        const user = await db
            .select({
                visibility: schema.user.profileVisibility
            })
            .from(schema.user)
            .where(eq(schema.user.id, userId))

        if (user[0]?.visibility === 'private' && locals.user.id !== userId && locals.user.role !== 'admin')
        return new Response('User profile is hidden', {status: 403})

        const images = fs.readFileSync(
            path.join('static', 'content', 'UserImages', filename))

        const mimeType = `image/${path.extname(filename).slice(1).toLowerCase().replace('jpg', 'jpeg')}`;
        
        return new Response(images, {
            status: 200,
            headers: { 'Content-Type': mimeType },
        });
    } catch (err) {
        console.error('Error fetching user image:', err)
        return new Response('Internal Server Error', { status: 500 })
    }
}