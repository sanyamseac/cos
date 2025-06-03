// Service Worker for push notifications
const CACHE_VERSION = 'notifications-v1'

// Install event - skip waiting to activate immediately
self.addEventListener('install', (event) => {
	console.log('Service Worker installing...')
	event.waitUntil(self.skipWaiting())
})

// Activate event - claim clients immediately
self.addEventListener('activate', (event) => {
	console.log('Service Worker activating...')
	event.waitUntil(self.clients.claim())
})

// Push notification handling
self.addEventListener('push', (event) => {
	console.log('Push notification received:', event)

	const defaultNotification = {
		title: 'Canteen Notification',
		body: 'You have a new notification',
		icon: '/favicon.png',
		badge: '/favicon.png',
		tag: 'default',
		actions: [
			{ action: 'view', title: 'View', icon: '/favicon.png' },
			{ action: 'dismiss', title: 'Dismiss' },
		],
		vibrate: [100, 50, 100],
		timestamp: Date.now(),
		requireInteraction: false,
	}

	let notificationData = defaultNotification

	if (event.data) {
		try {
			const data = event.data.json()
			notificationData = { ...defaultNotification, ...data }
		} catch (error) {
			console.error('Error parsing push data:', error)
		}
	}

	// Show notification
	event.waitUntil(self.registration.showNotification(notificationData.title, notificationData))
})

// Notification click handling
self.addEventListener('notificationclick', (event) => {
	console.log('Notification clicked:', event)
	event.notification.close()

	if (event.action === 'dismiss') return

	// Open or focus the app
	event.waitUntil(
		clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
			// Try to focus existing window
			for (const client of clientList) {
				if (client.url.includes(self.location.origin)) {
					if (event.notification.data?.url) {
						client.navigate(event.notification.data.url)
					}
					return client.focus()
				}
			}
			// Open new window if none exists
			const urlToOpen = event.notification.data?.url || '/'
			return clients.openWindow(urlToOpen)
		}),
	)
})

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
	console.log('Service Worker received message:', event.data)

	if (event.data?.type === 'SKIP_WAITING') {
		self.skipWaiting()
	}
	if (event.data?.type === 'GET_VERSION') {
		event.ports[0].postMessage({ version: CACHE_VERSION })
	}
})
