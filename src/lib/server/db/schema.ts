import { pgTable, text, timestamp, integer, boolean, numeric, unique } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

export const user = pgTable('user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	role: text('role').notNull().default('consumer'),
	profilePicture: text('profile_picture'),
	emailPreference: text('email_preference').notNull().default('important'),
	profileVisibility: text('profile_visibility').notNull().default('private'),
	OrderingAllowed: boolean('ordering_allowed').notNull().default(true),
})

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	expiresAt: timestamp('expires_at').notNull(),
})

export const pushSubscriptionsTable = pgTable('push_subscriptions', {
	endpoint: text('endpoint').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	p256dh: text('p256dh').notNull(),
	auth: text('auth').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const canteens = pgTable('canteens', {
	id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
	name: text('name').notNull(),
	acronym: text('acronym').notNull().unique(),
	description: text('description').notNull(),
	image: text('image').notNull(),
	timings: text('timings').notNull(),
	open: boolean('is_open').notNull().default(true),
	active: boolean('active').notNull().default(true),
	orderCounter: integer('order_counter').notNull().default(0),
})

export const canteenAuth = pgTable('canteen_auth', {
	id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
	canteenId: integer('canteen_id')
		.notNull()
		.references(() => canteens.id, { onDelete: 'cascade' })
		.unique(),
	passwordHash: text('password_hash').notNull(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const menuItems = pgTable('menu_items', {
	id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
	canteenId: integer('canteenid')
		.notNull()
		.references(() => canteens.id, { onDelete: 'cascade' }),
	category: text('category').notNull(),
	name: text('name').notNull(),
	description: text('description'),
	price: numeric('price', { precision: 10, scale: 2 }).notNull(),
	available: boolean('is_available').notNull().default(true),
	type: text('type').notNull().default('veg'),
	active: boolean('active').notNull().default(true),
	image: text('image'),
})

export const variants = pgTable('variants', {
	id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
	name: text('name').notNull(),
	price: numeric('price', { precision: 10, scale: 2 }).notNull(),
	itemId: integer('item_id')
		.notNull()
		.references(() => menuItems.id, { onDelete: 'cascade' }),
	active: boolean('active').notNull().default(true),
	available: boolean('available').notNull().default(true),
})

export const addons = pgTable('addons', {
	id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
	name: text('name').notNull(),
	price: numeric('price', { precision: 10, scale: 2 }).notNull(),
	itemId: integer('item_id')
		.notNull()
		.references(() => menuItems.id, { onDelete: 'cascade' }),
	type: text('type').notNull().default('veg'),
	active: boolean('active').notNull().default(true),
	available: boolean('available').notNull().default(true),
})

export const baskets = pgTable('baskets', {
	id: text('id').primaryKey(),
	name: text('name'),
	canteenId: integer('canteen_id')
		.notNull()
		.references(() => canteens.id, { onDelete: 'cascade' }),
	createdBy: text('created_by')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
	basketAccessCode: text('basket_access_code'),
})

export const basketItems = pgTable('basket_items', {
	id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
	basketId: text('basket_id')
		.notNull()
		.references(() => baskets.id, { onDelete: 'cascade' }),
	menuItemId: integer('menu_item_id')
		.notNull()
		.references(() => menuItems.id, { onDelete: 'cascade' }),
	variantId: integer('variant_id').references(() => variants.id, { onDelete: 'cascade' }),
	quantity: integer('quantity').notNull().default(1),
	addedBy: text('added_by')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
})

export const basketAddons = pgTable('basket_addons', {
	id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
	basketItemId: integer('basket_item_id')
		.notNull()
		.references(() => basketItems.id, { onDelete: 'cascade' }),
	addonId: integer('addon_id')
		.notNull()
		.references(() => addons.id, { onDelete: 'cascade' }),
})

export const orders = pgTable('orders', {
	id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
	orderNumber: text('order_number').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	canteenId: integer('canteen_id')
		.notNull()
		.references(() => canteens.id, { onDelete: 'cascade' }),
	status: text('status').notNull().default('pending'), // pending, confirmed, preparing, ready, completed, cancelled
	totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
	notes: text('notes'),
	prepaid: boolean('prepaid').notNull().default(false),
	linked: boolean('linked').notNull().default(false),
	linkingNumber: text('linking_number'),
	otp: text('otp').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	confirmedAt: timestamp('confirmed_at'),
	preparedAt: timestamp('prepared_at'),
	readyAt: timestamp('ready_at'),
	completedAt: timestamp('completed_at'),
	cancelledAt: timestamp('cancelled_at'),
	cancelledBy: text('cancelled_by').references(() => user.id, { onDelete: 'set null' }),
})

export const orderItems = pgTable('order_items', {
	id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
	orderId: integer('order_id')
		.notNull()
		.references(() => orders.id, { onDelete: 'cascade' }),
	menuItemId: integer('menu_item_id')
		.notNull()
		.references(() => menuItems.id, { onDelete: 'cascade' }),
	variantId: integer('variant_id').references(() => variants.id, { onDelete: 'cascade' }),
	quantity: integer('quantity').notNull().default(1),
	unitPrice: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
	variantPrice: numeric('variant_price', { precision: 10, scale: 2 }).default('0.00'),
	subtotal: numeric('subtotal', { precision: 10, scale: 2 }).notNull(), // (unitPrice + variantPrice + addons) * quantity
})

export const orderAddons = pgTable('order_addons', {
	id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
	orderItemId: integer('order_item_id')
		.notNull()
		.references(() => orderItems.id, { onDelete: 'cascade' }),
	addonId: integer('addon_id')
		.notNull()
		.references(() => addons.id, { onDelete: 'cascade' }),
	unitPrice: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
})

export const wallets = pgTable('wallets', {
	id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	canteenId: integer('canteen_id')
		.notNull()
		.references(() => canteens.id, { onDelete: 'cascade' }),
	balance: numeric('balance', { precision: 10, scale: 2 }).notNull().default('0.00'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const walletTransactions = pgTable('wallet_transactions', {
	id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
	walletId: integer('wallet_id')
		.notNull()
		.references(() => wallets.id, { onDelete: 'cascade' }),
	amount: numeric('amount', { precision: 10, scale: 2 }).notNull(), // positive for credit, negative for debit
	reference: text('reference'), // Order ID, admin reference, etc.
	performedBy: text('performed_by')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at').notNull().defaultNow(),
})

export type Session = typeof session.$inferSelect
export type User = typeof user.$inferSelect
export type Canteen = typeof canteens.$inferSelect
export type CanteenAuth = typeof canteenAuth.$inferSelect
export type MenuItem = typeof menuItems.$inferSelect
export type PushSubscription = typeof pushSubscriptionsTable.$inferSelect
export type Variant = typeof variants.$inferSelect
export type Addon = typeof addons.$inferSelect
export type Basket = typeof baskets.$inferSelect
export type BasketItem = typeof basketItems.$inferSelect
export type BasketAddon = typeof basketAddons.$inferSelect
export type Order = typeof orders.$inferSelect
export type OrderItem = typeof orderItems.$inferSelect
export type OrderAddon = typeof orderAddons.$inferSelect
export type Wallet = typeof wallets.$inferSelect
export type WalletTransaction = typeof walletTransactions.$inferSelect
