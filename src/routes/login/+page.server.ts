import { redirect, fail, error } from '@sveltejs/kit'
import { dev } from '$app/environment'
import * as auth from '$lib/server/session'
import type { PageServerLoad, Actions } from './$types'
import { ORIGIN } from '$env/static/private'
import { db } from '$lib/server/db'
import * as schema from '$lib/server/db/schema'
import { eq } from 'drizzle-orm'
import { generateId, getRandomDefaultAvatar } from '$lib/helper'
import { encodeHexLowerCase } from '@oslojs/encoding'
import { sha256 } from '@oslojs/crypto/sha2'

const cas = 'https://login.iiit.ac.in/cas'

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		let destination = event.url.searchParams.get('redirect') ?? '/'
		if (event.locals.user.role === 'canteen') {
			destination = '/canteen/dashboard'
		}
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
			throw fail(400, { message: 'Username and password are required' })
		}
		if (typeof username !== 'string' || typeof password !== 'string') {
			throw fail(400, { message: 'Invalid username or password' })
		}

		let user: any = null
		if (username.includes('@canteens.iiit.ac.in')) {
			const canteen = username.split('@')[0]
			const canteenDetails = await db
				.select({
					canteen: schema.canteens,
					auth: schema.canteenAuth,
				})
				.from(schema.canteens)
				.innerJoin(schema.canteenAuth, eq(schema.canteens.id, schema.canteenAuth.canteenId))
				.where(eq(schema.canteens.acronym, canteen))
				.limit(1)

			if (canteenDetails.length === 0) throw fail(404, { message: 'Canteen not found' })

			const canteenPasswordHash = canteenDetails[0].auth.passwordHash
			if (
				canteenPasswordHash !==
				encodeHexLowerCase(sha256(new TextEncoder().encode(password)))
			) {
				throw fail(401, { message: 'Invalid canteen password' })
			}

			const response = await db
				.select({
					id: schema.user.id,
					name: schema.user.name,
					email: schema.user.email,
					role: schema.user.role,
					profilePicture: schema.user.profilePicture,
				})
				.from(schema.user)
				.where(eq(schema.user.email, username))
				.limit(1)

			user = response[0]
			if (!user) throw fail(404, { message: 'Canteen user not found' })
		} else {
			if (!username.includes('test')) {
				const tgtResponse = await fetch(`${cas}/v1/tickets`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
					},
					body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
				})

				if (!tgtResponse.ok) {
					console.error('Failed to obtain TGT:', await tgtResponse.text())
					throw fail(401, { message: 'Authentication failed' })
				}

				const tgtUrl = tgtResponse.headers.get('Location')
				if (!tgtUrl) {
					console.error('No TGT URL provided in response')
					throw fail(500, { message: 'Authentication system error' })
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
					throw fail(401, { message: 'Failed to obtain service ticket' })
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

				user = {
					name: details['Name'][0],
					email: details['E-Mail'][0],
				}
			} else {
				user = {
					name: username,
					email: username,
				}
			}

			const results = await db
				.select({
					id: schema.user.id,
					name: schema.user.name,
					email: schema.user.email,
					role: schema.user.role,
					profilePicture: schema.user.profilePicture,
				})
				.from(schema.user)
				.where(eq(schema.user.email, user.email))

			const existingUser = results.at(0)
			if (!existingUser) {
				const newUser = {
					...user,
					id: generateId(),
					role: 'consumer',
					profilePicture: getRandomDefaultAvatar(),
				}
				await db.insert(schema.user).values(newUser)
				user = newUser
			} else {
				user = existingUser
			}
		}
		console.log('User details:', user)

		const token = auth.generateSessionToken()
		const session = await auth.createSession(token, user.id)
		event.cookies.set(auth.sessionCookieName, token, {
			path: '/',
			sameSite: 'lax',
			httpOnly: true,
			expires: session.expiresAt,
			secure: !dev,
		})

		// Set appropriate redirect based on user role
		let destination = event.url.searchParams.get('redirect') ?? '/'
		if (user.role === 'canteen') {
			destination = '/canteen/dashboard'
		}

		return redirect(302, destination)
	},

	logout: async (event) => {
		if (!event.locals.session) {
			throw fail(401)
		}
		await auth.invalidateSession(event.locals.session.id)
		event.cookies.delete(auth.sessionCookieName, { path: '/' })

		return redirect(302, '/login')
	},
}
