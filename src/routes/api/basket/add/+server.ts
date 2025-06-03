import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

// This is a mock endpoint for adding items to the basket
// In a real implementation, this would interact with a database
export const POST: RequestHandler = async ({ request, locals }) => {
	// Check authentication
	if (!locals.user) {
		return json({ success: false, message: 'Not authenticated' }, { status: 401 })
	}

	try {
		const item = await request.json()

		// Log the item being added to the cart for debugging
		console.log('Adding item to cart:', item)

		// Simulate processing time
		await new Promise((resolve) => setTimeout(resolve, 500))

		// Return a success response
		return json({
			success: true,
			message: 'Item added to basket successfully',
		})
	} catch (error) {
		console.error('Error adding item to basket:', error)
		return json({ success: false, message: 'Failed to add item to basket' }, { status: 500 })
	}
}
