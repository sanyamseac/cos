// Server-Sent Events endpoint for real-time notifications
import type { RequestHandler } from './$types'
import { addConnection, removeConnection } from '$lib/server/notificationService'

export const GET: RequestHandler = async ({ url, locals }) => {
	const userId = locals.user?.id

	if (!userId) {
		return new Response('Unauthorized', {
			status: 401,
			headers: { 'Content-Type': 'application/json' },
		})
	}

	// Create SSE stream
	const stream = new ReadableStream({
		start(controller) {
			console.log(`SSE connection established for user: ${userId}`)

			// Store the controller for this user
			addConnection(userId, controller)

			// Send initial connection message
			const connectMessage = `data: ${JSON.stringify({
				type: 'connected',
				message: 'Notification stream connected',
				timestamp: new Date().toISOString(),
			})}\n\n`

			controller.enqueue(connectMessage)

			// Set up keep-alive ping every 30 seconds
			const keepAliveInterval = setInterval(() => {
				try {
					const pingMessage = `data: ${JSON.stringify({
						type: 'ping',
						timestamp: new Date().toISOString(),
					})}\n\n`
					controller.enqueue(pingMessage)
				} catch (error) {
					console.error(`Keep-alive failed for user ${userId}:`, error)
					clearInterval(keepAliveInterval)
					removeConnection(userId)
				}
			}, 30000)

			// Store interval ID for cleanup
			;(controller as any)._keepAliveInterval = keepAliveInterval
		},

		cancel() {
			console.log(`SSE connection closed for user: ${userId}`)
			removeConnection(userId)
		},
	})

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive',
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Headers': 'Cache-Control',
		},
	})
}
