import { pgTable, text, timestamp, integer, boolean, numeric } from 'drizzle-orm/pg-core'

export const user = pgTable('user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	role: text('role').notNull().default('consumer'),
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
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	p256dh: text('p256dh').notNull(),
	auth: text('auth').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const canteens = pgTable('canteens', {
	id: integer('id').primaryKey(),
	name: text('name').notNull(),
	timings: text('timings').notNull(),
})

export const menuItems = pgTable('menu_items', {
	id: integer('id').primaryKey(),
	canteenId: integer('canteenid')
		.notNull()
		.references(() => canteens.id, { onDelete: 'cascade' }),
	category: text('category').notNull(),
	name: text('name').notNull(),
	price: numeric('price', { precision: 10, scale: 2 }).notNull(),
	isAvailable: boolean('is_available').notNull().default(true),
	isNonVeg: boolean('is_nonveg').notNull().default(false),
})

export type Session = typeof session.$inferSelect
export type User = typeof user.$inferSelect
export type Canteen = typeof canteens.$inferSelect
export type MenuItem = typeof menuItems.$inferSelect
export type PushSubscription = typeof pushSubscriptionsTable.$inferSelect
