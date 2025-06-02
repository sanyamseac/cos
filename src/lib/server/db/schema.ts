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

export const canteens = pgTable('canteens', {
	id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
	name: text('name').notNull(),
	timings: text('timings').notNull(),
	is_open: boolean('is_open').notNull().default(true),
})

export const menuItems = pgTable('menu_items', {
	id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
	canteenId: integer('canteenid')
		.notNull()
		.references(() => canteens.id, { onDelete: 'cascade' }),
	category: text('category').notNull(),
	name: text('name').notNull(),
	price: numeric('price', { precision: 10, scale: 2 }).notNull(),
	isAvailable: boolean('is_available').notNull().default(true),
	isNonVeg: boolean('is_nonveg').notNull().default(false),
})

export const variants = pgTable('variants', {
	id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
	name: text('name').notNull(),
	price: numeric('price', { precision: 10, scale: 2 }).notNull(),
	itemId: integer('item_id')
		.notNull()
		.references(() => menuItems.id, { onDelete: 'cascade' }),
})

export const addons = pgTable('addons', {
	id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
	name: text('name').notNull(),
	price: numeric('price', { precision: 10, scale: 2 }).notNull(),
	itemId: integer('item_id')
		.notNull()
		.references(() => menuItems.id, { onDelete: 'cascade' }),
})

export type Session = typeof session.$inferSelect
export type User = typeof user.$inferSelect
export type Canteen = typeof canteens.$inferSelect
export type MenuItem = typeof menuItems.$inferSelect
export type Variant = typeof variants.$inferSelect
export type Addon = typeof addons.$inferSelect
