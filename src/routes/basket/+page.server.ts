import { redirect, fail, error } from '@sveltejs/kit'
import * as auth from '$lib/server/session'
import type { PageServerLoad, Actions } from './$types'
import { db } from '$lib/server/db'
import * as schema from '$lib/server/db/schema'
import { eq, and, sql, or, not } from 'drizzle-orm'
import { generateId } from '$lib/helper'

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user)
		return redirect(302, `/login?redirect=${encodeURIComponent(event.url.href)}`)
	if (!auth.CONSUMER.includes(event.locals.user.role))
		throw error(403, 'Access denied')

	try {
		// Get all user's baskets
		const userBaskets = await db
			.select({
				basket: schema.baskets,
				canteen: schema.canteens,
				owner: {
					id: schema.user.id,
					name: schema.user.name,
				}
			})
			.from(schema.baskets)
			.leftJoin(schema.canteens, eq(schema.baskets.canteenId, schema.canteens.id))
			.leftJoin(schema.user, eq(schema.baskets.createdBy, schema.user.id))
			.where(eq(schema.baskets.createdBy, event.locals.user.id))
		// Get shared baskets (baskets from other users with same access codes)
		const userAccessCodes = userBaskets
			.map(b => b.basket.basketAccessCode)
			.filter((code): code is string => code !== null)

		let sharedBaskets: typeof userBaskets = []
		if (userAccessCodes.length > 0) {
			sharedBaskets = await db
				.select({
					basket: schema.baskets,
					canteen: schema.canteens,
					owner: {
						id: schema.user.id,
						name: schema.user.name,
					}
				})
				.from(schema.baskets)
				.leftJoin(schema.canteens, eq(schema.baskets.canteenId, schema.canteens.id))
				.leftJoin(schema.user, eq(schema.baskets.createdBy, schema.user.id))
				.where(and(
					sql`${schema.baskets.basketAccessCode} IS NOT NULL`,
					sql`${schema.baskets.basketAccessCode} IN (${sql.join(userAccessCodes.map(code => sql`${code}`), sql`, `)})`,
					not(eq(schema.baskets.createdBy, event.locals.user.id))
				))
		}

		// Combine all baskets
		const allBaskets = [...userBaskets, ...sharedBaskets]

		const basketsWithDetails = await Promise.all(
			allBaskets.map(async (basketData) => {
				const { basket, canteen, owner } = basketData
				if (!basket || !canteen) return null

				// Get all items in this basket
				const items = await db
					.select({
						id: schema.basketItems.id,
						quantity: schema.basketItems.quantity,
						addedBy: schema.basketItems.addedBy,
						addedByUser: {
							id: schema.user.id,
							name: schema.user.name,
						},
						menuItem: {
							id: schema.menuItems.id,
							name: schema.menuItems.name,
							description: schema.menuItems.description,
							price: schema.menuItems.price,
							category: schema.menuItems.category,
							type: schema.menuItems.type,
						},
						variant: {
							id: schema.variants.id,
							name: schema.variants.name,
							price: schema.variants.price,
						},
					})
					.from(schema.basketItems)
					.leftJoin(schema.menuItems, eq(schema.basketItems.menuItemId, schema.menuItems.id))
					.leftJoin(schema.variants, eq(schema.basketItems.variantId, schema.variants.id))
					.leftJoin(schema.user, eq(schema.basketItems.addedBy, schema.user.id))
					.where(eq(schema.basketItems.basketId, basket.id))

				// Get addons for each basket item
				const itemsWithAddons = await Promise.all(
					items.map(async (item) => {
						const itemAddons = await db
							.select({
								id: schema.addons.id,
								name: schema.addons.name,
								price: schema.addons.price,
								type: schema.addons.type,
							})
							.from(schema.basketAddons)
							.leftJoin(schema.addons, eq(schema.basketAddons.addonId, schema.addons.id))
							.where(eq(schema.basketAddons.basketItemId, item.id))

						return {
							...item,
							addons: itemAddons,
							canEdit: item.addedBy === event.locals.user.id
						}
					})
				)

				return {
					canteen,
					basket: basket,
					items: itemsWithAddons,
					owner: owner,
					isOwner: basket.createdBy === event.locals.user.id,
					accessCode: basket.basketAccessCode
				}
			})
		)
		// Filter out null results and keep baskets with items
		const validBaskets = basketsWithDetails
			.filter((basket): basket is NonNullable<typeof basket> => basket !== null)
			.filter(basket => basket.items.length > 0)

		// Group baskets by canteen and access code
		const basketsByCanteen = validBaskets.reduce((grouped, basket) => {
			const canteenId = basket.canteen.id
			const accessCode = basket.accessCode || 'individual'
			
			if (!grouped[canteenId]) {
				grouped[canteenId] = {}
			}
			if (!grouped[canteenId][accessCode]) {
				grouped[canteenId][accessCode] = {
					canteen: basket.canteen,
					baskets: [],
					accessCode: basket.accessCode,
					isShared: !!basket.accessCode
				}
			}
			
			grouped[canteenId][accessCode].baskets.push(basket)
			return grouped
		}, {} as Record<number, Record<string, any>>)

		// Flatten the grouped structure
		const finalBaskets = Object.values(basketsByCanteen).flatMap(canteenGroups => 
			Object.values(canteenGroups)
		)

		const wallets = await db
			.select({
				wallet: schema.wallets,
				canteen: schema.canteens,
			})
			.from(schema.wallets)
			.leftJoin(schema.canteens, eq(schema.wallets.canteenId, schema.canteens.id))
			.where(eq(schema.wallets.userId, event.locals.user.id))

		return {
			user: event.locals.user,
			basketsByCanteen: finalBaskets,
			wallets
		}
	} catch (err) {
		console.error('Error loading basket:', err)
		throw error(500, 'Failed to load basket')
	}
}

