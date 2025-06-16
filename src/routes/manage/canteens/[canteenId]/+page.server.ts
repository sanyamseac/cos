import { redirect, fail, error } from '@sveltejs/kit'
import * as auth from '$lib/server/session'
import type { PageServerLoad } from './$types'
import { db } from '$lib/server/db'
import * as fs from 'fs/promises'
import * as schema from '$lib/server/db/schema'
import { eq, and } from 'drizzle-orm'
import type { Actions } from '@sveltejs/kit'
import path from 'path'

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user)
		return redirect(302, `/login?redirect=${encodeURIComponent(event.url.href)}`)
	if (!auth.ADMIN.includes(event.locals.user.role)) throw error(403, 'Access denied - Admin only')

	const canteenAcronym = event.params.canteenId
	try {
		const canteen = await db
			.select()
			.from(schema.canteens)
			.where(and(eq(schema.canteens.acronym, canteenAcronym)))
			.then((results) => results[0])

		if (!canteen) {
			throw error(404, 'Canteen not found')
		}

		const canteenId = canteen.id

		const [menuItems, variants, addons] = await Promise.all([
			db.select().from(schema.menuItems).where(eq(schema.menuItems.canteenId, canteenId)),
			db.select().from(schema.variants),
			db.select().from(schema.addons),
		])

		const variantsByItem: Record<number, any[]> = {}
		for (const v of variants) {
			if (!variantsByItem[v.itemId]) variantsByItem[v.itemId] = []
			variantsByItem[v.itemId].push(v)
		}
		const addonsByItem: Record<number, any[]> = {}
		for (const a of addons) {
			if (!addonsByItem[a.itemId]) addonsByItem[a.itemId] = []
			addonsByItem[a.itemId].push(a)
		}

		const menuItemsWithDetails = menuItems.map((item) => ({
			...item,
			variants: variantsByItem[item.id] || [],
			addons: addonsByItem[item.id] || [],
		}))

		const menuCategories = menuItemsWithDetails.reduce(
			(acc: Record<string, typeof menuItemsWithDetails>, item) => {
				if (!acc[item.category]) {
					acc[item.category] = []
				}
				acc[item.category].push(item)
				return acc
			},
			{},
		)

		return {
			user: event.locals.user,
			canteen,
			menuCategories,
		}
	} catch (err) {
		console.error('Error fetching canteen data:', err)
		throw error(500, 'Failed to load canteen data')
	}
}

