import * as auth from '$lib/server/session'
import { fail, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) return redirect(302, `/login?redirect=${encodeURIComponent(event.url.href)}`)
	if (!auth.CONSUMER.includes(event.locals.user.role)) return fail(403, { message: 'Access denied' })
	
	// For now, returning a fixed profile picture URL
	// This will be replaced with actual database call later
	const profilePictureUrl = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face&auto=format"
	
	return { 
		user: {
			...event.locals.user,
			profilePicture: profilePictureUrl
		}
	}
}

export const actions: Actions = {
	updateProfilePicture: async (event) => {
		if (!event.locals.user) return fail(401, { message: 'Unauthorized' })
		
		const data = await event.request.formData()
		const profilePictureUrl = data.get('profilePictureUrl') as string
		
		if (!profilePictureUrl) {
			return fail(400, { message: 'Profile picture URL is required' })
		}
		
		// TODO: Update the profile picture in the database
		// For now, we'll just log the URL and return success
		console.log('Updating profile picture for user', event.locals.user.id, 'to:', profilePictureUrl)
		
		// In a real implementation, you would:
		// 1. Validate the URL or uploaded image
		// 2. Save the URL to the database
		// 3. Handle image uploads to a CDN/storage service if needed
		
		return { success: true, profilePictureUrl }
	}
}
