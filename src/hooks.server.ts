import type { Handle } from '@sveltejs/kit'
import { dev } from '$app/environment'
import * as auth from '$lib/server/session'

export const handle: Handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get(auth.sessionCookieName)
	console.log(`Session ID from cookies: ${sessionId}`)
	if (!sessionId) {
		event.locals.user = null
		event.locals.session = null
		return resolve(event)
	}

	const { session, user } = await auth.validateSessionToken(sessionId)
	if (session) {
		console.log(`Session found for user ${user.id} with session ID ${session.id}`)
		event.cookies.set(auth.sessionCookieName, sessionId, {
			path: '/',
			sameSite: 'lax',
			httpOnly: true,
			expires: session.expiresAt,
			secure: !dev,
		})
	} else {
		console.log(`No valid session found for session ID ${sessionId}`)
		event.cookies.delete(auth.sessionCookieName, { path: '/' })
	}

	event.locals.user = user
	event.locals.session = session

	return resolve(event)
}
