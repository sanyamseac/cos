import { redirect, fail, error } from '@sveltejs/kit'
import { dev } from '$app/environment'
import * as auth from '$lib/server/session'
import type { PageServerLoad, Actions } from './$types'
import { ORIGIN } from '$env/static/private'
import { db } from '$lib/server/db'
import * as schema from '$lib/server/db/schema'
import { eq } from 'drizzle-orm'
import { generateId } from '$lib/helper'

const cas = 'https://login.iiit.ac.in/cas'

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		const destination = event.url.searchParams.get('redirect') ?? '/'
		return redirect(302, destination)
	}
	return {}
}

export const actions: Actions = {
	oauth: async (event) => {
		const destination = event.url.searchParams.get('redirect') ?? '/'
		if (event.locals.user) return redirect(302, destination)
		else {
			const service = (event.url.origin ?? ORIGIN) + `/auth?redirect=${destination}`
			return redirect(302, `${cas}/login?service=${service}`)
		}
	},

	login: async (event) => {
		const formData = await event.request.formData()
		const username = formData.get('username')
		const password = formData.get('password')

		if (!username || !password) {
			return fail(400, { message: 'Username and password are required' })
		}
		if (typeof username !== 'string' || typeof password !== 'string') {
			return fail(400, { message: 'Invalid username or password' })
		}

		const tgtResponse = await fetch(`${cas}/v1/tickets`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
		})

		if (!tgtResponse.ok) {
			console.error('Failed to obtain TGT:', await tgtResponse.text())
			return fail(401, { message: 'Authentication failed' })
		}

		const tgtUrl = tgtResponse.headers.get('Location')
		if (!tgtUrl) {
			console.error('No TGT URL provided in response')
			return fail(500, { message: 'Authentication system error' })
		}

		const stResponse = await fetch(tgtUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: `service=${encodeURIComponent(event.url.origin)}`,
		})

		if (!stResponse.ok) {
			console.error('Failed to obtain service ticket:', await stResponse.text())
			return fail(401, { message: 'Failed to obtain service ticket' })
		}

		const serviceTicket = await stResponse.text()

		const validationUrl = `${cas}/serviceValidate?service=${event.url.origin}&ticket=${serviceTicket}&format=JSON`
		const response = await fetch(validationUrl)
		if (!response.ok) {
			error(401, `Failed to login: ${response.status}`)
		}

		const json = await response.json()
		const details = json.serviceResponse?.authenticationSuccess?.attributes
		const errors = json.serviceResponse?.authenticationFailure
		if (!details) {
			if (errors) error(401, `Failed to login: ${errors.code}`)
			else error(401, 'Failed to parse CAS response.')
		}

		let user = {
			name: details['Name'][0],
			email: details['E-Mail'][0],
		}

		const results = await db
			.select({
				id: schema.user.id,
				name: schema.user.name,
				email: schema.user.email,
			})
			.from(schema.user)
			.where(eq(schema.user.email, user.email))

		const existingUser = results.at(0)
		if (!existingUser) {
			user = { ...user, id: generateId() }
			await db.insert(schema.user).values(user)
		} else user = existingUser

		const token = auth.generateSessionToken()
		const session = await auth.createSession(token, user.id)
		event.cookies.set(auth.sessionCookieName, token, {
			path: '/',
			sameSite: 'lax',
			httpOnly: true,
			expires: session.expiresAt,
			secure: !dev,
		})

		const destination = event.url.searchParams.get('redirect') ?? '/'
		return redirect(302, destination)
	},

	logout: async (event) => {
		if (!event.locals.session) {
			return fail(401)
		}
		await auth.invalidateSession(event.locals.session.id)
		event.cookies.delete(auth.sessionCookieName, { path: '/' })

		return redirect(302, '/login')
	},
}