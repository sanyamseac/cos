import { redirect, error, fail } from '@sveltejs/kit'
import * as auth from '$lib/server/session'
import type { PageServerLoad, Actions } from './$types'
import { db } from '$lib/server/db'
import * as schema from '$lib/server/db/schema'
import { asc, desc, eq } from 'drizzle-orm'
import path from 'path'
import fs from 'fs/promises'
import { generateId } from '$lib/helper'
import { encodeHexLowerCase } from '@oslojs/encoding'
import { sha256 } from '@oslojs/crypto/sha2'

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user)
		return redirect(302, `/login?redirect=${encodeURIComponent(event.url.href)}`)
	if (!auth.ADMIN.includes(event.locals.user.role)) throw error(403, 'Access denied - Admin only')

	let canteens = await db
		.select()
		.from(schema.canteens)
		.orderBy(desc(schema.canteens.open), asc(schema.canteens.name))

	return {
		user: event.locals.user,
		canteens,
	}
}

export const actions: Actions = {
	addCanteen: async ({ request, locals }) => {
		if (!locals.user || !auth.ADMIN.includes(locals.user.role)) throw fail(403, {message: 'Unauthorized'})

		try {
			const body = await request.formData()
			const name = body.get('name')?.toString()
			const timings = body.get('timings')?.toString()
			const open = body.get('open') === 'true'
			const acronym = body.get('acronym')?.toString()
			const description = body.get('description')?.toString()
			const active = body.get('active') === 'true'
			const image = body.get('image') as File

			if (!name || !timings || !acronym || !description || !image) {
				throw fail(400, { error: 'Name, timings, acronym, and description are required' })
			}

			const filename = acronym + path.extname(image.name)
			const savePath = path.join('static', 'content', 'canteenImages', filename)
			const password = generateId(8)

			await fs.mkdir(path.dirname(savePath), { recursive: true })
			const arrayBuffer = await image.arrayBuffer()
			await fs.writeFile(savePath, Buffer.from(arrayBuffer))

			const [newCanteen] = await db
				.insert(schema.canteens)
				.values({
					name,
					timings,
					open: open ?? true,
					acronym,
					description,
					active: active ?? true,
					image: `/content/canteenImages/${filename}`,
				})
				.returning()
			
			// Insert canteen auth credentials
			await db.insert(schema.canteenAuth).values({
				canteenId: newCanteen.id,
				passwordHash: encodeHexLowerCase(sha256(new TextEncoder().encode(password))),
			})
			
			await db.insert(schema.user).values({
				id: generateId(),
				name: newCanteen.name,
				email: newCanteen.acronym + '@canteens.iiit.ac.in',
				role: 'canteen',
				profilePicture: newCanteen.image,
			})

			return { success: true, canteen: newCanteen, password }
		} catch (error) {
			console.error('Error creating canteen:', error)
			throw fail(500, { error: 'Failed to create canteen' })
		}
	},

	updateCanteen: async ({ request, locals }) => {
		if (!locals.user || !auth.ADMIN.includes(locals.user.role)) throw fail(403, {message: 'Unauthorized'})

		try {
			const body = await request.formData()
			const id = parseInt(body.get('id')?.toString() || '')
			const name = body.get('name')?.toString()
			const timings = body.get('timings')?.toString()
			const open = body.get('open') === 'true'
			const description = body.get('description')?.toString()
			const acronym = body.get('acronym')?.toString()
			const active = body.get('active') === 'true'
			const image = body.get('image') as File

			if (!id) {
				throw fail(400, { error: 'Canteen ID is required' })
			}

			let filename = ''
			if (path.extname(image.name)) {
				filename = acronym + path.extname(image.name)
				const savePath = path.join('static', 'content', 'canteenImages', filename)

				await fs.mkdir(path.dirname(savePath), { recursive: true })
				const arrayBuffer = await image.arrayBuffer()
				await fs.writeFile(savePath, Buffer.from(arrayBuffer))
			}

			const updateData: any = {}
			if (name) updateData.name = name
			if (timings) updateData.timings = timings
			if (open !== undefined) updateData.open = open
			if (description) updateData.description = description
			if (acronym) updateData.acronym = acronym
			if (active !== undefined) updateData.active = active
			if (path.extname(image.name)) updateData.image = `/content/canteenImages/${filename}`

			const [updatedCanteen] = await db
				.update(schema.canteens)
				.set(updateData)
				.where(eq(schema.canteens.id, id))
				.returning()

			if (!updatedCanteen) {
				throw fail(404, { error: 'Canteen not found' })
			}

			return { success: true, canteen: updatedCanteen }
		} catch (error) {
			console.error('Error updating canteen:', error)
			throw fail(500, { error: 'Failed to update canteen' })
		}
	},

	resetPassword: async ({ request, locals }) => {
		if (!locals.user || !auth.ADMIN.includes(locals.user.role)) throw fail(403, {message: 'Unauthorized'})

		try {
			const body = await request.formData()
			const id = parseInt(body.get('id')?.toString() || '')
			const newPassword = generateId(8)

			if (!id) {
				throw fail(400, { error: 'Canteen ID is required' })
			}

			// First, get the canteen to make sure it exists
			const canteen = await db
				.select()
				.from(schema.canteens)
				.where(eq(schema.canteens.id, id))
				.limit(1)

			if (canteen.length === 0) {
				throw fail(404, { error: 'Canteen not found' })
			}

			// Update the password in canteenAuth table
			await db
				.update(schema.canteenAuth)
				.set({
					passwordHash: encodeHexLowerCase(sha256(new TextEncoder().encode(newPassword))),
				})
				.where(eq(schema.canteenAuth.canteenId, id))

			return { success: true, canteen: canteen[0], newPassword }
		} catch (error) {
			console.error('Error resetting password:', error)
			throw fail(500, { error: 'Failed to reset password' })
		}
	}
}
