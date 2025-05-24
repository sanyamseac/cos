import { redirect } from '@sveltejs/kit'
import { dev } from '$app/environment'
import type { PageServerLoad, Actions } from './$types'
import { ORIGIN } from '$env/static/private'

const cas = 'https://login.iiit.ac.in/cas'

export const load: PageServerLoad = async (event) => {
	const destination = event.url.searchParams.get('redirect') ?? '/'
	if (event.locals.user) return redirect(302, destination)
	else {
		const destination = event.url.searchParams.get('redirect') ?? '/'
		const service = (event.url.origin ?? ORIGIN) + `/auth?redirect=${destination}`
		return redirect(302, `${cas}/login?service=${service}`)
	}
}

// import { hash, verify } from '@node-rs/argon2'
// import { generateRandomString } from '@oslojs/crypto/random'
// import { fail, redirect } from '@sveltejs/kit'
// import { eq } from 'drizzle-orm'
// import { dev } from '$app/environment'
// import * as auth from '$lib/server/session'
// import { db } from '$lib/server/db'
// import * as table from '$lib/server/db/schema'
// import type { Actions, PageServerLoad } from './$types'

// export const load: PageServerLoad = async (event) => {
// 	if (event.locals.user) {
// 		return redirect(302, '/details')
// 	}
// 	return {}
// }

// export const actions: Actions = {
// 	login: async (event) => {
// 		const formData = await event.request.formData()
// 		const username = formData.get('username')
// 		const password = formData.get('password')

// 		if (!validateUsername(username)) {
// 			return fail(400, { message: 'Invalid username' })
// 		}
// 		if (!validatePassword(password)) {
// 			return fail(400, { message: 'Invalid password' })
// 		}

// 		const results = await db.select().from(table.user).where(eq(table.user.username, username))

// 		const existingUser = results.at(0)
// 		if (!existingUser) {
// 			return fail(400, { message: 'Incorrect username or password' })
// 		}

// 		const validPassword = await verify(existingUser.passwordHash, password, {
// 			memoryCost: 19456,
// 			timeCost: 2,
// 			outputLen: 32,
// 			parallelism: 1,
// 		})
// 		if (!validPassword) {
// 			return fail(400, { message: 'Incorrect username or password' })
// 		}

// 		const token = auth.generateSessionToken()
// 		const session = await auth.createSession(token, existingUser.id)
// 		event.cookies.set(auth.sessionCookieName, token, {
// 			path: '/',
// 			sameSite: 'lax',
// 			httpOnly: true,
// 			expires: session.expiresAt,
// 			secure: !dev,
// 		})

// 		return redirect(302, '/details')
// 	},
// 	register: async (event) => {
// 		const formData = await event.request.formData()
// 		const username = formData.get('username')
// 		const password = formData.get('password')

// 		if (!validateUsername(username)) {
// 			return fail(400, { message: 'Invalid username' })
// 		}
// 		if (!validatePassword(password)) {
// 			return fail(400, { message: 'Invalid password' })
// 		}

// 		const userId = generateUserId()
// 		const passwordHash = await hash(password, {
// 			// recommended minimum parameters
// 			memoryCost: 19456,
// 			timeCost: 2,
// 			outputLen: 32,
// 			parallelism: 1,
// 		})

// 		try {
// 			await db.insert(table.user).values({ id: userId, username, passwordHash })

// 			const token = auth.generateSessionToken()
// 			const session = await auth.createSession(token, userId)
// 			event.cookies.set(auth.sessionCookieName, token, {
// 				path: '/',
// 				sameSite: 'lax',
// 				httpOnly: true,
// 				expires: session.expiresAt,
// 				secure: !dev,
// 			})
// 		} catch (e) {
// 			return fail(500, { message: 'An error has occurred' })
// 		}
// 		return redirect(302, '/details')
// 	},
// }

// function validateUsername(username: unknown): username is string {
// 	return (
// 		typeof username === 'string' &&
// 		username.length >= 3 &&
// 		username.length <= 31 &&
// 		/^[a-z0-9_-]+$/.test(username)
// 	)
// }

// function validatePassword(password: unknown): password is string {
// 	return typeof password === 'string' && password.length >= 6 && password.length <= 255
// }
