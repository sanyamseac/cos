// Service Worker for push notifications and basic caching
const CACHE_NAME = 'canteen-ordering-v1'
const API_CACHE = 'api-cache-v1'

// Files to cache for offline functionality
const STATIC_CACHE_FILES = [
	'/',
	'/favicon.png'
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
	console.log('Service Worker installing...')
	
	event.waitUntil(
		caches.open(CACHE_NAME)
			.then((cache) => {
				console.log('Caching static assets')
				return cache.addAll(STATIC_CACHE_FILES)
			})
			.then(() => {
				return self.skipWaiting()
			})
	)
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
	console.log('Service Worker activating...')
	
	event.waitUntil(
		caches.keys()
			.then((cacheNames) => {
				return Promise.all(
					cacheNames.map((cacheName) => {
						if (cacheName !== CACHE_NAME && cacheName !== API_CACHE) {
							console.log('Deleting old cache:', cacheName)
							return caches.delete(cacheName)
						}
					})
				)
			})
			.then(() => {
				return self.clients.claim()
			})
	)
})

// Fetch event - basic caching strategy
self.addEventListener('fetch', (event) => {
	const { request } = event
	const url = new URL(request.url)
	
	// Handle API requests with network-first strategy
	if (url.pathname.startsWith('/api/')) {
		event.respondWith(
			caches.open(API_CACHE)
				.then((cache) => {
					return fetch(request)
						.then((response) => {
							// Only cache GET requests and successful responses
							if (request.method === 'GET' && response.ok) {
								cache.put(request, response.clone())
							}
							return response
						})
						.catch(() => {
							// Return cached response if network fails (only for GET requests)
							if (request.method === 'GET') {
								return cache.match(request)
							}
							throw new Error('Network request failed')
						})
				})
		)
		return
	}
	
	// Handle static assets with cache-first strategy
	if (request.method === 'GET') {
		event.respondWith(
			caches.match(request)
				.then((response) => {
					return response || fetch(request)
				})
		)
	}
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
			{ action: 'dismiss', title: 'Dismiss' }
		],
		vibrate: [100, 50, 100],
		timestamp: Date.now(),
		requireInteraction: false
	};

	let notificationData = defaultNotification;

	if (event.data) {
		try {
			const data = event.data.json()
			notificationData = { ...defaultNotification, ...data };
		} catch (error) {
			console.error('Error parsing push data:', error)
		}
	}

	// Show notification
	event.waitUntil(
		self.registration.showNotification(notificationData.title, notificationData)
	)
})

// Notification click handling
self.addEventListener('notificationclick', (event) => {
	console.log('Notification clicked:', event)
	event.notification.close()
	
	if (event.action === 'dismiss') return
	
	// Open or focus the app
	event.waitUntil(
		clients.matchAll({ type: 'window', includeUncontrolled: true })
			.then((clientList) => {
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
			})
	)
})

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
	console.log('Service Worker received message:', event.data)
	
	if (event.data?.type === 'SKIP_WAITING') {
		self.skipWaiting()
	}
	
	if (event.data?.type === 'GET_VERSION') {
		event.ports[0].postMessage({ version: CACHE_NAME })
	}
})
