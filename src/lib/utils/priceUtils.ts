/**
 * Utilities for price calculations and formatting
 */

export interface PriceableItem {
    price: number | string;
}

export interface MenuItemWithAddons extends PriceableItem {
    variant?: PriceableItem | null;
    addons?: PriceableItem[];
}

export interface BasketItem extends MenuItemWithAddons {
    quantity: number;
    menuItem?: PriceableItem;
}

/**
 * Format a price as currency
 */
export function formatPrice(price: number | string, precision : number = 2): string {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return `₹${numPrice.toFixed(precision)}`;
}

/**
 * Calculate the total price for a menu item with variants and addons
 */
export function calculateItemPrice(item: MenuItemWithAddons, quantity: number = 1): number {
    const basePrice = Number(item.price);
    const variantPrice = item.variant ? Number(item.variant.price) : 0;
    const addonsPrice = item.addons?.reduce(
        (sum, addon) => sum + Number(addon.price), 0
    ) || 0;

    return (basePrice + variantPrice + addonsPrice) * quantity;
}

/**
 * Calculate the total price for a basket item
 */
export function calculateBasketItemTotal(item: BasketItem): number {
    if (!item.menuItem) return 0;

    const basePrice = Number(item.menuItem.price);
    const variantPrice = item.variant ? Number(item.variant.price) : 0;
    const addonsPrice = item.addons?.reduce(
        (sum, addon) => sum + Number(addon.price), 0
    ) || 0;

    return (basePrice + variantPrice + addonsPrice) * item.quantity;
}

/**
 * Calculate the total for multiple basket items
 */
export function calculateBasketTotal(items: BasketItem[]): number {
    return items.reduce((total, item) => total + calculateBasketItemTotal(item), 0);
}
