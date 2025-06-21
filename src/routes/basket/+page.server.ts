import { redirect, fail, error } from '@sveltejs/kit'
import * as auth from '$lib/server/session'
import type { PageServerLoad, Actions } from './$types'
import { db } from '$lib/server/db'
import * as schema from '$lib/server/db/schema'
import { eq, and, sql, or, not, inArray } from 'drizzle-orm'
import { generateId } from '$lib/helper'
import { sendToUser, type NotificationPayload } from '$lib/server/notificationService'
import { sendEmail } from '$lib/server/emailService'
import { emitNewOrderToCanteen } from '$lib/server/sse-events'

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user)
		return redirect(302, `/login?redirect=${encodeURIComponent(event.url.href)}`)

	// Redirect canteens to their dashboard
	if (event.locals.user.role === 'canteen') {
		return redirect(302, '/canteen/dashboard')
	}

	if (!auth.CONSUMER.includes(event.locals.user.role)) throw error(403, 'Access denied')

	try {
		const userBaskets = await db
			.select({
				basket: schema.baskets,
				canteen: schema.canteens,
			})
			.from(schema.baskets)
			.leftJoin(schema.canteens, eq(schema.baskets.canteenId, schema.canteens.id))
			.where(eq(schema.baskets.createdBy, event.locals.user.id))

		const userAccessCodes = userBaskets
			.map((b) => b.basket.basketAccessCode)
			.filter((code): code is string => code !== null)

		let sharedBaskets: typeof userBaskets = []
		if (userAccessCodes.length > 0) {
			sharedBaskets = await db
				.select({
					basket: schema.baskets,
					canteen: schema.canteens,
				})
				.from(schema.baskets)
				.leftJoin(schema.canteens, eq(schema.baskets.canteenId, schema.canteens.id))
				.where(
					and(
						sql`${schema.baskets.basketAccessCode} IS NOT NULL`,
						sql`${schema.baskets.basketAccessCode} IN (${sql.join(
							userAccessCodes.map((code) => sql`${code}`),
							sql`, `,
						)})`,
						not(eq(schema.baskets.createdBy, event.locals.user.id)),
					),
				)
		}

		const allBaskets = [...userBaskets, ...sharedBaskets]

		const basketsWithDetails = await Promise.all(
			allBaskets.map(async (basketData) => {
				const { basket, canteen } = basketData
				if (!basket || !canteen) return null

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
							image: schema.menuItems.image,
							available: schema.menuItems.available,
						},
						variant: {
							id: schema.variants.id,
							name: schema.variants.name,
							price: schema.variants.price,
							available: schema.variants.available,
						},
					})
					.from(schema.basketItems)
					.leftJoin(
						schema.menuItems,
						eq(schema.basketItems.menuItemId, schema.menuItems.id),
					)
					.leftJoin(schema.variants, eq(schema.basketItems.variantId, schema.variants.id))
					.leftJoin(schema.user, eq(schema.basketItems.addedBy, schema.user.id))
					.where(eq(schema.basketItems.basketId, basket.id))

				const itemsWithAddons = await Promise.all(
					items.map(async (item) => {
						const itemAddons = await db
							.select({
								id: schema.addons.id,
								name: schema.addons.name,
								price: schema.addons.price,
								type: schema.addons.type,
								available: schema.addons.available,
							})
							.from(schema.basketAddons)
							.leftJoin(
								schema.addons,
								eq(schema.basketAddons.addonId, schema.addons.id),
							)
							.where(eq(schema.basketAddons.basketItemId, item.id))

						return {
							...item,
							addons: itemAddons,
							canEdit: item.addedBy === event.locals.user.id,
						}
					}),
				)

				return {
					canteen,
					basket: basket,
					items: itemsWithAddons,
					accessCode: basket.basketAccessCode,
				}
			}),
		)

		const validBaskets = basketsWithDetails
			.filter((basket): basket is NonNullable<typeof basket> => basket !== null)
			.filter((basket) => basket.items.length > 0)

		const basketsByCanteen = validBaskets.reduce(
			(grouped, basket) => {
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
						isShared: !!basket.accessCode,
					}
				}

				grouped[canteenId][accessCode].baskets.push(basket)
				return grouped
			},
			{} as Record<number, Record<string, any>>,
		)

		const finalBaskets = Object.values(basketsByCanteen).flatMap((canteenGroups) =>
			Object.values(canteenGroups),
		)

		const wallets = await db
			.select({
				id: schema.wallets.id,
				balance: schema.wallets.balance,
				canteenId: schema.wallets.canteenId,
			})
			.from(schema.wallets)
			.where(eq(schema.wallets.userId, event.locals.user.id))

		return {
			user: event.locals.user,
			basketsByCanteen: finalBaskets,
			wallets,
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
				await db
					.delete(schema.basketItems)
					.where(
						and(
							eq(schema.basketItems.id, basketItemId),
							eq(schema.basketItems.addedBy, locals.user.id),
						),
					)
			} else {
				await db
					.update(schema.basketItems)
					.set({ quantity })
					.where(
						and(
							eq(schema.basketItems.id, basketItemId),
							eq(schema.basketItems.addedBy, locals.user.id),
						),
					)
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
				.where(
					and(
						eq(schema.basketItems.id, basketItemId),
						eq(schema.basketItems.addedBy, locals.user.id),
					),
				)
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
			const userBasket = await db
				.select()
				.from(schema.baskets)
				.where(
					and(
						eq(schema.baskets.createdBy, locals.user.id),
						eq(schema.baskets.canteenId, canteenId),
					),
				)
				.limit(1)

			if (userBasket.length === 0) {
				return fail(404, { error: 'Basket not found' })
			}

			await db
				.delete(schema.basketItems)
				.where(
					and(
						eq(schema.basketItems.basketId, userBasket[0].id),
						eq(schema.basketItems.addedBy, locals.user.id),
					),
				)

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
				let baskets
				if (accessCode && accessCode !== 'individual') {
					baskets = await tx
						.select()
						.from(schema.baskets)
						.where(
							and(
								eq(schema.baskets.canteenId, canteenId),
								eq(schema.baskets.basketAccessCode, accessCode),
							),
						)
				} else {
					baskets = await tx
						.select()
						.from(schema.baskets)
						.where(
							and(
								eq(schema.baskets.createdBy, locals.user.id),
								eq(schema.baskets.canteenId, canteenId),
							),
						)
				}

				if (baskets.length === 0) {
					throw new Error('No baskets found')
				}

				let hasAccess = baskets.some((b) => b.createdBy === locals.user.id)

				if (!hasAccess) {
					throw new Error('You do not have access to place orders for this basket')
				}

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
						.leftJoin(
							schema.menuItems,
							eq(schema.basketItems.menuItemId, schema.menuItems.id),
						)
						.leftJoin(
							schema.variants,
							eq(schema.basketItems.variantId, schema.variants.id),
						)
						.where(eq(schema.basketItems.basketId, basket.id))

					allBasketItems.push(...items)
				}

				if (allBasketItems.length === 0) {
					throw new Error('No items in basket')
				}

				const itemsWithAddons = await Promise.all(
					allBasketItems.map(async (item) => {
						const addons = await tx
							.select({
								id: schema.addons.id,
								name: schema.addons.name,
								price: schema.addons.price,
							})
							.from(schema.basketAddons)
							.leftJoin(
								schema.addons,
								eq(schema.basketAddons.addonId, schema.addons.id),
							)
							.where(eq(schema.basketAddons.basketItemId, item.id))

						return { ...item, addons: addons.filter((addon) => addon.id) }
					}),
				)

				const itemsByUser = itemsWithAddons.reduce((groups: any, item) => {
					const userId = item.addedBy
					if (!groups[userId]) {
						groups[userId] = []
					}
					groups[userId].push(item)
					return groups
				}, {})

				const isSharedBasket = baskets.length > 1
				const linkingNumber = isSharedBasket ? generateId() : null
				let userWallet = null
				if (paymentMethod === 'wallet') {
					userWallet = await tx
						.select()
						.from(schema.wallets)
						.where(
							and(
								eq(schema.wallets.userId, locals.user.id),
								eq(schema.wallets.canteenId, canteenId),
							),
						)
						.limit(1)

					if (userWallet.length === 0) {
						throw new Error('Wallet not found')
					}

					let totalAmount = 0
					for (const item of itemsWithAddons) {
						const basePrice = Number(item.menuItem!.price)
						const variantPrice = item.variant ? Number(item.variant.price) : 0
						const addonsPrice = item.addons.reduce(
							(sum, addon) => sum + Number(addon.price),
							0,
						)
						totalAmount += (basePrice + variantPrice + addonsPrice) * item.quantity
					}

					const currentBalance = Number(userWallet[0].balance)
					if (currentBalance < totalAmount) {
						throw new Error('Insufficient wallet balance')
					}
				}

				const createdOrders = []
				for (const [userId, userItems] of Object.entries(itemsByUser)) {
					let userTotal = 0
					for (const item of userItems as any[]) {
						const basePrice = Number(item.menuItem!.price)
						const variantPrice = item.variant ? Number(item.variant.price) : 0
						const addonsPrice = item.addons.reduce(
							(sum: number, addon: any) => sum + Number(addon.price),
							0,
						)
						userTotal += (basePrice + variantPrice + addonsPrice) * item.quantity
					}

					const [canteen] = await tx
						.update(schema.canteens)
						.set({ orderCounter: sql`${schema.canteens.orderCounter} + 1` })
						.where(eq(schema.canteens.id, canteenId))
						.returning({
							orderCounter: schema.canteens.orderCounter,
							acronym: schema.canteens.acronym,
						})

					const orderNumber =
						canteen.acronym.toUpperCase() + '-' + canteen.orderCounter.toString()
					const otp = generateId(4)

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

					// Emit SSE event for new order to canteen staff
					try {
						emitNewOrderToCanteen({
							id: order.id.toString(),
							orderNumber: order.orderNumber,
							canteenId: canteenId.toString(),
							userId: userId,
							totalAmount: userTotal.toString(),
						})
					} catch (sseError) {
						console.error('Failed to emit new order SSE event:', sseError)
					}

					for (const basketItem of userItems as any[]) {
						const basePrice = Number(basketItem.menuItem!.price)
						const variantPrice = basketItem.variant
							? Number(basketItem.variant.price)
							: 0
						const addonsPrice = basketItem.addons.reduce(
							(sum: number, addon: any) => sum + Number(addon.price),
							0,
						)
						const subtotal =
							(basePrice + variantPrice + addonsPrice) * basketItem.quantity

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

						for (const addon of basketItem.addons) {
							await tx.insert(schema.orderAddons).values({
								orderItemId: orderItem.id,
								addonId: addon.id!,
								unitPrice: Number(addon.price).toString(),
							})
						}
					}
				}
				if (paymentMethod === 'wallet' && userWallet && userWallet.length > 0) {
					const totalAmount = createdOrders.reduce(
						(sum, order) => sum + order.userTotal,
						0,
					)
					const currentBalance = Number(userWallet[0].balance)
					const newBalance = currentBalance - totalAmount

					await tx
						.update(schema.wallets)
						.set({
							balance: newBalance.toString(),
							updatedAt: new Date(),
						})
						.where(eq(schema.wallets.id, userWallet[0].id))

					await tx.insert(schema.walletTransactions).values({
						walletId: userWallet[0].id,
						amount: (-totalAmount).toString(),
						reference: `Group Order ${linkingNumber || createdOrders[0].order.orderNumber}`,
						performedBy: locals.user!.id,
					})
				}

				for (const basket of baskets) {
					await tx.delete(schema.baskets).where(eq(schema.baskets.id, basket.id))
				}

				const affectedUserIds = [
					...new Set(createdOrders.map((order) => order.order.userId)),
				]
				const affectedUsers = await tx
					.select()
					.from(schema.user)
					.where(inArray(schema.user.id, affectedUserIds))

				const [canteenInfo] = await tx
					.select({
						name: schema.canteens.name,
						acronym: schema.canteens.acronym,
					})
					.from(schema.canteens)
					.where(eq(schema.canteens.id, canteenId))

				for (const user of affectedUsers) {
					const userOrder = createdOrders.find((order) => order.order.userId === user.id)
					if (!userOrder) continue

					const { order, userTotal } = userOrder
					const isSharedOrder = isSharedBasket && affectedUsers.length > 1

					// Send push notification (always send)
					const notificationPayload: NotificationPayload = {
						title: 'Order Placed Successfully',
						body: isSharedOrder
							? `Your shared order ${order.orderNumber} at ${canteenInfo.name} has been placed. Total: RM${userTotal.toFixed(2)}`
							: `Your order ${order.orderNumber} at ${canteenInfo.name} has been placed. Total: RM${userTotal.toFixed(2)}`,
						data: {
							type: 'order_placed',
							orderId: order.id.toString(),
							orderNumber: order.orderNumber,
							canteenId: canteenId.toString(),
						},
					}

					try {
						sendToUser(user.id, notificationPayload)
					} catch (notifError) {
						console.error(
							`Failed to send push notification to user ${user.id}:`,
							notifError,
						)
					}

					const emailSubject = isSharedOrder
						? `Shared Order Placed - ${order.orderNumber}`
						: `Order Placed - ${order.orderNumber}`

					const emailBody = `
						<h2>Order Confirmation</h2>
						<p>Hi ${user.name},</p>
						<p>${isSharedOrder ? 'Your shared order' : 'Your order'} has been successfully placed!</p>
						
						<div style="background-color: #f5f5f5; padding: 15px; margin: 15px 0; border-radius: 5px;">
							<h3>Order Details:</h3>
							<p><strong>Order Number:</strong> ${order.orderNumber}</p>
							<p><strong>Canteen:</strong> ${canteenInfo.name}</p>
							<p><strong>Total Amount:</strong> RM${userTotal.toFixed(2)}</p>
							<p><strong>Payment Method:</strong> ${paymentMethod === 'wallet' ? 'Wallet' : 'Postpaid'}</p>
							<p><strong>OTP:</strong> ${order.otp}</p>
							${isSharedOrder ? `<p><strong>Group Order ID:</strong> ${linkingNumber}</p>` : ''}
						</div>
						
						<p>You can track your order status in the app.</p>
						<p>Thank you for your order!</p>
					`

					try {
						sendEmail(user, {
							subject: emailSubject,
							plainText: `Order Confirmation - ${order.orderNumber}\n\nHi ${user.name},\n\n${isSharedOrder ? 'Your shared order' : 'Your order'} has been successfully placed!\n\nOrder Details:\nOrder Number: ${order.orderNumber}\nCanteen: ${canteenInfo.name}\nTotal Amount: RM${userTotal.toFixed(2)}\nPayment Method: ${paymentMethod === 'wallet' ? 'Wallet' : 'Postpaid'}\nOTP: ${order.otp}${isSharedOrder ? `\nGroup Order ID: ${linkingNumber}` : ''}\n\nYou can track your order status in the app.\nThank you for your order!`,
							html: emailBody,
						})
					} catch (emailError) {
						console.error(`Failed to send email to user ${user.id}:`, emailError)
					}
				}
			})

			return {
				success: true,
				message: 'Order placed successfully!',
				redirect: '/orders',
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
			let basket = await db
				.select()
				.from(schema.baskets)
				.where(
					and(
						eq(schema.baskets.createdBy, locals.user.id),
						eq(schema.baskets.canteenId, canteenId),
					),
				)
				.limit(1)

			if (basket.length === 0) {
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

			const accessCode = generateId(8).toUpperCase()

			await db
				.update(schema.baskets)
				.set({
					basketAccessCode: accessCode,
					updatedAt: new Date(),
				})
				.where(eq(schema.baskets.id, basket[0].id))

			return {
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
			const sharedBasket = await db
				.select({
					basket: schema.baskets,
					owner: {
						id: schema.user.id,
						name: schema.user.name,
					},
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

			if (basket.createdBy === locals.user.id) {
				return fail(400, { error: 'You cannot join your own basket' })
			}

			let userBasket = await db
				.select()
				.from(schema.baskets)
				.where(
					and(
						eq(schema.baskets.createdBy, locals.user.id),
						eq(schema.baskets.canteenId, canteenId),
					),
				)
				.limit(1)

			if (userBasket.length === 0) {
				const [newBasket] = await db
					.insert(schema.baskets)
					.values({
						id: generateId(),
						createdBy: locals.user.id,
						canteenId: canteenId,
						basketAccessCode: accessCode.toUpperCase(),
					})
					.returning()
				userBasket = [newBasket]
			} else {
				await db
					.update(schema.baskets)
					.set({
						basketAccessCode: accessCode.toUpperCase(),
						updatedAt: new Date(),
					})
					.where(eq(schema.baskets.id, userBasket[0].id))
			}

			return {
				success: true,
				message: `Successfully joined ${owner?.name}'s basket!`,
				ownerName: owner?.name,
			}
		} catch (error) {
			console.error('Error joining basket:', error)
			return fail(500, { error: 'Failed to join basket' })
		}
	},

	leaveBasket: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Not authenticated' })
		}

		const formData = await request.formData()
		const canteenId = Number(formData.get('canteenId'))

		if (!canteenId || isNaN(canteenId)) {
			return fail(400, { error: 'Invalid canteen ID' })
		}

		try {
			const userBasket = await db
				.select()
				.from(schema.baskets)
				.where(
					and(
						eq(schema.baskets.createdBy, locals.user.id),
						eq(schema.baskets.canteenId, canteenId),
					),
				)
				.limit(1)

			if (userBasket.length === 0) {
				return fail(404, { error: 'Basket not found' })
			}

			await db
				.update(schema.baskets)
				.set({
					basketAccessCode: null,
					updatedAt: new Date(),
				})
				.where(eq(schema.baskets.id, userBasket[0].id))

			return { success: true }
		} catch (error) {
			console.error('Error leaving basket:', error)
			return fail(500, { error: 'Failed to leave basket' })
		}
	},
}
