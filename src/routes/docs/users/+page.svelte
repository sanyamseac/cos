<svelte:head>
	<title>User Documentation - COS</title>
</svelte:head>

<section id="users" class="mb-12 scroll-mt-4">
    <h2 class="text-3xl font-bold mb-6 dark:text-white">For Users (Consumers)</h2>

    <div class="space-y-6">
        <div>
            <h3 class="text-2xl font-semibold mb-3 dark:text-white">Getting Started</h3>
            <ol class="list-decimal ml-6 space-y-2 text-gray-700 dark:text-gray-300">
                <li>Log in using your institutional credentials</li>
                <li>Browse available canteens and their menus</li>
                <li>Add items to your basket with desired variants and addons</li>
                <li>Proceed to checkout and place your order</li>
                <li>Track your order status in real-time from the Orders page</li>
            </ol>
        </div>

        <div>
            <h3 class="text-2xl font-semibold mb-3 dark:text-white">Browsing Menus</h3>
            <p class="text-gray-700 dark:text-gray-300 mb-2">
                Navigate to the Menu section to view all available canteens. Each canteen displays:
            </p>
            <ul class="list-disc ml-6 space-y-1 text-gray-700 dark:text-gray-300">
                <li>Operating hours and current status (open/closed)</li>
                <li>Available menu items with descriptions and prices</li>
                <li>Item variants (e.g., sizes, flavors)</li>
                <li>Optional addons and customizations</li>
                <li>Dietary information and food type indicators</li>
            </ul>
        </div>

        <div>
            <h3 class="text-2xl font-semibold mb-3 dark:text-white">Placing Orders</h3>
            <p class="text-gray-700 dark:text-gray-300 mb-2">
                There are two ways to place orders:
            </p>
            <div class="ml-6 space-y-3">
                <div>
                    <h4 class="font-semibold text-gray-900 dark:text-white">Individual Orders</h4>
                    <p class="text-gray-700 dark:text-gray-300">
                        Add items to your basket, set a pickup time, and complete the order. You'll
                        receive notifications as your order is prepared.
                    </p>
                </div>
                <div>
                    <h4 class="font-semibold text-gray-900 dark:text-white">Shared Baskets</h4>
                    <p class="text-gray-700 dark:text-gray-300">
                        Create a shared basket and invite others using a shareable link. Everyone can
                        add their items, and the basket creator confirms the final order. Perfect for
                        group lunches!
                    </p>
                </div>
            </div>
        </div>

        <div>
            <h3 class="text-2xl font-semibold mb-3 dark:text-white">Managing Your Account</h3>
            <ul class="list-disc ml-6 space-y-1 text-gray-700 dark:text-gray-300">
                <li>View your profile and update personal information</li>
                <li>Check your order history and transaction records</li>
                <li>Manage notification preferences</li>
                <li>View your account balance and add funds</li>
            </ul>
        </div>

        <div>
            <h3 class="text-2xl font-semibold mb-3 dark:text-white">Notifications</h3>
            <p class="text-gray-700 dark:text-gray-300 mb-2">
                Stay informed about your orders through multiple channels:
            </p>
            <ul class="list-disc ml-6 space-y-1 text-gray-700 dark:text-gray-300">
                <li>In-app notifications for order status changes</li>
                <li>Web push notifications (requires permission)</li>
                <li>Email notifications for important updates</li>
                <li>Real-time updates on the Orders page via SSE</li>
            </ul>
        </div>

        <div>
            <h3 class="text-2xl font-semibold mb-3 dark:text-white">User Workflow: Getting Your First Order</h3>
            <p class="text-gray-700 dark:text-gray-300 mb-4">
                Here's a typical workflow for new users to complete their first order:
            </p>
            
            <div class="space-y-4">
                <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50 rounded-lg p-4">
                    <h4 class="font-semibold text-blue-900 dark:text-blue-300 mb-2">Step 1: Account Setup (First Time Only)</h4>
                    <ol class="list-decimal ml-6 space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                        <li>You'll receive login credentials from your institution's administrator</li>
                        <li>Visit the login page and enter your username and temporary password</li>
                        <li>Go to your Profile page immediately after login</li>
                        <li>Change your password to something you remember</li>
                        <li>Verify your contact information is correct</li>
                        <li>Optional: Enable web push notifications for real-time order updates</li>
                    </ol>
                </div>

                <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50 rounded-lg p-4">
                    <h4 class="font-semibold text-green-900 dark:text-green-300 mb-2">Step 2: Browse & Select Items</h4>
                    <ol class="list-decimal ml-6 space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                        <li>Navigate to the Menu section from the main menu</li>
                        <li>View all available canteens and their operating hours</li>
                        <li>Click on a canteen to view its menu items</li>
                        <li>Read item descriptions, prices, and any dietary information</li>
                        <li>Choose an item and select any variants (e.g., size) or addons</li>
                        <li>Confirm the price and add to basket</li>
                    </ol>
                </div>

                <div class="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-900/50 rounded-lg p-4">
                    <h4 class="font-semibold text-purple-900 dark:text-purple-300 mb-2">Step 3: Place Your Order</h4>
                    <ol class="list-decimal ml-6 space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                        <li>Review your basket to ensure items are correct</li>
                        <li>Set your preferred pickup time</li>
                        <li>Check the total amount and confirm</li>
                        <li>Complete the checkout process</li>
                        <li>You'll see an order confirmation with a reference number</li>
                    </ol>
                </div>

                <div class="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-900/50 rounded-lg p-4">
                    <h4 class="font-semibold text-orange-900 dark:text-orange-300 mb-2">Step 4: Track Your Order</h4>
                    <ol class="list-decimal ml-6 space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                        <li>Go to the Orders page to see your order</li>
                        <li>Watch the status update in real-time as the canteen prepares your order</li>
                        <li>You'll receive notifications at key milestones:
                            <ul class="list-disc ml-6 mt-1 space-y-1">
                                <li>Order confirmed by the canteen</li>
                                <li>Order is being prepared</li>
                                <li>Order is ready for pickup</li>
                            </ul>
                        </li>
                        <li>Pick up your order at the specified time</li>
                    </ol>
                </div>
            </div>
        </div>

        <div>
            <h3 class="text-2xl font-semibold mb-3 dark:text-white">First-Time User Tips</h3>
            <ul class="list-disc ml-6 space-y-1 text-gray-700 dark:text-gray-300">
                <li>Check canteen operating hours before placing orders</li>
                <li>Allow extra time for your first order as the canteen gets familiar with your preferences</li>
                <li>Enable push notifications to get instant updates</li>
                <li>Try a shared basket with friends to learn the system</li>
                <li>Save your favorite items for quick ordering next time</li>
                <li>Check the FAQ page if you encounter any issues</li>
            </ul>
        </div>
    </div>
</section>
