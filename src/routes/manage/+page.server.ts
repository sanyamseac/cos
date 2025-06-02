import { redirect } from '@sveltejs/kit'
import * as auth from '$lib/server/session'
import { db } from '$lib/server/db'
import * as schema from '$lib/server/db/schema'
import type { ServerLoad } from '@sveltejs/kit'

export const load: ServerLoad = async (event) => {
    if (!event.locals.user) {
        return redirect(302, `/login?redirect=${encodeURIComponent(event.url.href)}`)
    }

    if (!auth.ADMIN.includes(event.locals.user.role)) {
        return redirect(302, '/dashboard')
    }

    try {
        // Load all data for the admin page
        const [canteens, menuItems, addons, variants] = await Promise.all([
            db.select().from(schema.canteens),
            db.select().from(schema.menuItems),
            db.select().from(schema.addons),
            db.select().from(schema.variants)
        ])

        return {
            user: event.locals.user,
            canteens,
            menuItems,
            addons,
            variants
        }
    } catch (error) {
        console.error('Error loading admin data:', error)
        return {
            user: event.locals.user,
            canteens: [],
            menuItems: [],
            addons: [],
            variants: [],
            error: 'Failed to load admin data'
        }
    }
}