export const actions: Actions = {
	updateQuantity: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Not authenticated' })
		}

		const formData = await request.formData()
		const basketItemId = Number(formData.get('basketItemId'))
		const quantity = Number(formData.get('quantity'))

		if (!basketItemId || isNaN(basketItemId) || !quantity || isNaN(quantity)) {
			return fail(400, { error: 'Invalid parameters' })
		}

		try {
			if (quantity <= 0) {
				// Remove item if quantity is 0 or less, but only if user added it
				await db
					.delete(schema.basketItems)
					.where(and(eq(schema.basketItems.id, basketItemId), eq(schema.basketItems.addedBy, locals.user.id)))
			} else {
				await db
					.update(schema.basketItems)
					.set({ quantity })
					.where(and(eq(schema.basketItems.id, basketItemId), eq(schema.basketItems.addedBy, locals.user.id)))
			}
			return { success: true }
		} catch (error) {
			console.error('Error updating quantity:', error)
			return fail(500, { error: 'Failed to update quantity' })
		}
	},

	removeItem: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Not authenticated' })
		}

		const formData = await request.formData()
		const basketItemId = Number(formData.get('basketItemId'))

		if (!basketItemId || isNaN(basketItemId)) {
			return fail(400, { error: 'Invalid parameters' })
		}

		try {
			await db
				.delete(schema.basketItems)
				.where(and(eq(schema.basketItems.id, basketItemId), eq(schema.basketItems.addedBy, locals.user.id)))
			return { success: true }
		} catch (error) {
			console.error('Error removing item:', error)
			return fail(500, { error: 'Failed to remove item' })
		}
	},

	clearBasket: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Not authenticated' })
		}

		const formData = await request.formData()
		const canteenId = Number(formData.get('canteenId'))

		if (!canteenId || isNaN(canteenId)) {
			return fail(400, { error: 'Invalid parameters' })
		}

		try {
			// Find user's basket for this canteen
			const userBasket = await db
				.select()
				.from(schema.baskets)
				.where(and(
					eq(schema.baskets.createdBy, locals.user.id),
					eq(schema.baskets.canteenId, canteenId)
				))
				.limit(1)

			if (userBasket.length === 0) {
				return fail(404, { error: 'Basket not found' })
			}

			// Only clear items added by the current user
			await db
				.delete(schema.basketItems)
				.where(and(
					eq(schema.basketItems.basketId, userBasket[0].id),
					eq(schema.basketItems.addedBy, locals.user.id)
				))
			
			return { success: true }
		} catch (error) {
			console.error('Error clearing basket:', error)
			return fail(500, { error: 'Failed to clear basket' })
		}
	},

	placeOrder: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Not authenticated' })
		}

		const formData = await request.formData()
		const canteenId = Number(formData.get('canteenId'))
		const paymentMethod = formData.get('paymentMethod') as 'wallet' | 'postpaid'
		const accessCode = formData.get('accessCode') as string

		if (!['wallet', 'postpaid'].includes(paymentMethod)) {
			return fail(400, { error: 'Invalid payment method' })
		}

		if (!canteenId || isNaN(canteenId)) {
			return fail(400, { error: 'Invalid canteen ID' })
		}

		try {
			await db.transaction(async (tx) => {
				// Get all baskets for this shared group or individual basket
				let baskets;
				if (accessCode && accessCode !== 'individual') {
					// Get all baskets with this access code
					baskets = await tx
						.select()
						.from(schema.baskets)
						.where(and(
							eq(schema.baskets.canteenId, canteenId),
							eq(schema.baskets.basketAccessCode, accessCode)
						))
				} else {
					// Get user's individual basket
					baskets = await tx
						.select()
						.from(schema.baskets)
						.where(and(
							eq(schema.baskets.createdBy, locals.user.id),
							eq(schema.baskets.canteenId, canteenId)
						))
				}

				if (baskets.length === 0) {
					throw new Error('No baskets found')
				}

				// Check if user is authorized to place order
				// For shared baskets, only the original sharer can place orders
				// For individual baskets, only the owner can place orders
				const userBasket = baskets.find(b => b.createdBy === locals.user.id)
				if (!userBasket) {
					throw new Error('Only the basket owner can place orders')
				}

				// For shared baskets, verify user is the original sharer (first creator with access code)
				if (accessCode && accessCode !== 'individual') {
					const originalSharer = baskets.find(b => b.basketAccessCode === accessCode)
					if (!originalSharer || originalSharer.createdBy !== locals.user.id) {
						throw new Error('Only the original sharer can place orders')
					}
				}

				// Get all basket items from all baskets in the group
				const allBasketItems = []
				for (const basket of baskets) {
					const items = await tx
						.select({
							id: schema.basketItems.id,
							quantity: schema.basketItems.quantity,
							addedBy: schema.basketItems.addedBy,
							menuItem: {
								id: schema.menuItems.id,
								name: schema.menuItems.name,
								price: schema.menuItems.price,
							},
							variant: {
								id: schema.variants.id,
								name: schema.variants.name,
								price: schema.variants.price,
							},
						})
						.from(schema.basketItems)
						.leftJoin(schema.menuItems, eq(schema.basketItems.menuItemId, schema.menuItems.id))
						.leftJoin(schema.variants, eq(schema.basketItems.variantId, schema.variants.id))
						.where(eq(schema.basketItems.basketId, basket.id))

					allBasketItems.push(...items)
				}

				if (allBasketItems.length === 0) {
					throw new Error('No items in basket')
				}

				// Get addons for all items
				const itemsWithAddons = await Promise.all(
					allBasketItems.map(async (item) => {
						const addons = await tx
							.select({
								id: schema.addons.id,
								name: schema.addons.name,
								price: schema.addons.price,
							})
							.from(schema.basketAddons)
							.leftJoin(schema.addons, eq(schema.basketAddons.addonId, schema.addons.id))
							.where(eq(schema.basketAddons.basketItemId, item.id))

						return { ...item, addons: addons.filter(addon => addon.id) }
					})
				)

				// Group items by user
				const itemsByUser = itemsWithAddons.reduce((groups: any, item) => {
					const userId = item.addedBy
					if (!groups[userId]) {
						groups[userId] = []
					}
					groups[userId].push(item)
					return groups
				}, {})

				// Generate linking number for shared orders
				const isSharedBasket = baskets.length > 1
				const linkingNumber = isSharedBasket ? generateId() : null

				// Handle wallet payment validation for basket owner (if wallet payment)
				let ownerWallet = null
				if (paymentMethod === 'wallet') {
					ownerWallet = await tx
						.select()
						.from(schema.wallets)
						.where(and(
							eq(schema.wallets.userId, locals.user.id),
							eq(schema.wallets.canteenId, canteenId)
						))
						.limit(1)

					if (ownerWallet.length === 0) {
						throw new Error('Wallet not found')
					}

					// Calculate total amount for wallet validation
					let totalAmount = 0
					for (const item of itemsWithAddons) {
						const basePrice = Number(item.menuItem!.price)
						const variantPrice = item.variant ? Number(item.variant.price) : 0
						const addonsPrice = item.addons.reduce((sum, addon) => sum + Number(addon.price), 0)
						totalAmount += (basePrice + variantPrice + addonsPrice) * item.quantity
					}

					const currentBalance = Number(ownerWallet[0].balance)
					if (currentBalance < totalAmount) {
						throw new Error('Insufficient wallet balance')
					}
				}

				// Create orders for each user
				const createdOrders = []
				for (const [userId, userItems] of Object.entries(itemsByUser)) {
					// Calculate user's total
					let userTotal = 0
					for (const item of userItems as any[]) {
						const basePrice = Number(item.menuItem!.price)
						const variantPrice = item.variant ? Number(item.variant.price) : 0
						const addonsPrice = item.addons.reduce((sum: number, addon: any) => sum + Number(addon.price), 0)
						userTotal += (basePrice + variantPrice + addonsPrice) * item.quantity
					}

					// Get and increment order counter for this canteen
					const [canteen] = await tx
						.update(schema.canteens)
						.set({ orderCounter: sql`${schema.canteens.orderCounter} + 1` })
						.where(eq(schema.canteens.id, canteenId))
						.returning({ orderCounter: schema.canteens.orderCounter })

					const orderNumber = canteen.orderCounter.toString()
					const otp = generateId(4)

					// Create order
					const [order] = await tx
						.insert(schema.orders)
						.values({
							orderNumber,
							userId: userId,
							canteenId,
							status: 'pending',
							totalAmount: userTotal.toString(),
							prepaid: paymentMethod === 'wallet',
							otp,
							linked: isSharedBasket,
							linkingNumber,
						})
						.returning()

					createdOrders.push({ order, userItems, userTotal })

					// Create order items for this user
					for (const basketItem of userItems as any[]) {
						const basePrice = Number(basketItem.menuItem!.price)
						const variantPrice = basketItem.variant ? Number(basketItem.variant.price) : 0
						const addonsPrice = basketItem.addons.reduce((sum: number, addon: any) => sum + Number(addon.price), 0)
						const subtotal = (basePrice + variantPrice + addonsPrice) * basketItem.quantity

						const [orderItem] = await tx
							.insert(schema.orderItems)
							.values({
								orderId: order.id,
								menuItemId: basketItem.menuItem!.id,
								variantId: basketItem.variant?.id || null,
								quantity: basketItem.quantity,
								unitPrice: basePrice.toString(),
								variantPrice: variantPrice.toString(),
								subtotal: subtotal.toString(),
							})
							.returning()

						// Add order addons
						for (const addon of basketItem.addons) {
							await tx.insert(schema.orderAddons).values({
								orderItemId: orderItem.id,
								addonId: addon.id!,
								unitPrice: Number(addon.price).toString(),
							})
						}
					}
				}

				// Handle wallet deduction (from basket owner if wallet payment)
				if (paymentMethod === 'wallet' && ownerWallet && ownerWallet.length > 0) {
					const totalAmount = createdOrders.reduce((sum, order) => sum + order.userTotal, 0)
					const currentBalance = Number(ownerWallet[0].balance)
					const newBalance = currentBalance - totalAmount

					await tx
						.update(schema.wallets)
						.set({
							balance: newBalance.toString(),
							updatedAt: new Date()
						})
						.where(eq(schema.wallets.id, ownerWallet[0].id))

					// Create wallet transaction
					await tx.insert(schema.walletTransactions).values({
						walletId: ownerWallet[0].id,
						amount: (-totalAmount).toString(),
						reference: `Group Order ${linkingNumber || createdOrders[0].order.orderNumber}`,
						performedBy: locals.user!.id,
					})
				}

				// Delete all baskets in the group after successful order
				for (const basket of baskets) {
					await tx.delete(schema.baskets).where(eq(schema.baskets.id, basket.id))
				}
			})

			return {
				success: true,
				message: 'Order placed successfully!',
				redirect: '/orders'
			}
		} catch (error) {
			console.error('Error placing order:', error)
			const message = error instanceof Error ? error.message : 'Failed to place order'
			return fail(500, { error: message })
		}
	},

	shareBasket: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Not authenticated' })
		}

		const formData = await request.formData()
		const canteenId = Number(formData.get('canteenId'))

		if (!canteenId || isNaN(canteenId)) {
			return fail(400, { error: 'Invalid canteen ID' })
		}

		try {
			// Get or create basket for this canteen
			let basket = await db
				.select()
				.from(schema.baskets)
				.where(and(
					eq(schema.baskets.createdBy, locals.user.id),
					eq(schema.baskets.canteenId, canteenId)
				))
				.limit(1)

			if (basket.length === 0) {
				// Create new basket if none exists
				const [newBasket] = await db
					.insert(schema.baskets)
					.values({
						id: generateId(),
						createdBy: locals.user.id,
						canteenId: canteenId,
					})
					.returning()
				basket = [newBasket]
			}

			// Generate access code and save it to the basket
			const accessCode = generateId(8).toUpperCase()

			await db
				.update(schema.baskets)
				.set({
					basketAccessCode: accessCode,
					updatedAt: new Date()
				})
				.where(eq(schema.baskets.id, basket[0].id))

			return {
				success: true,
				accessCode,
			}
		} catch (error) {
			console.error('Error sharing basket:', error)
			return fail(500, { error: 'Failed to share basket' })
		}
	},

	joinBasket: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Not authenticated' })
		}

		const formData = await request.formData()
		const accessCode = formData.get('accessCode') as string

		if (!accessCode || accessCode.length !== 8) {
			return fail(400, { error: 'Invalid access code' })
		}

		try {
			// Find the shared basket with this access code
			const sharedBasket = await db
				.select({
					basket: schema.baskets,
					owner: {
						id: schema.user.id,
						name: schema.user.name,
					}
				})
				.from(schema.baskets)
				.leftJoin(schema.user, eq(schema.baskets.createdBy, schema.user.id))
				.where(eq(schema.baskets.basketAccessCode, accessCode.toUpperCase()))
				.limit(1)

			if (sharedBasket.length === 0 || !sharedBasket[0].basket) {
				return fail(400, { error: 'Invalid or expired access code' })
			}

			const { basket, owner } = sharedBasket[0]
			const canteenId = basket.canteenId

			// Check if user is trying to join their own basket
			if (basket.createdBy === locals.user.id) {
				return fail(400, { error: 'You cannot join your own basket' })
			}

			// Get or create user's basket for this canteen
			let userBasket = await db
				.select()
				.from(schema.baskets)
				.where(and(
					eq(schema.baskets.createdBy, locals.user.id),
					eq(schema.baskets.canteenId, canteenId)
				))
				.limit(1)

			if (userBasket.length === 0) {
				// Create new basket for the joining user
				const [newBasket] = await db
					.insert(schema.baskets)
					.values({
						id: generateId(),
						createdBy: locals.user.id,
						canteenId: canteenId,
						basketAccessCode: accessCode.toUpperCase(), // Same access code
					})
					.returning()
				userBasket = [newBasket]
			} else {
				// Update existing basket with the access code
				await db
					.update(schema.baskets)
					.set({
						basketAccessCode: accessCode.toUpperCase(),
						updatedAt: new Date()
					})
					.where(eq(schema.baskets.id, userBasket[0].id))
			}

			return {
				success: true,
				message: `Successfully joined ${owner?.name}'s basket!`,
				ownerName: owner?.name
			}
		} catch (error) {
			console.error('Error joining basket:', error)
			return fail(500, { error: 'Failed to join basket' })
		}
	}
}
