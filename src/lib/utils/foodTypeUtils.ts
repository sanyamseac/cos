/**
 * Utilities for handling food type information
 */

export type FoodType = 'veg' | 'non-veg' | 'egg'

/**
 * Get the appropriate icon for a food type
 */
export function getFoodTypeIcon(type: string): string {
	if (type === 'veg') return '🟢'
	if (type === 'non-veg') return '🔴'
	if (type === 'egg') return '🟠'
	return ''
}

/**
 * Get the color class for a food type
 */
export function getFoodTypeColor(type: string): string {
	if (type === 'veg') return 'text-green-600'
	if (type === 'non-veg') return 'text-red-600'
	if (type === 'egg') return 'text-orange-600'
	return 'text-gray-600'
}

/**
 * Get the display name for a food type
 */
export function getFoodTypeDisplayName(type: string): string {
	if (type === 'veg') return 'Vegetarian'
	if (type === 'non-veg') return 'Non-Vegetarian'
	if (type === 'egg') return 'Contains Egg'
	return 'Unknown'
}
