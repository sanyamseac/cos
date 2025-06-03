// Push unsubscribe endpoint
import type { RequestHandler } from './$types'
import { removeSubscription } from '$lib/server/notificationService'

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return new Response(JSON.stringify({ error: 'Unauthorized' }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' },
		})
	}

	try {
		const { endpoint } = await request.json()

		if (!endpoint) {
			return new Response(
				JSON.stringify({
					error: 'Endpoint is required',
				}),
				{
					status: 400,
					headers: { 'Content-Type': 'application/json' },
				},
			)
		}
		// Remove subscription by endpoint
		const removed = removeSubscription(endpoint)

		console.log(`Push subscription removed for endpoint: ${endpoint}, success: ${removed}`)

		return new Response(
			JSON.stringify({
				success: true,
				message: removed ? 'Subscription removed successfully' : 'Subscription not found',
			}),
			{
				headers: { 'Content-Type': 'application/json' },
			},
		)
	} catch (error) {
		console.error('Error removing push subscription:', error)
		return new Response(
			JSON.stringify({
				error: 'Failed to remove subscription',
			}),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			},
		)
	}
}
