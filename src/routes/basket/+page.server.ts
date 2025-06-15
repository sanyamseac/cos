import { redirect, fail, error } from '@sveltejs/kit'
import * as auth from '$lib/server/session'
import type { PageServerLoad, Actions } from './$types'
import { db } from '$lib/server/db'
import * as schema from '$lib/server/db/schema'
import { eq, and, inArray, sql } from 'drizzle-orm'
import { generateId } from '$lib/helper'

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user)
		return redirect(302, `/login?redirect=${encodeURIComponent(event.url.href)}`)
	if (!auth.CONSUMER.includes(event.locals.user.role))
		throw error(403, 'Access denied')

	try {
		// Get all canteens to check baskets for each one
		const allCanteens = await db.select().from(schema.canteens)

		// Get basket items for each canteen (including shared baskets)
		const basketsByCanteen = await Promise.all(
			allCanteens.map(async (canteen) => {
				// First check for existing basket access
				let basketAccess = await db
					.select({
						basket: schema.baskets,
						access: schema.basketAccess,
						owner: {
							id: schema.user.id,
							name: schema.user.name,
						}
					})
					.from(schema.basketAccess)
					.leftJoin(schema.baskets, eq(schema.basketAccess.basketId, schema.baskets.id))
					.leftJoin(schema.user, eq(schema.baskets.createdBy, schema.user.id))
					.where(and(
						eq(schema.basketAccess.userId, event.locals.user!.id),
						eq(schema.baskets.canteenId, canteen.id),
						sql`${schema.basketAccess.expiresAt} > NOW()`
					))
					.limit(1)

				// If no access found, check for baskets owned by this user (for backward compatibility)
				if (basketAccess.length === 0) {
					const ownedBaskets = await db
						.select({
							basket: schema.baskets,
							owner: {
								id: schema.user.id,
								name: schema.user.name,
							}
						})
						.from(schema.baskets)
						.leftJoin(schema.user, eq(schema.baskets.createdBy, schema.user.id))
						.where(and(
							eq(schema.baskets.createdBy, event.locals.user!.id),
							eq(schema.baskets.canteenId, canteen.id)
						))
						.limit(1)

					if (ownedBaskets.length > 0) {
						// Create access record for owner
						await db
							.insert(schema.basketAccess)
							.values({
								basketId: ownedBaskets[0].basket.id,
								userId: event.locals.user!.id,
								isOwner: true,
								expiresAt: sql`NOW() + INTERVAL '1 day'`,
							})
							.onConflictDoNothing()

						// Re-fetch with access info
						basketAccess = await db
							.select({
								basket: schema.baskets,
								access: schema.basketAccess,
								owner: {
									id: schema.user.id,
									name: schema.user.name,
								}
							})
							.from(schema.basketAccess)
							.leftJoin(schema.baskets, eq(schema.basketAccess.basketId, schema.baskets.id))
							.leftJoin(schema.user, eq(schema.baskets.createdBy, schema.user.id))
							.where(and(
								eq(schema.basketAccess.userId, event.locals.user!.id),
								eq(schema.baskets.canteenId, canteen.id),
								sql`${schema.basketAccess.expiresAt} > NOW()`
							))
							.limit(1)
					}
				}

				if (basketAccess.length === 0) {
					return {
						canteen,
						items: [],
						basketAccess: null
					}
				}

				const { basket, access, owner } = basketAccess[0]
				if (!basket) {
					return {
						canteen,
						items: [],
						basketAccess: null
					}
				}

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
							canEdit: item.addedBy === event.locals.user!.id
						}
					})
				)

				// Get all members of this basket
				const basketMembers = await db
					.select({
						user: {
							id: schema.user.id,
							name: schema.user.name,
						},
						isOwner: schema.basketAccess.isOwner,
						joinedAt: schema.basketAccess.joinedAt,
					})
					.from(schema.basketAccess)
					.leftJoin(schema.user, eq(schema.basketAccess.userId, schema.user.id))
					.where(and(
						eq(schema.basketAccess.basketId, basket.id),
						sql`${schema.basketAccess.expiresAt} > NOW()`
					))
					.orderBy(sql`${schema.basketAccess.isOwner} DESC, ${schema.basketAccess.joinedAt} ASC`)

				return {
					canteen,
					items: itemsWithAddons,
					basketAccess: {
						...access,
						owner,
						members: basketMembers
					}
				}
			})
		)

		// Filter out canteens with empty baskets
		const basketsWithItems = basketsByCanteen.filter(basket => basket.items.length > 0 || basket.basketAccess)

		// Get wallet balances for all canteens that have items in basket
		const canteenIds = basketsWithItems.map(b => b.canteen.id)
		const wallets = await db
			.select({
				wallet: schema.wallets,
				canteen: schema.canteens,
			})
			.from(schema.wallets)
			.leftJoin(schema.canteens, eq(schema.wallets.canteenId, schema.canteens.id))
			.where(and(
				eq(schema.wallets.userId, event.locals.user.id),
				inArray(schema.wallets.canteenId, canteenIds.length > 0 ? canteenIds : [0])
			))

		return {
			user: event.locals.user,
			baskets: basketsWithItems,
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
			throw fail(401, { error: 'Not authenticated' })
		}

		const formData = await request.formData()
		const basketItemId = Number(formData.get('basketItemId'))
		const quantity = Number(formData.get('quantity'))

		if (!basketItemId || isNaN(basketItemId) || !quantity || isNaN(quantity)) {
			throw fail(400, { error: 'Invalid parameters' })
		}

		try {
			if (quantity <= 0) {
				// Remove item if quantity is 0 or less
				await db.delete(schema.basketItems).where(eq(schema.basketItems.id, basketItemId))
			} else {
				await db
					.update(schema.basketItems)
					.set({ quantity })
					.where(and(eq(schema.basketItems.id, basketItemId), eq(schema.basketItems.addedBy, locals.user.id)))
			}
			return { success: true }
		} catch (error) {
			console.error('Error updating quantity:', error)
			throw fail(500, { error: 'Failed to update quantity' })
		}
	},

	removeItem: async ({ request, locals }) => {
		if (!locals.user) {
			throw fail(401, { error: 'Not authenticated' })
		}

		const formData = await request.formData()
		const basketItemId = Number(formData.get('basketItemId'))

		if (!basketItemId || isNaN(basketItemId)) {
			throw fail(400, { error: 'Invalid parameters' })
		}

		try {
			await db
				.delete(schema.basketItems)
				.where(and(eq(schema.basketItems.id, basketItemId), eq(schema.basketItems.addedBy, locals.user.id)))
			return { success: true }
		} catch (error) {
			console.error('Error removing item:', error)
			throw fail(500, { error: 'Failed to remove item' })
		}
	},

	clearBasket: async ({ request, locals }) => {
		if (!locals.user) {
			throw fail(401, { error: 'Not authenticated' })
		}

		const formData = await request.formData()
		const canteenId = Number(formData.get('canteenId'))

		if (!canteenId || isNaN(canteenId)) {
			throw fail(400, { error: 'Invalid parameters' })
		}

		try {
			const basket = await db
				.select()
				.from(schema.baskets)
				.where(and(eq(schema.baskets.createdBy, locals.user.id), eq(schema.baskets.canteenId, canteenId)))
				.limit(1)

			if (basket.length > 0) {
				await db.delete(schema.basketItems).where(eq(schema.basketItems.basketId, basket[0].id))
			}
			return { success: true }
		} catch (error) {
			console.error('Error clearing basket:', error)
			throw fail(500, { error: 'Failed to clear basket' })
		}
	},

	placeOrder: async ({ request, locals }) => {
		if (!locals.user) {
			throw fail(401, { error: 'Not authenticated' })
		}

		const formData = await request.formData()
		const canteenId = Number(formData.get('canteenId'))
		// Get payment method directly as 'wallet' or 'postpaid'
		const paymentMethod = formData.get('paymentMethod') as 'wallet' | 'postpaid'

		if (!['wallet', 'postpaid'].includes(paymentMethod)) {
			throw fail(400, { error: 'Invalid payment method' })
		}

		if (!canteenId || isNaN(canteenId)) {
			throw fail(400, { error: 'Invalid canteen ID' })
		}

		try {
			// Start transaction
			await db.transaction(async (tx) => {
				// Find basket through basket access (supports shared baskets)
				const basketAccess = await tx
					.select({
						basket: schema.baskets,
						access: schema.basketAccess,
					})
					.from(schema.basketAccess)
					.leftJoin(schema.baskets, eq(schema.basketAccess.basketId, schema.baskets.id))
					.where(and(
						eq(schema.basketAccess.userId, locals.user!.id),
						eq(schema.baskets.canteenId, canteenId),
						sql`${schema.basketAccess.expiresAt} > NOW()`
					))
					.limit(1)

				if (basketAccess.length === 0 || !basketAccess[0].basket) {
					throw new Error('Basket not found or access expired')
				}

				const { basket, access } = basketAccess[0]

				// Check if this is a shared basket
				const allMembers = await tx
					.select({
						user: {
							id: schema.user.id,
							name: schema.user.name,
						},
						isOwner: schema.basketAccess.isOwner,
					})
					.from(schema.basketAccess)
					.leftJoin(schema.user, eq(schema.basketAccess.userId, schema.user.id))
					.where(and(
						eq(schema.basketAccess.basketId, basket.id),
						sql`${schema.basketAccess.expiresAt} > NOW()`
					))

				const isSharedBasket = allMembers.length > 1
				const basketOwner = allMembers.find(m => m.isOwner)

				// Get basket items with their details and who added them
				const basketItems = await tx
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

				if (basketItems.length === 0) {
					throw new Error('No items in basket')
				}

				// Filter out items without valid menu items
				const validBasketItems = basketItems.filter(item => item.menuItem?.id)

				if (validBasketItems.length === 0) {
					throw new Error('No valid items in basket')
				}

				// Get addons for basket items
				const basketItemsWithAddons = await Promise.all(
					validBasketItems.map(async (item) => {
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

				// Generate linking number for shared baskets
				const linkingNumber = isSharedBasket ? generateId() : null

				// Group items by user
				const itemsByUser = basketItemsWithAddons.reduce((groups: any, item) => {
					const userId = item.addedBy
					if (!groups[userId]) {
						groups[userId] = []
					}
					groups[userId].push(item)
					return groups
				}, {})

				// Handle wallet payment validation for basket owner (if wallet payment)
				let ownerWallet = null
				if (paymentMethod === 'wallet' && basketOwner?.user) {
					ownerWallet = await tx
						.select()
						.from(schema.wallets)
						.where(and(
							eq(schema.wallets.userId, basketOwner.user.id),
							eq(schema.wallets.canteenId, canteenId)
						))
						.limit(1)

					if (ownerWallet.length === 0) {
						throw new Error('Owner wallet not found')
					}

					// Calculate total amount for wallet validation
					let totalAmount = 0
					for (const item of basketItemsWithAddons) {
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

				// Remove basket access for non-owners and delete basket
				await tx.delete(schema.basketAccess).where(
					and(
						eq(schema.basketAccess.basketId, basket.id),
						eq(schema.basketAccess.isOwner, false)
					)
				)
				await tx.delete(schema.baskets).where(eq(schema.baskets.id, basket.id))
			})

			return {
				success: true,
				message: 'Order placed successfully!',
				redirect: '/orders'
			}
		} catch (error) {
			console.error('Error placing order:', error)
			const message = error instanceof Error ? error.message : 'Failed to place order'
			throw fail(500, { error: message })
		}
	},

	shareBasket: async ({ request, locals }) => {
		if (!locals.user) {
			throw fail(401, { error: 'Not authenticated' })
		}

		const formData = await request.formData()
		const canteenId = Number(formData.get('canteenId'))

		if (!canteenId || isNaN(canteenId)) {
			throw fail(400, { error: 'Invalid canteen ID' })
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

			// Generate access code
			const accessCode = generateId(8)

			// Create or update basket access for owner
			await db
				.insert(schema.basketAccess)
				.values({
					basketId: basket[0].id,
					userId: locals.user.id,
					accessCode,
					isOwner: true,
					expiresAt: sql`NOW() + INTERVAL '1 day'`,
				})
				.onConflictDoUpdate({
					target: [schema.basketAccess.basketId, schema.basketAccess.userId],
					set: {
						accessCode,
						expiresAt: sql`NOW() + INTERVAL '1 day'`,
					},
				})

			return {
				success: true,
				accessCode,
			}
		} catch (error) {
			console.error('Error sharing basket:', error)
			throw fail(500, { error: 'Failed to share basket' })
		}
	},

	joinBasket: async ({ request, locals }) => {
		if (!locals.user) {
			throw fail(401, { error: 'Not authenticated' })
		}

		const formData = await request.formData()
		const accessCode = formData.get('accessCode') as string

		if (!accessCode || accessCode.length !== 8) {
			throw fail(400, { error: 'Invalid access code' })
		}

		try {
			// Find basket by access code
			const basketAccess = await db
				.select({
					basket: schema.baskets,
					owner: {
						id: schema.user.id,
						name: schema.user.name,
					},
					expiresAt: schema.basketAccess.expiresAt,
				})
				.from(schema.basketAccess)
				.leftJoin(schema.baskets, eq(schema.basketAccess.basketId, schema.baskets.id))
				.leftJoin(schema.user, eq(schema.baskets.createdBy, schema.user.id))
				.where(and(
					eq(schema.basketAccess.accessCode, accessCode),
					eq(schema.basketAccess.isOwner, true),
					sql`${schema.basketAccess.expiresAt} > NOW()`
				))
				.limit(1)

			if (basketAccess.length === 0) {
				throw fail(400, { error: 'Invalid or expired basket code' })
			}

			const { basket, owner } = basketAccess[0]

			if (!basket) {
				throw fail(400, { error: 'Basket not found' })
			}

			// Check if user is already in this basket
			const existingAccess = await db
				.select()
				.from(schema.basketAccess)
				.where(and(
					eq(schema.basketAccess.basketId, basket.id),
					eq(schema.basketAccess.userId, locals.user.id)
				))
				.limit(1)

			if (existingAccess.length > 0) {
				return {
					success: true,
					message: `You're already in ${owner?.name}'s basket`,
				}
			}

			// Add user to basket
			await db
				.insert(schema.basketAccess)
				.values({
					basketId: basket.id,
					userId: locals.user.id,
					isOwner: false,
					expiresAt: basketAccess[0].expiresAt,
				})

			return {
				success: true,
				message: `You've joined ${owner?.name}'s basket`,
			}
		} catch (error) {
			console.error('Error joining basket:', error)
			if (error instanceof Object && 'status' in error) {
				throw error
			}
			throw fail(500, { error: 'Failed to join basket' })
		}
	}
}
