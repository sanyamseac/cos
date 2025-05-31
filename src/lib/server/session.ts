import { db } from './db/index'
import * as table from './db/schema'
import { eq } from 'drizzle-orm'
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from '@oslojs/encoding'
import { sha256 } from '@oslojs/crypto/sha2'
import { type User, type Session } from './db/schema'

export const sessionCookieName = 'AuthorizationToken'

export function generateSessionToken(): string {
	const bytes = new Uint8Array(20)
	crypto.getRandomValues(bytes)
	const token = encodeBase32LowerCaseNoPadding(bytes)
	return token
}

export async function createSession(token: string, userId: string): Promise<Session> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)))
	const session: Session = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
	}
	await db.insert(table.session).values(session)
	return session
}

export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)))
	const result = await db
		.select({ user: table.user, session: table.session })
		.from(table.session)
		.innerJoin(table.user, eq(table.session.userId, table.user.id))
		.where(eq(table.session.id, sessionId))

	if (result.length < 1) {
		console.warn(`No session found for token: ${token}`)
		return { session: null, user: null }
	}

	const { user, session } = result[0]
	if (Date.now() >= session.expiresAt.getTime()) {
		await db.delete(table.session).where(eq(table.session.id, sessionId))
		return { session: null, user: null }
	}

	if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
		session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
		await db
			.update(table.session)
			.set({
				expiresAt: session.expiresAt,
			})
			.where(eq(table.session.id, sessionId))
	}

	return { session, user }
}

export async function invalidateSession(sessionId: string): Promise<void> {
	await db.delete(table.session).where(eq(table.session.id, sessionId))
}

export async function invalidateAllSessions(userId: string): Promise<void> {
	await db.delete(table.session).where(eq(table.session.userId, userId))
}

export type SessionValidationResult =
	| { session: Session; user: User }
	| { session: null; user: null }
