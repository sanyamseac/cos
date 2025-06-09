import { generateRandomString } from '@oslojs/crypto/random'

const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_'

export function generateId(length = 21): string {
	return generateRandomString(
		{ read: (bytes) => crypto.getRandomValues(bytes) },
		alphabet,
		length,
	)
}

export function getRandomDefaultAvatar(): string {
	const avatarNumber = Math.floor(Math.random() * 8) + 1
	return `/content/avatars/avatar-${avatarNumber}.svg`
}
