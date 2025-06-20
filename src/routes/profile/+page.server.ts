import * as auth from '$lib/server/session'
import { fail, redirect, error } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { db } from '$lib/server/db'
import * as schema from '$lib/server/db/schema'
import { eq, desc, and } from 'drizzle-orm'
import { updated } from '$app/state'
import { PgUpdateBuilder } from 'drizzle-orm/pg-core'
import fs from 'fs/promises'
import path from 'path'

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user)
		return redirect(302, `/login?redirect=${encodeURIComponent(event.url.href)}`)

	try {
		const wallets = await db
			.select({
				wallet: schema.wallets,
				canteen: schema.canteens,
			})
			.from(schema.wallets)
			.leftJoin(schema.canteens, eq(schema.wallets.canteenId, schema.canteens.id))
			.where(
				and(
					eq(schema.wallets.userId, event.locals.user.id),
					eq(schema.canteens.active, true),
				),
			)

		const recentTransactions = await db
			.select({
				transaction: schema.walletTransactions,
				wallet: schema.wallets,
				canteen: schema.canteens,
			})
			.from(schema.walletTransactions)
			.leftJoin(schema.wallets, eq(schema.walletTransactions.walletId, schema.wallets.id))
			.leftJoin(schema.canteens, eq(schema.wallets.canteenId, schema.canteens.id))
			.where(eq(schema.wallets.userId, event.locals.user.id))
			.orderBy(desc(schema.walletTransactions.createdAt))
			.limit(15)

		return {
			user: event.locals.user,
			wallets,
			recentTransactions,
		}
	} catch (err) {
		console.error('Error loading profile data:', err)
		throw error(500, 'Failed to load profile data')
	}
}

export const actions: Actions = {
	updateProfilePicture: async (event) => {
		if (!event.locals.user) throw fail(401, { message: 'Unauthorized' })

		const data = await event.request.formData()
		let profilePictureUrl = data.get('profilePictureUrl') as string

		if (!profilePictureUrl) {
			return fail(400, { message: 'Profile picture URL is required' })
		}

		if (!profilePictureUrl.includes('/avatars/avatar-')) {
			if (profilePictureUrl.startsWith('data:')) {
				try {
					const [header, base64Data] = profilePictureUrl.split(',')
					const mimeType = header.match(/data:([^;]+)/)?.[1]
					const fileExtension = mimeType?.split('/')[1] || 'jpg'

					const buffer = Buffer.from(base64Data, 'base64')
					const fileName = `${event.locals.user.id}.${fileExtension}`
					const savePath = path.join('static', 'content', 'UserImages', fileName)
					await fs.mkdir(path.dirname(savePath), { recursive: true })
					await fs.writeFile(savePath, buffer)

					profilePictureUrl = `/content/UserImages/${fileName}`
				} catch (error) {
					console.error('Error saving profile picture:', error)
					return fail(500, { message: 'Failed to save profile picture' })
				}
			} else {
				return fail(400, { message: 'Invalid profile picture URL format' })
			}
		}

		try {
			await db
				.update(schema.user)
				.set({ profilePicture: profilePictureUrl })
				.where(eq(schema.user.id, event.locals.user.id))

			console.log(
				'Profile picture updated successfully for user',
				event.locals.user.id,
				'to:',
				profilePictureUrl,
			)

			return { success: true, profilePictureUrl }
		} catch (error) {
			console.error('Error updating profile picture:', error)
			throw fail(500, { message: 'Failed to update profile picture' })
		}
	},
	updateEmailPreference: async (event) => {
		if (!event.locals.user) throw fail(401, { message: 'Unauthorized' })

		const data = await event.request.formData()
		const emailPreference = data.get('emailPreference') as string

		if (!emailPreference || !['all', 'important'].includes(emailPreference)) {
			throw fail(400, { message: 'Email preferences are required' })
		}

		try {
			await db
				.update(schema.user)
				.set({ emailPreference })
				.where(eq(schema.user.id, event.locals.user.id))
			return { success: true }
		} catch (error) {
			console.error('Error updating email preferences:', error)
			throw fail(500, { message: 'Failed to update email preferences' })
		}
	},
	updateProfileVisibility: async (event) => {
		if (!event.locals.user) return fail(401, { message: 'Unauthorized' })
		const data = await event.request.formData()
		const profileVisibility = data.get('visibility') as string

		if (!profileVisibility || !['public', 'private'].includes(profileVisibility)) {
			throw fail(400, { message: 'Profile visibility is required' })
		}

		try {
			await db
				.update(schema.user)
				.set({ profileVisibility })
				.where(eq(schema.user.id, event.locals.user.id))
			return { success: true }
		} catch (error) {
			console.error('Error updating profile visibility:', error)
			return fail(500, { message: 'Failed to update profile visibility' })
		}
	},
}
