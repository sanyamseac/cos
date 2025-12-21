import webpush from 'web-push'
import { db } from './db'
import { pushSubscriptionsTable, type PushSubscription as DbPushSubscription } from './db/schema'
import { eq, and } from 'drizzle-orm'
import { env } from '$env/dynamic/private'

const VAPID_KEYS = {
	publicKey: env.VAPID_PUBLIC_KEY || 'null',
	privateKey: env.VAPID_PRIVATE_KEY || 'null',
}

const vapidEnabled = env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY &&
	env.VAPID_PUBLIC_KEY !== 'null' && env.VAPID_PRIVATE_KEY !== 'null'

// Configure web-push with VAPID details only if keys are provided
if (vapidEnabled) {
	webpush.setVapidDetails(
		'mailto:admin@canteen-system.com',
		VAPID_KEYS.publicKey,
		VAPID_KEYS.privateKey,
	)
}

export async function storeSubscription(
	endpoint: string,
	subscription: any,
	userId: string,
): Promise<void> {
	await db
		.insert(pushSubscriptionsTable)
		.values({
			endpoint,
			userId,
			p256dh: subscription.keys.p256dh,
			auth: subscription.keys.auth,
			createdAt: new Date(),
		})
		.onConflictDoUpdate({
			target: pushSubscriptionsTable.endpoint,
			set: {
				p256dh: subscription.keys.p256dh,
				auth: subscription.keys.auth,
				userId, // Potentially update userId if the same device subscribes for a different user
			},
		})
}

export async function getStoredUserSubscriptions(userId: string): Promise<DbPushSubscription[]> {
	return db.select().from(pushSubscriptionsTable).where(eq(pushSubscriptionsTable.userId, userId))
}

export async function getStoredAllSubscriptions(): Promise<DbPushSubscription[]> {
	return db.select().from(pushSubscriptionsTable)
}

export async function removeStoredSubscription(endpoint: string): Promise<boolean> {
	const result = await db
		.delete(pushSubscriptionsTable)
		.where(eq(pushSubscriptionsTable.endpoint, endpoint))
		.returning()
	return result.length > 0
}

// Utility functions for managing push notification subscriptions (merged from subscriptionUtils.ts)
export interface PushSubscriptionData {
	endpoint: string
	keys: { p256dh: string; auth: string }
	userId: string
	createdAt: Date
}

/**
 * Get all push subscriptions for a specific user
 */
export async function getUserSubscriptions(userId: string): Promise<PushSubscriptionData[]> {
	const dbSubs = await getStoredUserSubscriptions(userId)
	return dbSubs.map((s) => ({
		endpoint: s.endpoint,
		keys: { p256dh: s.p256dh, auth: s.auth },
		userId: s.userId,
		createdAt: s.createdAt,
	}))
}

/**
 * Get all push subscriptions
 */
export async function getAllSubscriptions(): Promise<PushSubscriptionData[]> {
	const dbSubs = await getStoredAllSubscriptions()
	return dbSubs.map((s) => ({
		endpoint: s.endpoint,
		keys: { p256dh: s.p256dh, auth: s.auth },
		userId: s.userId,
		createdAt: s.createdAt,
	}))
}

/**
 * Add a new push subscription
 */
export async function addSubscription(
	userId: string,
	subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
): Promise<string> {
	const endpoint = subscription.endpoint
	await storeSubscription(endpoint, subscription, userId)
	return endpoint // Return endpoint as ID for compatibility
}

/**
 * Remove a push subscription by endpoint
 */
export async function removeSubscription(endpoint: string): Promise<boolean> {
	return removeStoredSubscription(endpoint)
}

/**
 * Find subscription by endpoint
 */
export async function findSubscriptionByEndpoint(
	endpoint: string,
): Promise<PushSubscriptionData | undefined> {
	const sub = await db
		.select()
		.from(pushSubscriptionsTable)
		.where(eq(pushSubscriptionsTable.endpoint, endpoint))
		.limit(1)
	if (sub.length > 0) {
		const s = sub[0]
		return {
			endpoint: s.endpoint,
			keys: { p256dh: s.p256dh, auth: s.auth },
			userId: s.userId,
			createdAt: s.createdAt,
		}
	}
	return undefined
}

