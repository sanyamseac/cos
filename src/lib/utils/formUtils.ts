/**
 * Utilities for form handling and submission
 */

/**
 * Create a hidden form input element
 */
export function createHiddenInput(name: string, value: string): HTMLInputElement {
	const input = document.createElement('input')
	input.type = 'hidden'
	input.name = name
	input.value = value
	return input
}

/**
 * Submit a form programmatically with form data
 */
export async function submitForm(
	action: string,
	method: string = 'POST',
	data: Record<string, string>,
): Promise<void> {
	const form = document.createElement('form')
	form.method = method
	form.action = action

	// Add form data as hidden inputs
	Object.entries(data).forEach(([name, value]) => {
		form.appendChild(createHiddenInput(name, value))
	})

	document.body.appendChild(form)

	try {
		form.submit()
	} finally {
		document.body.removeChild(form)
	}
}

/**
 * Add item to cart with the specified parameters
 */
export async function addToCart(params: {
	menuItemId: number
	quantity: number
	variantId?: number
	addonIds?: number[]
}): Promise<void> {
	const formData: Record<string, string> = {
		menuItemId: params.menuItemId.toString(),
		quantity: params.quantity.toString(),
	}

	if (params.variantId) {
		formData.variantId = params.variantId.toString()
	}

	if (params.addonIds && params.addonIds.length > 0) {
		params.addonIds.forEach((id, index) => {
			formData[`addonIds[${index}]`] = id.toString()
		})
	}

	await submitForm('?/addToBasket', 'POST', formData)
}
