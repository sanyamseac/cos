// VAPID public key endpoint
import type { RequestHandler } from './$types'
import { env } from '$env/dynamic/private'

if (!env.VAPID_PUBLIC_KEY) {
    throw new Error('VAPID public key is not set in environment variables')
}
const VAPID_PUBLIC_KEY = env.VAPID_PUBLIC_KEY
export const GET: RequestHandler = async () => {
	return new Response(JSON.stringify({
		publicKey: VAPID_PUBLIC_KEY
	}), {
		headers: {
			'Content-Type': 'application/json'
		}
	})
}