export interface NotificationPayload {
	title: string
	body: string
	icon?: string
	badge?: string
	tag?: string
	data?: any
	url?: string
	requireInteraction?: boolean
	actions?: Array<{
		action: string
		title: string
		icon?: string
	}>
}

// SSE Connection management
const sseConnections = new Map<string, ReadableStreamDefaultController<any>>()

export function addConnection(userId: string, controller: ReadableStreamDefaultController<any>) {
	sseConnections.set(userId, controller)
}

export function removeConnection(userId: string) {
	sseConnections.delete(userId)
}

export function sendSSENotification(userId: string, notification: NotificationPayload) {
	const controller = sseConnections.get(userId)
	if (controller) {
		try {
			const message = `data: ${JSON.stringify({
				type: 'notification',
				...notification,
				timestamp: new Date().toISOString(),
			})}\n\n`
			controller.enqueue(message)
		} catch (error) {
			console.error(`Failed to send SSE notification to user ${userId}:`, error)
			removeConnection(userId)
		}
	}
}

/**
 * Send push notification to a specific user
 */
export async function sendToUser(
	userId: string,
	payload: NotificationPayload,
): Promise<{ success: boolean; sent: number; failed: number }> {
	const subscriptions = await getStoredUserSubscriptions(userId) // Now async

	if (subscriptions.length === 0) {
		console.log(`No push subscriptions found for user: ${userId}`)
		return { success: false, sent: 0, failed: 0 }
	}

	let sent = 0
	let failed = 0

	for (const sub of subscriptions) {
		const pushSubscriptionObject = {
			endpoint: sub.endpoint,
			keys: {
				p256dh: sub.p256dh,
				auth: sub.auth,
			},
		}
		try {
			await webpush.sendNotification(pushSubscriptionObject, JSON.stringify(payload))
			sent++
			console.log(`Push notification sent to user ${userId}`)
		} catch (error: any) {
			failed++
			console.error(
				`Failed to send push notification to user ${userId}, endpoint: ${sub.endpoint}:`,
				error,
			)
			// If the subscription is no longer valid (e.g., 404 or 410), remove it
			if (error.statusCode === 404 || error.statusCode === 410) {
				console.log(`Removing invalid subscription for endpoint: ${sub.endpoint}`)
				await removeStoredSubscription(sub.endpoint)
			}
		}
	}

	// Also send via SSE if user is connected
	sendSSENotification(userId, payload)

	return {
		success: sent > 0,
		sent,
		failed,
	}
}

/**
 * Broadcast push notification to all subscribed users
 */
export async function broadcast(
	payload: NotificationPayload,
): Promise<{ success: boolean; sent: number; failed: number }> {
	const subscriptions = await getStoredAllSubscriptions() // Now async

	if (subscriptions.length === 0) {
		console.log('No push subscriptions found for broadcast')
		return { success: false, sent: 0, failed: 0 }
	}

	let sent = 0
	let failed = 0

	for (const sub of subscriptions) {
		const pushSubscriptionObject = {
			endpoint: sub.endpoint,
			keys: {
				p256dh: sub.p256dh,
				auth: sub.auth,
			},
		}
		try {
			await webpush.sendNotification(pushSubscriptionObject, JSON.stringify(payload))
			sent++
		} catch (error: any) {
			failed++
			console.error(
				`Failed to send broadcast notification to endpoint: ${sub.endpoint}:`,
				error,
			)
			// If the subscription is no longer valid (e.g., 404 or 410), remove it
			if (error.statusCode === 404 || error.statusCode === 410) {
				console.log(`Removing invalid subscription for endpoint: ${sub.endpoint}`)
				await removeStoredSubscription(sub.endpoint)
			}
		}
	}

	// Also send via SSE to all connected users
	for (const [userId] of sseConnections) {
		sendSSENotification(userId, payload)
	}

	console.log(`Broadcast notification sent to ${sent} users, ${failed} failed`)

	return {
		success: sent > 0,
		sent,
		failed,
	}
}
