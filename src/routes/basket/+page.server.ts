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
		
		// Get basket items for each canteen
		const basketsByCanteen = await Promise.all(
			allCanteens.map(async (canteen) => {
				// Get basket items for this canteen
				const basket = await db
					.select()
					.from(schema.baskets)
					.where(and(eq(schema.baskets.createdBy, event.locals.user!.id), eq(schema.baskets.canteenId, canteen.id)))
					.limit(1)

				if (basket.length === 0) {
					return {
						canteen,
						items: []
					}
				}

				const items = await db
					.select({
						id: schema.basketItems.id,
						quantity: schema.basketItems.quantity,
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
					.where(eq(schema.basketItems.basketId, basket[0].id))

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
						}
					})
				)

				return {
					canteen,
					items: itemsWithAddons
				}
			})
		)

		// Filter out canteens with empty baskets
		const basketsWithItems = basketsByCanteen.filter(basket => basket.items.length > 0)

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
			return fail(500, { error: 'Failed to clear basket' })
		}
	},

	placeOrder: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Not authenticated' })
		}

		const formData = await request.formData()
		const canteenId = Number(formData.get('canteenId'))
		const paymentMethodForm = formData.get('paymentMethod')
		
		// Convert boolean string to boolean - true means wallet, false means postpaid
		const isWalletPayment = paymentMethodForm === 'true'
		const paymentMethod = isWalletPayment ? 'wallet' : 'postpaid'

		if (!canteenId || isNaN(canteenId)) {
			return fail(400, { error: 'Invalid canteen ID' })
		}

		try {
			// Start transaction
			await db.transaction(async (tx) => {
				// Get basket for the canteen
				const basket = await tx
					.select()
					.from(schema.baskets)
					.where(and(eq(schema.baskets.createdBy, locals.user!.id), eq(schema.baskets.canteenId, canteenId)))
					.limit(1)

				if (basket.length === 0) {
					throw new Error('Basket not found')
				}

				// Get basket items with their details
				const basketItems = await tx
					.select({
						id: schema.basketItems.id,
						quantity: schema.basketItems.quantity,
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
					.where(eq(schema.basketItems.basketId, basket[0].id))

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

				// Calculate total amount
				let totalAmount = 0
				for (const item of basketItemsWithAddons) {
					const basePrice = Number(item.menuItem!.price)
					const variantPrice = item.variant ? Number(item.variant.price) : 0
					const addonsPrice = item.addons.reduce((sum, addon) => sum + Number(addon.price), 0)
					totalAmount += (basePrice + variantPrice + addonsPrice) * item.quantity
				}

				// Handle wallet payment validation if prepaid
				let wallet = null
				if (paymentMethod === 'wallet') {
					wallet = await tx
						.select()
						.from(schema.wallets)
						.where(and(eq(schema.wallets.userId, locals.user!.id), eq(schema.wallets.canteenId, canteenId)))
						.limit(1)

					if (wallet.length === 0) {
						throw new Error('Wallet not found')
					}

					const currentBalance = Number(wallet[0].balance)
					if (currentBalance < totalAmount) {
						throw new Error('Insufficient wallet balance')
					}
				}

				// Get and increment order counter for this canteen
				const [canteen] = await tx
					.update(schema.canteens)
					.set({ orderCounter: sql`${schema.canteens.orderCounter} + 1` })
					.where(eq(schema.canteens.id, canteenId))
					.returning({ orderCounter: schema.canteens.orderCounter })

				const orderNumber = canteen.orderCounter.toString()
				const otp = generateId(4) // Generate 4 character OTP using helper function

				// Create order
				const [order] = await tx
					.insert(schema.orders)
					.values({
						orderNumber,
						userId: locals.user!.id,
						canteenId,
						status: 'pending',
						totalAmount: totalAmount.toString(),
						prepaid: paymentMethod === 'wallet',
						otp,
					})
					.returning()

				// Create order items
				for (const basketItem of basketItemsWithAddons) {
					const basePrice = Number(basketItem.menuItem!.price)
					const variantPrice = basketItem.variant ? Number(basketItem.variant.price) : 0
					const addonsPrice = basketItem.addons.reduce((sum, addon) => sum + Number(addon.price), 0)
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

				// Handle wallet deduction only for prepaid orders
				if (paymentMethod === 'wallet' && wallet && wallet.length > 0) {
					const currentBalance = Number(wallet[0].balance)
					const newBalance = currentBalance - totalAmount
					
					await tx
						.update(schema.wallets)
						.set({ 
							balance: newBalance.toString(),
							updatedAt: new Date()
						})
						.where(eq(schema.wallets.id, wallet[0].id))

					// Create wallet transaction
					await tx.insert(schema.walletTransactions).values({
						walletId: wallet[0].id,
						amount: (-totalAmount).toString(),
						reference: `Order ${orderNumber}`,
						performedBy: locals.user!.id,
					})
				}

				await tx.delete(schema.baskets).where(eq(schema.baskets.id, basket[0].id))
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
	}
}
