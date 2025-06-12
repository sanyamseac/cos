// Clean API endpoint for sending notifications
import type { RequestHandler } from './$types'
import {
	sendToUser,
	broadcast,
	type NotificationPayload,
} from '$lib/server/notificationService'

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return new Response(JSON.stringify({ error: 'Unauthorized' }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' },
		})
	}

	try {
		const data = await request.json()
		const { type, userId, broadcast: isBroadcast, ...notificationData } = data

		// Handle both type='broadcast' and broadcast=true formats for backward compatibility
		const shouldBroadcast = type === 'broadcast' || isBroadcast === true

		// Create standard notification payload
		const payload: NotificationPayload = {
			title: notificationData.title || 'Canteen Notification',
			body: notificationData.body || 'You have a new notification',
			icon: notificationData.icon || '/favicon.png',
			badge: notificationData.badge || '/favicon.png',
			tag: notificationData.tag || 'default',
			data: notificationData.data,
			url: notificationData.url,
			requireInteraction: notificationData.requireInteraction || false,
			actions: notificationData.actions || [
				{
					action: 'view',
					title: 'View',
					icon: '/favicon.png',
				},
				{
					action: 'dismiss',
					title: 'Dismiss',
				},
			],
		}

		let result

		if (shouldBroadcast) {
			// Broadcast to all users
			result = await broadcast(payload)
		} else if (userId) {
			// Send to specific user
			result = await sendToUser(userId, payload)
		} else {
			return new Response(
				JSON.stringify({
					error: 'Either specify userId for targeted notification or use broadcast=true/type=broadcast for broadcast',
				}),
				{
					status: 400,
					headers: { 'Content-Type': 'application/json' },
				},
			)
		}

		return new Response(
			JSON.stringify({
				success: result.success,
				message: `Notification ${shouldBroadcast ? 'broadcast' : 'sent'} successfully`,
				stats: {
					sent: result.sent,
					failed: result.failed,
				},
			}),
			{
				headers: { 'Content-Type': 'application/json' },
			},
		)
	} catch (error) {
		console.error('Error sending notification:', error)
		return new Response(
			JSON.stringify({
				error: 'Failed to send notification',
				details: error instanceof Error ? error.message : 'Unknown error',
			}),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			},
		)
	}
}
