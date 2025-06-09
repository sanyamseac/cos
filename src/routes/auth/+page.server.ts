import { fail, error, redirect } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'
import { ORIGIN } from '$env/static/private'
import { dev } from '$app/environment'
import * as auth from '$lib/server/session'
import { db } from '$lib/server/db'
import * as schema from '$lib/server/db/schema'
import type { Actions, PageServerLoad } from './$types'
import { generateId, getRandomDefaultAvatar } from '$lib/helper'

const cas = 'https://login.iiit.ac.in/cas'

export const load: PageServerLoad = async (event) => {
	const destination = event.url.searchParams.get('redirect') ?? '/'
	const ticket = event.url.searchParams.get('ticket')
	const service = (event.url.origin ?? ORIGIN) + `/auth?redirect=${destination}`

	const validationUrl = `${cas}/serviceValidate?service=${service}&ticket=${ticket}&format=JSON`
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

	let user: any = {
		name: details['Name'][0],
		email: details['E-Mail'][0],
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
			profilePicture: getRandomDefaultAvatar()
		}
		await db.insert(schema.user).values(newUser)
		user = newUser
	} else {
		user = existingUser
	}

	const token = auth.generateSessionToken()
	const session = await auth.createSession(token, user.id)
	event.cookies.set(auth.sessionCookieName, token, {
		path: '/',
		sameSite: 'lax',
		httpOnly: true,
		expires: session.expiresAt,
		secure: !dev,
	})

	return redirect(302, destination)
}
