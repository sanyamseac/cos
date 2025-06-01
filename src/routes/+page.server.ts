import { redirect, fail, error } from '@sveltejs/kit'
import * as auth from '$lib/server/session'
import type { PageServerLoad, Actions } from './details/$types'

export const load: PageServerLoad = async (event) => {
    if (event.locals.user) return redirect(302, `/dashboard`)
    return { user: event.locals.user }
}