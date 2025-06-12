/**
 * Utilities for basket operations
 */

import { calculateBasketTotal } from './priceUtils';

export interface Wallet {
    wallet: {
        canteenId: number;
        balance: string;
    };
}

export interface BasketData {
    baskets: any[];
    wallets?: Wallet[];
}

/**
 * Get wallet balance for a specific canteen
 */
export function getWalletBalance(canteenId: number, wallets?: Wallet[]): number {
    if (!wallets) return 0;
    const wallet = wallets.find((w) => w.wallet.canteenId === canteenId);
    return wallet ? parseFloat(wallet.wallet.balance) : 0;
}

/**
 * Check if user has sufficient balance for a basket
 */
export function hasSufficientBalance(
    canteenId: number,
    basketTotal: number,
    wallets?: Wallet[]
): boolean {
    return getWalletBalance(canteenId, wallets) >= basketTotal;
}

/**
 * Check if order can be placed (either sufficient wallet balance for prepaid or postpaid selected)
 */
export function canPlaceOrder(
    canteenId: number,
    basketTotal: number,
    isWalletPayment: boolean,
    wallets?: Wallet[]
): boolean {
    return !isWalletPayment || (isWalletPayment && hasSufficientBalance(canteenId, basketTotal, wallets));
}

/**
 * Get payment method display text
 */
export function getPaymentMethodText(
    canteenId: number,
    basketTotal: number,
    isWalletPayment: boolean,
    wallets?: Wallet[]
): string {
    if (!isWalletPayment) {
        return 'Place Order (Pay Later)';
    }
    return hasSufficientBalance(canteenId, basketTotal, wallets)
        ? 'Place Order (Wallet)'
        : 'Insufficient Balance';
}

/**
 * Calculate grand total across all baskets
 */
export function calculateGrandTotal(baskets: any[]): number {
    return baskets.reduce((total, basket) => total + calculateBasketTotal(basket.items), 0);
}

/**
 * Initialize payment methods for all baskets
 */
export function initializePaymentMethods(baskets: any[]): Record<number, boolean> {
    const paymentMethods: Record<number, boolean> = {};
    baskets.forEach((basket) => {
        paymentMethods[basket.canteen.id] = false;
    });
    return paymentMethods;
}
