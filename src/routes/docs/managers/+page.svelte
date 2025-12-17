<svelte:head>
	<title>Manager Documentation - COS</title>
</svelte:head>

<section id="canteen" class="mb-12 scroll-mt-4">
    <h2 class="text-3xl font-bold mb-6 dark:text-white">For Canteen Managers</h2>

    <div class="space-y-6">
        <div>
            <h3 class="text-2xl font-semibold mb-3 dark:text-white">Dashboard Overview</h3>
            <p class="text-gray-700 dark:text-gray-300 mb-2">
                Your canteen dashboard provides real-time insights into operations:
            </p>
            <ul class="list-disc ml-6 space-y-1 text-gray-700 dark:text-gray-300">
                <li>Today's revenue and order statistics</li>
                <li>Pending orders requiring attention</li>
                <li>Popular menu items and trends</li>
                <li>Quick access to order management</li>
            </ul>
        </div>

        <div>
            <h3 class="text-2xl font-semibold mb-3 dark:text-white">Managing Menu Items</h3>
            <p class="text-gray-700 dark:text-gray-300 mb-2">
                From the Items page, you can:
            </p>
            <ul class="list-disc ml-6 space-y-1 text-gray-700 dark:text-gray-300">
                <li>Add new menu items with descriptions, prices, and images</li>
                <li>Create item variants (e.g., Small, Medium, Large)</li>
                <li>Define optional addons with additional charges</li>
                <li>Set availability status and mark items as out of stock</li>
                <li>Categorize items by type (Veg, Non-Veg, Vegan, etc.)</li>
                <li>Update item details and pricing in real-time</li>
            </ul>
        </div>

        <div>
            <h3 class="text-2xl font-semibold mb-3 dark:text-white">Order Management</h3>
            <p class="text-gray-700 dark:text-gray-300 mb-2">
                Process incoming orders efficiently:
            </p>
            <ol class="list-decimal ml-6 space-y-2 text-gray-700 dark:text-gray-300">
                <li>
                    <strong>New Orders:</strong> Review order details including items, customer info,
                    and special requests
                </li>
                <li>
                    <strong>Accept/Reject:</strong> Confirm orders you can fulfill or reject with a reason
                </li>
                <li>
                    <strong>Update Status:</strong> Mark orders as preparing, ready for pickup, or completed
                </li>
                <li>
                    <strong>Communication:</strong> Customers receive automatic notifications at each
                    stage
                </li>
            </ol>
        </div>

        <div>
            <h3 class="text-2xl font-semibold mb-3 dark:text-white">Operating Hours</h3>
            <p class="text-gray-700 dark:text-gray-300 mb-2">
                Configure your canteen's schedule:
            </p>
            <ul class="list-disc ml-6 space-y-1 text-gray-700 dark:text-gray-300">
                <li>Set daily operating hours for each day of the week</li>
                <li>Mark special closure days or holidays</li>
                <li>Temporarily close for breaks or maintenance</li>
                <li>
                    System automatically prevents orders outside operating hours
                </li>
            </ul>
        </div>

        <div>
            <h3 class="text-2xl font-semibold mb-3 dark:text-white">Analytics & Reports</h3>
            <p class="text-gray-700 dark:text-gray-300">
                Access detailed insights about your canteen's performance including revenue trends,
                popular items, peak ordering times, and customer preferences to make informed
                business decisions.
            </p>
        </div>

        <div>
            <h3 class="text-2xl font-semibold mb-3 dark:text-white">Manager Onboarding Workflow</h3>
            <p class="text-gray-700 dark:text-gray-300 mb-4">
                If you're a new canteen manager, follow this workflow to get your canteen up and running:
            </p>
            
            <div class="space-y-4">
                <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50 rounded-lg p-4">
                    <h4 class="font-semibold text-blue-900 dark:text-blue-300 mb-2">Step 1: Receive Credentials & First Login</h4>
                    <ol class="list-decimal ml-6 space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                        <li>The system administrator will provide you with:
                            <ul class="list-disc ml-6 mt-1 space-y-1">
                                <li>Temporary username</li>
                                <li>Temporary password</li>
                                <li>Login URL and access instructions</li>
                            </ul>
                        </li>
                        <li>Visit the login page and enter your credentials</li>
                        <li>Navigate to your Profile page immediately</li>
                        <li>Change your password to something secure that you'll remember</li>
                        <li>Verify and update your contact information</li>
                    </ol>
                </div>

                <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50 rounded-lg p-4">
                    <h4 class="font-semibold text-green-900 dark:text-green-300 mb-2">Step 2: Configure Canteen Details</h4>
                    <ol class="list-decimal ml-6 space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                        <li>Go to your Canteen Dashboard</li>
                        <li>Click on "Settings" or "Edit Canteen Information"</li>
                        <li>Update canteen details:
                            <ul class="list-disc ml-6 mt-1 space-y-1">
                                <li>Complete name and location</li>
                                <li>Contact phone number and email</li>
                                <li>Upload a canteen logo or image</li>
                                <li>Add a description of your canteen</li>
                            </ul>
                        </li>
                    </ol>
                </div>

                <div class="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-900/50 rounded-lg p-4">
                    <h4 class="font-semibold text-purple-900 dark:text-purple-300 mb-2">Step 3: Set Operating Hours</h4>
                    <ol class="list-decimal ml-6 space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                        <li>Navigate to Settings → Operating Hours</li>
                        <li>Set opening and closing times for each day of the week:
                            <ul class="list-disc ml-6 mt-1 space-y-1">
                                <li>Monday through Friday (typical service hours)</li>
                                <li>Saturday and Sunday (if applicable)</li>
                                <li>Include any breaks (e.g., between lunch and dinner service)</li>
                            </ul>
                        </li>
                        <li>Save your schedule</li>
                        <li>System will now block orders outside these hours</li>
                    </ol>
                </div>

                <div class="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-900/50 rounded-lg p-4">
                    <h4 class="font-semibold text-orange-900 dark:text-orange-300 mb-2">Step 4: Create Your Menu</h4>
                    <ol class="list-decimal ml-6 space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                        <li>Go to the Items page from your dashboard</li>
                        <li>Click "Add New Item" to start creating menu items</li>
                        <li>For each item, fill in:
                            <ul class="list-disc ml-6 mt-1 space-y-1">
                                <li>Item name and description</li>
                                <li>Category (Breakfast, Lunch, Desserts, Beverages, etc.)</li>
                                <li>Price</li>
                                <li>Food type (Veg, Non-Veg, Vegan)</li>
                                <li>Upload an image (helps customers decide)</li>
                            </ul>
                        </li>
                        <li>Add variants if applicable (e.g., Small/Medium/Large for drinks)</li>
                        <li>Add optional addons (e.g., Extra cheese, Spicy sauce)</li>
                        <li>Save the item</li>
                    </ol>
                </div>

                <div class="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-900/50 rounded-lg p-4">
                    <h4 class="font-semibold text-cyan-900 dark:text-cyan-300 mb-2">Step 5: Test & Go Live</h4>
                    <ol class="list-decimal ml-6 space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                        <li>Review your menu and settings to ensure everything is correct</li>
                        <li>Ask the administrator to test placing an order</li>
                        <li>Once tested successfully, your canteen is ready to accept real orders</li>
                        <li>Monitor incoming orders closely on your first day</li>
                        <li>Make adjustments to menu or operating hours as needed</li>
                    </ol>
                </div>
            </div>
        </div>

        <div>
            <h3 class="text-2xl font-semibold mb-3 dark:text-white">Daily Operations Workflow</h3>
            <p class="text-gray-700 dark:text-gray-300 mb-4">
                Your typical workflow for managing orders each day:
            </p>
            
            <div class="space-y-4">
                <div class="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                    <h4 class="font-semibold text-gray-900 dark:text-white mb-2">Morning</h4>
                    <ul class="list-disc ml-6 space-y-1 text-gray-700 dark:text-gray-300 text-sm">
                        <li>Log into the dashboard 30 minutes before opening</li>
                        <li>Check if all operating hours are set correctly</li>
                        <li>Review your menu and disable any unavailable items</li>
                        <li>Verify your canteen shows as "Open"</li>
                    </ul>
                </div>

                <div class="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                    <h4 class="font-semibold text-gray-900 dark:text-white mb-2">Throughout the Day</h4>
                    <ul class="list-disc ml-6 space-y-1 text-gray-700 dark:text-gray-300 text-sm">
                        <li>Check the Orders section regularly for new incoming orders</li>
                        <li>Accept orders you can fulfill immediately</li>
                        <li>Reject orders with reasonable explanations if needed</li>
                        <li>Update order status as you progress: Preparing → Ready → Completed</li>
                        <li>Customers automatically get notified at each status change</li>
                        <li>Update menu availability if items run out</li>
                    </ul>
                </div>

                <div class="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                    <h4 class="font-semibold text-gray-900 dark:text-white mb-2">Closing</h4>
                    <ul class="list-disc ml-6 space-y-1 text-gray-700 dark:text-gray-300 text-sm">
                        <li>Review the dashboard for any pending orders</li>
                        <li>Ensure all orders are marked as completed</li>
                        <li>Check daily revenue and order statistics</li>
                        <li>Note any items that were unpopular or ran out quickly</li>
                        <li>Make a final check before closing your canteen</li>
                    </ul>
                </div>

                <div class="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                    <h4 class="font-semibold text-gray-900 dark:text-white mb-2">Weekly/Monthly</h4>
                    <ul class="list-disc ml-6 space-y-1 text-gray-700 dark:text-gray-300 text-sm">
                        <li>Review analytics to understand customer preferences</li>
                        <li>Adjust pricing based on demand</li>
                        <li>Update menu with seasonal items or new recipes</li>
                        <li>Plan for busy periods and adjust inventory</li>
                    </ul>
                </div>
            </div>
        </div>

        <div>
            <h3 class="text-2xl font-semibold mb-3 dark:text-white">Manager Best Practices</h3>
            <ul class="list-disc ml-6 space-y-1 text-gray-700 dark:text-gray-300">
                <li>Respond to orders quickly to provide great customer experience</li>
                <li>Be honest about order rejection reasons - helps build trust</li>
                <li>Keep your menu up-to-date to avoid disappointed customers</li>
                <li>Monitor analytics weekly to improve your offerings</li>
                <li>Update operating hours if you need to close early</li>
                <li>Upload high-quality images for your menu items</li>
                <li>Communicate with customers through order status updates</li>
                <li>Test your notifications to ensure they're working correctly</li>
            </ul>
        </div>
    </div>
</section>