export const actions: Actions = {
	addMenuItem: async ({ request, locals }) => {
		if (!locals.user || !auth.ADMIN.includes(locals.user.role))
			throw fail(403, { message: 'Unauthorized' })

		try {
			const body = await request.formData()
			const canteenIdStr = body.get('canteenId')?.toString()
			const canteenId = parseInt(canteenIdStr || '')
			const category = body.get('category')?.toString()
			const name = body.get('name')?.toString()
			const price = body.get('price')?.toString()
			const availableValue = body.get('available')?.toString()
			const description = body.get('description')?.toString()
			const type = body.get('type')?.toString() || 'veg'
			const activeValue = body.get('active')?.toString()
			const image = body.get('image') as File | null

			if (image && !(image instanceof File)) {
				console.error('Invalid image file:', image)
				throw fail(400, { error: 'Invalid image file' })
			}

			let filename = ''
			if (image) {
				filename = name + path.extname(image.name)
				const savePath = path.join('static', 'content', 'MenuItemImages', filename)
				await fs.mkdir(path.dirname(savePath), { recursive: true })
				const arrayBuffer = await image.arrayBuffer()
				await fs.writeFile(savePath, Buffer.from(arrayBuffer))
			}

			if (!canteenIdStr || isNaN(canteenId) || !category || !name || !price) {
				console.log('Validation failed:', {
					hasCanteenIdStr: !!canteenIdStr,
					isCanteenIdNaN: isNaN(canteenId),
					hasCategory: !!category,
					hasName: !!name,
					hasPrice: !!price,
				})
				throw fail(400, { error: 'CanteenId, category, name, and price are required' })
			}

			const available =
				availableValue === 'true' || availableValue === 'on' || (!availableValue && true)
			const active = activeValue === 'true' || activeValue === 'on' || (!activeValue && true)

			const [newItem] = await db
				.insert(schema.menuItems)
				.values({
					canteenId,
					category,
					name,
					price,
					available,
					type,
					active,
					description: description,
					image: filename
						? `/content/MenuItemImages/${filename}`
						: '/defaultMenuItem.png',
				})
				.returning()

			return { success: true, menuItem: newItem }
		} catch (error) {
			console.error('Error creating menu item:', error)
			throw fail(500, { error: 'Failed to create menu item' })
		}
	},

	updateMenuItem: async ({ request, locals }) => {
		if (!locals.user || !auth.ADMIN.includes(locals.user.role))
			throw fail(403, { message: 'Unauthorized' })

		try {
			const body = await request.formData()
			const id = parseInt(body.get('id')?.toString() || '')
			const canteenId = body.get('canteenId')?.toString()
			const category = body.get('category')?.toString()
			const name = body.get('name')?.toString()
			const price = body.get('price')?.toString()
			const available = body.get('available')
			const description = body.get('description')?.toString()
			const type = body.get('type')?.toString()
			const active = body.get('active')
			const image = body.get('image') as File | null

			if (!id) {
				throw fail(400, { error: 'Menu item ID is required' })
			}

			let filename = ''
			if (image) {
				filename = name + path.extname(image.name)
				const savePath = path.join('static', 'content', 'MenuItemImages', filename)
				await fs.mkdir(path.dirname(savePath), { recursive: true })
				const arrayBuffer = await image.arrayBuffer()
				await fs.writeFile(savePath, Buffer.from(arrayBuffer))
			}

			const updateData: any = {}
			if (canteenId) updateData.canteenId = parseInt(canteenId)
			if (category) updateData.category = category
			if (name) updateData.name = name
			if (price) updateData.price = price
			if (available !== null) updateData.available = available === 'true'
			if (type) updateData.type = type
			if (active !== null) updateData.active = active === 'true'
			if (description) updateData.description = description
			if (filename) updateData.image = `/content/MenuItemImages/${filename}`

			const [updatedItem] = await db
				.update(schema.menuItems)
				.set(updateData)
				.where(eq(schema.menuItems.id, id))
				.returning()

			if (!updatedItem) {
				throw fail(404, { error: 'Menu item not found' })
			}

			return { success: true, menuItem: updatedItem }
		} catch (error) {
			console.error('Error updating menu item:', error)
			throw fail(500, { error: 'Failed to update menu item' })
		}
	},

	// Addons
	addAddon: async ({ request, locals }) => {
		if (!locals.user || !auth.ADMIN.includes(locals.user.role))
			throw fail(403, { message: 'Unauthorized' })

		try {
			const body = await request.formData()
			const itemId = parseInt(body.get('itemId')?.toString() || '')
			const name = body.get('name')?.toString()
			const price = body.get('price')?.toString()
			const active = body.get('active') === 'true'
			const available = body.get('available') === 'true'
			const type = body.get('type')?.toString() || 'veg'

			if (!itemId || !name || !price) {
				throw fail(400, { error: 'ItemId, name, and price are required' })
			}

			const [newAddon] = await db
				.insert(schema.addons)
				.values({
					itemId,
					name,
					price,
					active: active ?? true,
					available: available ?? true,
					type,
				})
				.returning()

			return { success: true, addon: newAddon }
		} catch (error) {
			console.error('Error creating addon:', error)
			throw fail(500, { error: 'Failed to create addon' })
		}
	},

	updateAddon: async ({ request, locals }) => {
		if (!locals.user || !auth.ADMIN.includes(locals.user.role))
			throw fail(403, { message: 'Unauthorized' })

		try {
			const body = await request.formData()
			const id = parseInt(body.get('id')?.toString() || '')
			const itemId = body.get('itemId')?.toString()
			const name = body.get('name')?.toString()
			const price = body.get('price')?.toString()
			const active = body.get('active')
			const available = body.get('available')
			const type = body.get('type')?.toString()

			if (!id) {
				throw fail(400, { error: 'Addon ID is required' })
			}

			const updateData: any = {}
			if (itemId) updateData.itemId = parseInt(itemId)
			if (name) updateData.name = name
			if (price) updateData.price = price
			if (active !== null) updateData.active = active === 'true'
			if (available !== null) updateData.available = available === 'true'
			if (type) updateData.type = type

			const [updatedAddon] = await db
				.update(schema.addons)
				.set(updateData)
				.where(eq(schema.addons.id, id))
				.returning()

			if (!updatedAddon) {
				throw fail(404, { error: 'Addon not found' })
			}

			return { success: true, addon: updatedAddon }
		} catch (error) {
			console.error('Error updating addon:', error)
			throw fail(500, { error: 'Failed to update addon' })
		}
	},

	// Variants
	addVariant: async ({ request, locals }) => {
		if (!locals.user || !auth.ADMIN.includes(locals.user.role))
			throw fail(403, { message: 'Unauthorized' })

		try {
			const body = await request.formData()
			const itemId = parseInt(body.get('itemId')?.toString() || '')
			const name = body.get('name')?.toString()
			const price = body.get('price')?.toString()
			const active = body.get('active') === 'true'
			const available = body.get('available') === 'true'

			if (!itemId || !name || !price) {
				throw fail(400, { error: 'ItemId, name, and price are required' })
			}

			const [newVariant] = await db
				.insert(schema.variants)
				.values({
					itemId,
					name,
					price,
					active: active ?? true,
					available: available ?? true,
				})
				.returning()

			return { success: true, variant: newVariant }
		} catch (error) {
			console.error('Error creating variant:', error)
			throw fail(500, { error: 'Failed to create variant' })
		}
	},

	updateVariant: async ({ request, locals }) => {
		if (!locals.user || !auth.ADMIN.includes(locals.user.role))
			throw fail(403, { message: 'Unauthorized' })

		try {
			const body = await request.formData()
			const id = parseInt(body.get('id')?.toString() || '')
			const itemId = body.get('itemId')?.toString()
			const name = body.get('name')?.toString()
			const price = body.get('price')?.toString()
			const active = body.get('active')
			const available = body.get('available')

			if (!id) {
				throw fail(400, { error: 'Variant ID is required' })
			}

			const updateData: any = {}
			if (itemId) updateData.itemId = parseInt(itemId)
			if (name) updateData.name = name
			if (price) updateData.price = price
			if (active !== null) updateData.active = active === 'true'
			if (available !== null) updateData.available = available === 'true'

			const [updatedVariant] = await db
				.update(schema.variants)
				.set(updateData)
				.where(eq(schema.variants.id, id))
				.returning()

			if (!updatedVariant) {
				throw fail(404, { error: 'Variant not found' })
			}

			return { success: true, variant: updatedVariant }
		} catch (error) {
			console.error('Error updating variant:', error)
			throw fail(500, { error: 'Failed to update variant' })
		}
	},
}
