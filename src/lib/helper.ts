import { generateRandomString } from '@oslojs/crypto/random'

const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_'

export function generateUserId(length = 21): string {
	return generateRandomString(
		{ read: (bytes) => crypto.getRandomValues(bytes) },
		alphabet,
		length,
	)
}
