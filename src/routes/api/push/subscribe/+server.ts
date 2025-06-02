// Push subscription management
import type { RequestHandler } from './$types'
import { addSubscription } from '$lib/server/notificationService'

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return new Response(JSON.stringify({ error: 'Unauthorized' }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' }
		})
	}
	
	try {
		const subscriptionData = await request.json()
		const { endpoint, keys, userId } = subscriptionData
		
		// Validate required fields
		if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
			return new Response(JSON.stringify({ 
				error: 'Invalid subscription data' 
			}), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			})
		}		// Store subscription
		const subscription = {
			endpoint,
			keys: {
				p256dh: keys.p256dh,
				auth: keys.auth
			}
		}
		
		const subscriptionId = addSubscription(userId || locals.user.id, subscription)
		
		console.log(`Push subscription stored for user: ${userId || locals.user.id} with endpoint: ${subscriptionId}`)
		
		return new Response(JSON.stringify({
			success: true,
			message: 'Subscription stored successfully'
		}), {
			headers: { 'Content-Type': 'application/json' }
		})
		
	} catch (error) {
		console.error('Error storing push subscription:', error)
		return new Response(JSON.stringify({
			error: 'Failed to store subscription'
		}), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		})
	}
}
