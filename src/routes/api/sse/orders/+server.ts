import { produce } from 'sveltekit-sse'
import type { RequestHandler } from './$types'
import { sseConnections } from '$lib/server/sse-events'

// Use the shared connections map
const connections = sseConnections

export const POST: RequestHandler = async ({ locals }) => {
    // Check if user is authenticated
    if (!locals.user) {
        return new Response('Unauthorized', { status: 401 })
    }

    const userId = locals.user.id
    const userRole = locals.user.role || 'customer'

    return produce(
        function start({ emit }) {
            // Store the emit function for this user's connection
            const connectionId = `${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            connections.set(connectionId, emit)

            console.log(`SSE connection established for user ${userId} (${connectionId})`)

            // Send initial connection confirmation
            const { error } = emit('connected', JSON.stringify({
                message: 'Connected to order updates',
                userId,
                role: userRole,
                connectionId
            }))

            if (error) {
                console.error('Failed to send connection confirmation:', error)
                connections.delete(connectionId)
                return
            }

            // Keep connection alive and return cleanup function
            return function cleanup() {
                connections.delete(connectionId)
                console.log(`SSE connection closed for user ${userId} (${connectionId})`)
            }
        },
        {
            // Ping every 30 seconds to detect disconnections
            ping: 30000,
            stop() {
                console.log(`SSE connection stopped for user ${userId}`)
            }
        }
    )
}
