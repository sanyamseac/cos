// Consolidated Browser Notification Service
// Handles requesting permissions, sending notifications, and managing notification preferences
import { serviceWorkerManager } from './serviceWorkerManager'

export interface NotificationPayload {
	title: string
	body: string
	icon?: string
	badge?: string
	tag?: string
	data?: any
	requireInteraction?: boolean
	actions?: Array<{
		action: string
		title: string
		icon?: string
	}>
}

export interface OrderNotification extends NotificationPayload {
	orderId: string
	orderStatus: 'preparing' | 'ready' | 'completed' | 'cancelled'
	estimatedTime?: number
}

class NotificationService {
	private permission: NotificationPermission = 'default'
	private useServiceWorker: boolean = false

	constructor() {
		if (typeof window !== 'undefined' && 'Notification' in window) {
			this.permission = Notification.permission
			// Check if service worker is available for enhanced notifications
			this.useServiceWorker = serviceWorkerManager.isSupported
		}
	}

	/**
	 * Request notification permission from the user
	 */
	async requestPermission(): Promise<NotificationPermission> {
		if (typeof window === 'undefined' || !('Notification' in window)) {
			console.warn('Browser notifications are not supported')
			return 'denied'
		}

		try {
			this.permission = await Notification.requestPermission()
			
			// If permission granted and service worker is available, try to enable push notifications
			if (this.permission === 'granted' && this.useServiceWorker) {
				await serviceWorkerManager.initializeServiceWorker()
			}
			
			return this.permission
		} catch (error) {
			console.error('Error requesting notification permission:', error)
			return 'denied'
		}
	}

	/**
	 * Check if notifications are supported and permitted
	 */
	get isSupported(): boolean {
		return typeof window !== 'undefined' && 'Notification' in window
	}

	get isPermitted(): boolean {
		return this.permission === 'granted'
	}

	get permissionStatus(): NotificationPermission {
		return this.permission
	}

	/**
	 * Enable push notifications (Service Worker based)
	 */
	async enablePushNotifications(userId: string): Promise<boolean> {
		if (!this.useServiceWorker || !this.isPermitted) {
			console.warn('Cannot enable push notifications: requirements not met')
			return false
		}

		try {
			const subscription = await serviceWorkerManager.subscribeToPush(userId)
			if (subscription) {
				console.log('Push notifications enabled successfully')
				return true
			}
			return false
		} catch (error) {
			console.error('Failed to enable push notifications:', error)
			return false
		}
	}

	/**
	 * Disable push notifications
	 */
	async disablePushNotifications(userId: string): Promise<boolean> {
		if (!this.useServiceWorker) {
			return true
		}

		try {
			return await serviceWorkerManager.unsubscribeFromPush(userId)
		} catch (error) {
			console.error('Failed to disable push notifications:', error)
			return false
		}
	}

	/**
	 * Send a browser notification
	 */
	async sendNotification(payload: NotificationPayload): Promise<Notification | null> {
		if (!this.isSupported) {
			console.warn('Notifications not supported')
			return null
		}

		if (!this.isPermitted) {
			console.warn('Notification permission not granted')
			return null
		}

		try {
			// Use Service Worker notification if available for better background support
			if (this.useServiceWorker && serviceWorkerManager.getState().isRegistered) {
				const registration = serviceWorkerManager.getState().registration
				if (registration) {
					await registration.showNotification(payload.title, {
						body: payload.body,
						icon: payload.icon || '/favicon.png',
						badge: payload.badge || '/favicon.png',
						tag: payload.tag,
						data: payload.data,
						requireInteraction: payload.requireInteraction || false,
						actions: payload.actions
					})
					return null // Service Worker notifications don't return Notification objects
				}
			}

			// Fallback to regular browser notification
			const notification = new Notification(payload.title, {
				body: payload.body,
				icon: payload.icon || '/favicon.png',
				badge: payload.badge || '/favicon.png',
				tag: payload.tag,
				data: payload.data,
				requireInteraction: payload.requireInteraction || false
			})

			// Handle notification click
			notification.onclick = (event) => {
				event.preventDefault()
				window.focus()
				
				// Navigate to relevant page if data contains a URL
				if (payload.data?.url) {
					window.location.href = payload.data.url
				}
				
				notification.close()
			}

			// Auto-close notification after 8 seconds if not requiring interaction
			if (!payload.requireInteraction) {
				setTimeout(() => {
					notification.close()
				}, 8000)
			}

			return notification
		} catch (error) {
			console.error('Error sending notification:', error)
			return null
		}
	}

	/**
	 * Send an order-specific notification
	 */
	async sendOrderNotification(orderNotification: OrderNotification): Promise<Notification | null> {
		const { orderId, orderStatus, estimatedTime, ...payload } = orderNotification

		// Customize notification based on order status
		let title = payload.title
		let body = payload.body
		let requireInteraction = false

		switch (orderStatus) {
			case 'preparing':
				title = title || '🍳 Order Being Prepared'
				body = body || `Your order #${orderId} is being prepared${estimatedTime ? ` (ETA: ${estimatedTime} min)` : ''}`
				break
			case 'ready':
				title = title || '🔔 Order Ready for Pickup!'
				body = body || `Your order #${orderId} is ready for pickup at the canteen`
				requireInteraction = true
				break
			case 'completed':
				title = title || '✅ Order Completed'
				body = body || `Thank you! Order #${orderId} has been completed`
				break
			case 'cancelled':
				title = title || '❌ Order Cancelled'
				body = body || `Order #${orderId} has been cancelled`
				requireInteraction = true
				break
		}

		return this.sendNotification({
			...payload,
			title,
			body,
			tag: `order-${orderId}`,
			requireInteraction,
			data: {
				orderId,
				orderStatus,
				url: `/orders?highlight=${orderId}`,
				...payload.data
			}
		})
	}

	/**
	 * Clear all notifications with a specific tag
	 */
	clearNotifications(tag?: string) {
		if (typeof window === 'undefined' || !this.useServiceWorker) {
			return
		}

		const registration = serviceWorkerManager.getState().registration
		if (registration) {
			registration.getNotifications({ tag }).then(notifications => {
				notifications.forEach(notification => notification.close())
			})
		}
	}
}

// Export a singleton instance
export const notificationService = new NotificationService()

// Utility functions for common notification scenarios
export const requestNotificationPermission = () => notificationService.requestPermission()

export const sendOrderReadyNotification = (orderId: string, customMessage?: string) => {
	return notificationService.sendOrderNotification({
		orderId,
		orderStatus: 'ready',
		title: '🔔 Order Ready!',
		body: customMessage || `Your order #${orderId} is ready for pickup!`
	})
}

export const sendOrderPreparingNotification = (orderId: string, estimatedTime?: number) => {
	return notificationService.sendOrderNotification({
		orderId,
		orderStatus: 'preparing',
		estimatedTime,
		title: '🍳 Order Being Prepared',
		body: `Your order #${orderId} is being prepared${estimatedTime ? ` (ETA: ${estimatedTime} min)` : ''}`
	})
}

export const sendOrderCompletedNotification = (orderId: string) => {
	return notificationService.sendOrderNotification({
		orderId,
		orderStatus: 'completed',
		title: '✅ Order Completed',
		body: `Thank you! Order #${orderId} has been completed`
	})
}

export const sendOrderCancelledNotification = (orderId: string, reason?: string) => {
	return notificationService.sendOrderNotification({
		orderId,
		orderStatus: 'cancelled',
		title: '❌ Order Cancelled',
		body: reason ? `Order #${orderId} cancelled: ${reason}` : `Order #${orderId} has been cancelled`
	})
}
