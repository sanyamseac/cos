// SSE Event utility functions
import type { Order } from '$lib/server/db/schema'

// SSE Event utility functions

// We'll create these functions here instead of importing to avoid circular dependencies

// Global connections map - this will be shared with the SSE server
const connections = new Map<string, (eventName: string, data: string) => any>()

// Export connections for use in SSE server
export { connections as sseConnections }

// Helper function to emit events to specific users
export function emitToUser(userId: string, eventName: string, data: any) {
	const dataString = typeof data === 'string' ? data : JSON.stringify(data)
	let emittedCount = 0

	console.log(`Attempting to emit ${eventName} to user ${userId}`)

	// Find all connections for this user and emit the event
	for (const [connectionId, emit] of connections) {
		if (connectionId.startsWith(userId + '_')) {
			try {
				const result = emit(eventName, dataString)
				if (result.error) {
					console.error(
						`Failed to emit to user ${userId} (${connectionId}):`,
						result.error,
					)
					// Remove failed connection
					connections.delete(connectionId)
				} else {
					emittedCount++
					console.log(
						`Successfully emitted ${eventName} to user ${userId} (${connectionId})`,
					)
				}
			} catch (error) {
				console.error(`Error emitting to user ${userId} (${connectionId}):`, error)
				connections.delete(connectionId)
			}
		}
	}

	console.log(`Emitted ${eventName} to ${emittedCount} connections for user ${userId}`)
	return emittedCount
}

// Helper function to emit events to canteen staff
export function emitToCanteen(canteenId: string, eventName: string, data: any) {
	const dataString = typeof data === 'string' ? data : JSON.stringify(data)

	// This would need to be enhanced to track which users are canteen staff
	// For now, we'll emit to all connections and let the client filter
	for (const [connectionId, emit] of connections) {
		const result = emit(eventName, dataString)
		if (result.error) {
			console.error(`Failed to emit to canteen ${canteenId}:`, result.error)
			connections.delete(connectionId)
		}
	}
}

// Helper function to broadcast to all connections
export function broadcastEvent(eventName: string, data: any) {
	const dataString = typeof data === 'string' ? data : JSON.stringify(data)

	for (const [connectionId, emit] of connections) {
		const result = emit(eventName, dataString)
		if (result.error) {
			console.error(`Failed to broadcast event:`, result.error)
			connections.delete(connectionId)
		}
	}
}

// Event type definitions
export type OrderUpdateEvent = {
	type: 'order_status_update'
	orderId: string
	orderNumber: string
	status: string
	previousStatus?: string
	canteenId: string
	userId: string
	timestamp: string
}

export type NewOrderEvent = {
	type: 'new_order'
	orderId: string
	orderNumber: string
	canteenId: string
	userId: string
	totalAmount: string
	timestamp: string
}

export type OrderEvent = OrderUpdateEvent | NewOrderEvent

// Helper function to emit order status updates
export function emitOrderStatusUpdate(
	order: {
		id: string
		orderNumber: string
		status: string
		canteenId: string
		userId: string
	},
	previousStatus?: string,
) {
	const event: OrderUpdateEvent = {
		type: 'order_status_update',
		orderId: order.id,
		orderNumber: order.orderNumber,
		status: order.status,
		previousStatus,
		canteenId: order.canteenId,
		userId: order.userId,
		timestamp: new Date().toISOString(),
	}

	console.log('Emitting order status update:', event)

	// Emit to the customer who placed the order
	try {
		const emittedCount = emitToUser(order.userId, 'order_update', event)
		if (emittedCount === 0) {
			console.warn(`No active connections found for user ${order.userId}`)
		}
	} catch (error) {
		console.error('Failed to emit order update to user:', error)
	}
}

// Helper function to emit new order events to canteen staff
export function emitNewOrderToCanteen(order: {
	id: string
	orderNumber: string
	canteenId: string
	userId: string
	totalAmount: string
}) {
	const event: NewOrderEvent = {
		type: 'new_order',
		orderId: order.id,
		orderNumber: order.orderNumber,
		canteenId: order.canteenId,
		userId: order.userId,
		totalAmount: order.totalAmount,
		timestamp: new Date().toISOString(),
	}

	// Emit to canteen staff
	try {
		emitToCanteen(order.canteenId, 'new_order', event)
	} catch (error) {
		console.error('Failed to emit new order to canteen:', error)
	}
}
