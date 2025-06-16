// Service Worker Manager for push notifications and background functionality
export interface PushSubscriptionData {
	endpoint: string
	keys: {
		p256dh: string
		auth: string
	}
	userId?: string
}

export interface ServiceWorkerState {
	isSupported: boolean
	isRegistered: boolean
	isPushSupported: boolean
	subscription: PushSubscription | null
	registration: ServiceWorkerRegistration | null
}

class ServiceWorkerManager {
	private registration: ServiceWorkerRegistration | null = null
	private vapidPublicKey: string = '' // Will be fetched from server
	private isInitializing: boolean = false

	// Check if Service Worker is supported
	get isSupported(): boolean {
		return typeof window !== 'undefined' && 'serviceWorker' in navigator
	}

	//Check if Push API is supported
	get isPushSupported(): boolean {
		return typeof window !== 'undefined' && 'PushManager' in window
	}

	// Get State of Service Worker
	getState(): ServiceWorkerState {
		return {
			isSupported: this.isSupported,
			isRegistered: !!this.registration,
			isPushSupported: this.isPushSupported,
			subscription: null, // Will be updated when subscription is retrieved
			registration: this.registration,
		}
	}

	//
	async initializeServiceWorker(): Promise<ServiceWorkerRegistration | null> {
		if (!this.isSupported) {
			console.warn('Service Workers are not supported in this browser')
			return null
		}

		// Prevent double initialization
		if (this.isInitializing) {
			console.log('Service Worker initialization already in progress...')
			return this.registration
		}

		// Return existing registration if available
		if (this.registration) {
			console.log('Service Worker already registered')
			return this.registration
		}

		this.isInitializing = true
		try {
			console.log('Registering Service Worker...')

			this.registration = await navigator.serviceWorker.register('/sw.js', {
				scope: '/',
			})

			console.log('Service Worker registered successfully:', this.registration)
			console.log('Service Worker registration details:', {
				active: !!this.registration.active,
				installing: !!this.registration.installing,
				waiting: !!this.registration.waiting,
				scope: this.registration.scope,
				updateViaCache: this.registration.updateViaCache,
			})

			// Wait a moment for the Service Worker to potentially activate
			await new Promise((resolve) => setTimeout(resolve, 1000))

			console.log('Service Worker state after 1 second:', {
				active: !!this.registration.active,
				installing: !!this.registration.installing,
				waiting: !!this.registration.waiting,
				controller: !!navigator.serviceWorker.controller,
			})

			// Listen for updates
			this.registration.addEventListener('updatefound', () => {
				console.log('Service Worker update found')
				const newWorker = this.registration?.installing

				if (newWorker) {
					newWorker.addEventListener('statechange', () => {
						console.log('New Service Worker state:', newWorker.state)
						if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
							console.log('New Service Worker installed, reloading...')
							window.location.reload()
						}
					})
				}
			})

			// Fetch VAPID public key from server
			await this.fetchVapidKey()

			return this.registration
		} catch (error) {
			console.error('Service Worker registration failed:', error)
			return null
		} finally {
			this.isInitializing = false
		}
	}

	// Fetch VAPID public key from server
	private async fetchVapidKey(): Promise<void> {
		try {
			const response = await fetch('/api/push/vapid-key')
			if (response.ok) {
				const data = await response.json()
				this.vapidPublicKey = data.publicKey
				console.log('VAPID public key fetched successfully')
			} else {
				console.warn('Failed to fetch VAPID public key')
			}
		} catch (error) {
			console.error('Error fetching VAPID public key:', error)
		}
	}
	// Subscribe to push notifications
	async subscribeToPush(userId: string): Promise<PushSubscription | null> {
		try {
			// Ensure Service Worker is properly registered
			if (!this.registration) {
				await this.initializeServiceWorker()
			}

			if (!this.registration || !this.isPushSupported || !this.vapidPublicKey) {
				console.error('Cannot subscribe to push: requirements not met', {
					registration: !!this.registration,
					pushSupported: this.isPushSupported,
					vapidKey: !!this.vapidPublicKey,
				})
				return null
			}

			console.log('Subscribing to push notifications...')

			// Check if already subscribed
			const existingSubscription = await this.registration.pushManager.getSubscription()
			if (existingSubscription) {
				console.log('Already subscribed to push notifications')
				await this.sendSubscriptionToServer(existingSubscription, userId)
				return existingSubscription
			}
			// Try to ensure Service Worker is active, but don't fail if it times out
			try {
				await this.ensureServiceWorkerActive()
			} catch (activationError) {
				console.warn(
					'Service Worker activation check failed, but attempting push subscription anyway:',
					activationError,
				)
			}

			// Even if activation check failed, try the subscription if we have a registration
			if (!this.registration) {
				throw new Error('No Service Worker registration available')
			}

			// Subscribe to push notifications
			const subscription = await this.registration.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: this.urlB64ToUint8Array(this.vapidPublicKey),
			})

			console.log('Push subscription created:', subscription)

			// Send subscription to server
			await this.sendSubscriptionToServer(subscription, userId)

			return subscription
		} catch (error) {
			console.error('Failed to subscribe to push notifications:', error)
			return null
		}
	}

	// Ensure Service Worker is active and ready
	private async ensureServiceWorkerActive(): Promise<void> {
		if (!this.registration) {
			await this.initializeServiceWorker()
		}

		if (!this.registration) {
			throw new Error('Service Worker registration failed')
		}

		console.log('Service Worker registration state:', {
			active: !!this.registration.active,
			installing: !!this.registration.installing,
			waiting: !!this.registration.waiting,
			controller: !!navigator.serviceWorker.controller,
		})
		// If we have an active Service Worker or a controller, we're good to go
		if (this.registration.active || navigator.serviceWorker.controller) {
			console.log('Service Worker is ready for push subscription')
			return
		}

		console.log('Waiting for Service Worker to become active...')

		// Try a simple approach: wait a short time and then proceed
		await new Promise<void>((resolve) => {
			// Give it 2 seconds to activate, then just continue
			setTimeout(() => {
				const finalState = {
					active: !!this.registration!.active,
					installing: !!this.registration!.installing,
					waiting: !!this.registration!.waiting,
					controller: !!navigator.serviceWorker.controller,
				}
				console.log('Service Worker activation timeout. Current state:', finalState)
				// Don't reject, just resolve and let the subscription attempt proceed
				resolve()
			}, 2000)

			// If there's a waiting worker, try to activate it
			if (this.registration!.waiting) {
				console.log('Found waiting Service Worker, activating it...')
				this.registration!.waiting.postMessage({ type: 'SKIP_WAITING' })
			}

			// Check for changes periodically
			let checkCount = 0
			const checkInterval = setInterval(() => {
				checkCount++
				if (
					this.registration!.active ||
					navigator.serviceWorker.controller ||
					checkCount > 20
				) {
					clearInterval(checkInterval)
					resolve()
				}
			}, 100)
		})
	}

	/**
	 * Unsubscribe from push notifications
	 */
	async unsubscribeFromPush(userId: string): Promise<boolean> {
		if (!this.registration) {
			return false
		}

		try {
			const subscription = await this.registration.pushManager.getSubscription()
			if (subscription) {
				// Remove from server first
				await this.removeSubscriptionFromServer(subscription, userId)

				// Unsubscribe locally
				const success = await subscription.unsubscribe()
				console.log('Unsubscribed from push notifications:', success)
				return success
			}
			return true
		} catch (error) {
			console.error('Failed to unsubscribe from push notifications:', error)
			return false
		}
	}

	/**
	 * Get current push subscription
	 */
	async getPushSubscription(): Promise<PushSubscription | null> {
		if (!this.registration) {
			return null
		}

		try {
			return await this.registration.pushManager.getSubscription()
		} catch (error) {
			console.error('Failed to get push subscription:', error)
			return null
		}
	}
	/**
	 * Send subscription to server
	 */
	private async sendSubscriptionToServer(
		subscription: PushSubscription,
		userId: string,
	): Promise<void> {
		try {
			const p256dhKey = subscription.getKey('p256dh')
			const authKey = subscription.getKey('auth')

			if (!p256dhKey || !authKey) {
				throw new Error('Failed to get subscription keys')
			}

			const subscriptionData: PushSubscriptionData = {
				endpoint: subscription.endpoint,
				keys: {
					p256dh: btoa(String.fromCharCode(...new Uint8Array(p256dhKey))),
					auth: btoa(String.fromCharCode(...new Uint8Array(authKey))),
				},
				userId,
			}

			const response = await fetch('/api/push/subscribe', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(subscriptionData),
			})

			if (response.ok) {
				console.log('Subscription sent to server successfully')
			} else {
				console.error('Failed to send subscription to server')
			}
		} catch (error) {
			console.error('Error sending subscription to server:', error)
		}
	}

	/**
	 * Remove subscription from server
	 */
	private async removeSubscriptionFromServer(
		subscription: PushSubscription,
		userId: string,
	): Promise<void> {
		try {
			const response = await fetch('/api/push/unsubscribe', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					endpoint: subscription.endpoint,
					userId,
				}),
			})

			if (response.ok) {
				console.log('Subscription removed from server successfully')
			} else {
				console.error('Failed to remove subscription from server')
			}
		} catch (error) {
			console.error('Error removing subscription from server:', error)
		}
	}

	/**
	 * Request persistent notification permission
	 */
	async requestNotificationPermission(): Promise<NotificationPermission> {
		if (!('Notification' in window)) {
			console.warn('This browser does not support notifications')
			return 'denied'
		}

		try {
			const permission = await Notification.requestPermission()
			console.log('Notification permission result:', permission)
			return permission
		} catch (error) {
			console.error('Error requesting notification permission:', error)
			return 'denied'
		}
	}

	/**
	 * Show a test notification
	 */
	async showTestNotification(): Promise<void> {
		if (!this.registration) {
			console.error('Service Worker not registered')
			return
		}
		try {
			await this.registration.showNotification('Canteen Notifications Enabled', {
				body: 'You will now receive order updates even when the browser is closed.',
				icon: '/favicon.png',
				badge: '/favicon.png',
				tag: 'test-notification',
				requireInteraction: false,
			})
		} catch (error) {
			console.error('Failed to show test notification:', error)
		}
	}

	/**
	 * Utility to convert VAPID key
	 */
	private urlB64ToUint8Array(base64String: string): Uint8Array {
		const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
		const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

		const rawData = window.atob(base64)
		const outputArray = new Uint8Array(rawData.length)

		for (let i = 0; i < rawData.length; ++i) {
			outputArray[i] = rawData.charCodeAt(i)
		}
		return outputArray
	}

	/**
	 * Send message to Service Worker
	 */
	async sendMessage(message: any): Promise<any> {
		if (!this.registration || !this.registration.active) {
			return null
		}

		return new Promise((resolve) => {
			const messageChannel = new MessageChannel()
			messageChannel.port1.onmessage = (event) => {
				resolve(event.data)
			}

			this.registration!.active!.postMessage(message, [messageChannel.port2])
		})
	}
}

// Export singleton instance
export const serviceWorkerManager = new ServiceWorkerManager()
