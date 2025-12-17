<svelte:head>
	<title>Administrator Documentation - COS</title>
</svelte:head>

<section id="admins" class="mb-12 scroll-mt-4">
    <h2 class="text-3xl font-bold mb-6 dark:text-white">For System Administrators</h2>

    <div class="space-y-6">
        <div>
            <h3 class="text-2xl font-semibold mb-3 dark:text-white">System Administration</h3>
            <p class="text-gray-700 dark:text-gray-300 mb-3">
                As a system administrator, you have access to manage the entire COS ecosystem and onboard new users and canteens.
            </p>
        </div>

        <div>
            <h3 class="text-2xl font-semibold mb-3 dark:text-white">Becoming an Administrator</h3>
            <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50 rounded-lg p-4 mb-4">
                <p class="text-gray-700 dark:text-gray-300 mb-3">
                    There is no easy way to become an admin (*pikachu face*), someone with DB access needs to manually change the user
                    role in the DB to admin to grant a user admin level access. This is done (*checks notes*) primarily to ensure safety
                    and security concerns, and maybe  abit of developer skill issue. 
                </p>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 italic">
                Admin accounts cannot be self-created and require direct database manipulation or authorization from the system owner.
            </p>
        </div>

        <div>
            <h3 class="text-2xl font-semibold mb-3 dark:text-white">Admin Dashboard</h3>
            <p class="text-gray-700 dark:text-gray-300 mb-2">
                The admin dashboard provides system-wide visibility and management capabilities:
            </p>
            <ul class="list-disc ml-6 space-y-1 text-gray-700 dark:text-gray-300">
                <li>Overall system statistics and health metrics</li>
                <li>Active users and canteen managers count</li>
                <li>Global revenue and transaction summaries</li>
                <li>System logs and error tracking</li>
                <li>User and canteen management interfaces</li>
            </ul>
        </div>

        <div>
            <h3 class="text-2xl font-semibold mb-3 dark:text-white">Adding New Canteens</h3>
            <p class="text-gray-700 dark:text-gray-300 mb-3">
                Follow this process to onboard a new canteen to the system:
            </p>
            <div class="space-y-4">
                <div class="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                    <h4 class="font-semibold text-gray-900 dark:text-white mb-2">Step 1: Create Canteen Account</h4>
                    <ol class="list-decimal ml-6 space-y-1 text-gray-700 dark:text-gray-300 text-sm">
                        <li>Access the admin panel and navigate to "Manage Canteens"</li>
                        <li>Click "Add New Canteen"</li>
                        <li>Enter canteen details:
                            <ul class="list-disc ml-6 mt-1 space-y-1">
                                <li>Canteen name</li>
                                <li>Location/building</li>
                                <li>Contact information</li>
                                <li>Default operating hours</li>
                            </ul>
                        </li>
                        <li>Save the canteen</li>
                    </ol>
                </div>

                <div class="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                    <h4 class="font-semibold text-gray-900 dark:text-white mb-2">Step 2: Create Manager Account</h4>
                    <ol class="list-decimal ml-6 space-y-1 text-gray-700 dark:text-gray-300 text-sm">
                        <li>In the "Manage Canteens" section, select the newly created canteen</li>
                        <li>Click "Add Manager"</li>
                        <li>Enter the manager's details:
                            <ul class="list-disc ml-6 mt-1 space-y-1">
                                <li>Full name</li>
                                <li>Email address (institutional email preferred)</li>
                                <li>Phone number</li>
                            </ul>
                        </li>
                        <li>The system will generate temporary login credentials</li>
                    </ol>
                </div>

                <div class="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                    <h4 class="font-semibold text-gray-900 dark:text-white mb-2">Step 3: Distribute Credentials</h4>
                    <ol class="list-decimal ml-6 space-y-1 text-gray-700 dark:text-gray-300 text-sm">
                        <li>Copy the temporary username and password</li>
                        <li>Send credentials to the manager via secure channel:
                            <ul class="list-disc ml-6 mt-1 space-y-1">
                                <li>Preferably encrypted email or secure message</li>
                                <li>Never share via public channels</li>
                            </ul>
                        </li>
                        <li>Include login URL: <code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-xs">https://your-domain/login</code></li>
                        <li>Advise manager to change password on first login</li>
                    </ol>
                </div>

                <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50 rounded-lg p-4">
                    <h4 class="font-semibold text-blue-900 dark:text-blue-300 mb-2">Manager First Login</h4>
                    <p class="text-gray-700 dark:text-gray-300 text-sm">
                        When the manager logs in with their temporary credentials, they should immediately:
                    </p>
                    <ol class="list-decimal ml-6 space-y-1 text-gray-700 dark:text-gray-300 text-sm mt-2">
                        <li>Navigate to their Profile page</li>
                        <li>Change their password to something secure</li>
                        <li>Verify contact information is correct</li>
                        <li>Complete their canteen profile if needed</li>
                    </ol>
                </div>
            </div>
        </div>

        <div>
            <h3 class="text-2xl font-semibold mb-3 dark:text-white">Managing Users</h3>
            <p class="text-gray-700 dark:text-gray-300 mb-3">
                User management capabilities include:
            </p>
            <ul class="list-disc ml-6 space-y-1 text-gray-700 dark:text-gray-300">
                <li>View all registered users in the system</li>
                <li>Search and filter users by name, email, or role</li>
                <li>Reset user passwords if needed</li>
                <li>Temporarily suspend user accounts</li>
                <li>View user transaction history and order activity</li>
                <li>Generate reports of user engagement metrics</li>
            </ul>
        </div>

        <div>
            <h3 class="text-2xl font-semibold mb-3 dark:text-white">System Configuration</h3>
            <p class="text-gray-700 dark:text-gray-300 mb-3">
                Configure system-wide settings:
            </p>
            <ul class="list-disc ml-6 space-y-1 text-gray-700 dark:text-gray-300">
                <li>Email notification settings (SMTP configuration)</li>
                <li>Web push notification VAPID keys</li>
                <li>System timezone and date format preferences</li>
                <li>Default operating hours for new canteens</li>
                <li>Payment gateway configuration</li>
                <li>Tax and pricing policies</li>
            </ul>
        </div>

        <div>
            <h3 class="text-2xl font-semibold mb-3 dark:text-white">Monitoring & Maintenance</h3>
            <p class="text-gray-700 dark:text-gray-300 mb-3">
                Regular administrative tasks:
            </p>
            <ul class="list-disc ml-6 space-y-1 text-gray-700 dark:text-gray-300">
                <li>Monitor system performance and server health</li>
                <li>Review error logs and address issues promptly</li>
                <li>Perform regular database backups</li>
                <li>Update system and dependencies</li>
                <li>Review security logs for suspicious activity</li>
                <li>Archive old transaction data as per retention policies</li>
            </ul>
        </div>

        <div>
            <h3 class="text-2xl font-semibold mb-3 dark:text-white">Best Practices</h3>
            <ul class="list-disc ml-6 space-y-1 text-gray-700 dark:text-gray-300">
                <li>Always use strong, unique passwords for admin accounts</li>
                <li>Enable two-factor authentication if available</li>
                <li>Keep credentials secure and never share with non-admin staff</li>
                <li>Document all administrative changes and actions</li>
                <li>Regularly audit user accounts and permissions</li>
                <li>Test backup and recovery procedures periodically</li>
                <li>Communicate system changes to managers and users in advance</li>
            </ul>
        </div>
    </div>
</section>
