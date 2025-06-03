import type { PageServerLoad } from './$types'
import { redirect } from '@sveltejs/kit'

export const load: PageServerLoad = async ({ locals }) => {
	// Only allow logged-in users to access the demo page
	if (!locals.user) {
		throw redirect(302, '/login?redirect=/demo')
	}

	return {
		user: locals.user,
	}
}
