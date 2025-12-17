<svelte:head>
	<title>Stakeholder Documentation - COS</title>
</svelte:head>

<section id="stakeholders" class="mb-12 scroll-mt-4">
    <h2 class="text-3xl font-bold mb-6 dark:text-white">For Stakeholders</h2>

    <div class="space-y-6">
        <div>
            <h3 class="text-2xl font-semibold mb-3 dark:text-white">Business Value</h3>
            <p class="text-gray-700 dark:text-gray-300 mb-3">
                COS streamlines canteen operations and improves customer satisfaction through:
            </p>
            <ul class="list-disc ml-6 space-y-2 text-gray-700 dark:text-gray-300">
                <li>
                    <strong>Reduced Wait Times:</strong> Pre-orders allow canteens to prepare food in
                    advance, minimizing customer wait times
                </li>
                <li>
                    <strong>Improved Efficiency:</strong> Digital order management eliminates manual
                    order taking and reduces errors
                </li>
                <li>
                    <strong>Better Planning:</strong> Analytics help canteens forecast demand and manage
                    inventory effectively
                </li>
                <li>
                    <strong>Enhanced Experience:</strong> Real-time updates and notifications keep customers
                    informed and satisfied
                </li>
            </ul>
        </div>

        <div>
            <h3 class="text-2xl font-semibold mb-3 dark:text-white">Key Metrics</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-900/30">
                    <h4 class="font-semibold text-blue-900 dark:text-blue-300 mb-2">Operational Efficiency</h4>
                    <p class="text-gray-700 dark:text-gray-300 text-sm">
                        Track order processing times, completion rates, and staff productivity
                    </p>
                </div>
                <div class="bg-cyan-50 dark:bg-cyan-900/20 p-4 rounded-lg border border-cyan-100 dark:border-cyan-900/30">
                    <h4 class="font-semibold text-cyan-900 dark:text-cyan-300 mb-2">Revenue Insights</h4>
                    <p class="text-gray-700 dark:text-gray-300 text-sm">
                        Monitor daily revenue, popular items, and peak ordering periods
                    </p>
                </div>
                <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-900/30">
                    <h4 class="font-semibold text-green-900 dark:text-green-300 mb-2">Customer Satisfaction</h4>
                    <p class="text-gray-700 dark:text-gray-300 text-sm">
                        Measure order accuracy, delivery times, and user engagement
                    </p>
                </div>
                <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-900/30">
                    <h4 class="font-semibold text-blue-900 dark:text-blue-300 mb-2">System Performance</h4>
                    <p class="text-gray-700 dark:text-gray-300 text-sm">
                        Monitor uptime, response times, and concurrent user capacity
                    </p>
                </div>
            </div>
        </div>

        <div>
            <h3 class="text-2xl font-semibold mb-3 dark:text-white">Security & Privacy</h3>
            <p class="text-gray-700 dark:text-gray-300 mb-3">
                COS implements industry-standard security practices:
            </p>
            <ul class="list-disc ml-6 space-y-1 text-gray-700 dark:text-gray-300">
                <li>Secure password hashing with Argon2</li>
                <li>Session-based authentication with secure cookies</li>
                <li>HTTPS encryption for all data transmission</li>
                <li>Regular security updates and dependency management</li>
                <li>Data privacy compliance with user consent for notifications</li>
                <li>Database access controls and connection pooling</li>
            </ul>
        </div>

        <div>
            <h3 class="text-2xl font-semibold mb-3 dark:text-white">Scalability</h3>
            <p class="text-gray-700 dark:text-gray-300 mb-3">
                The system is designed to scale with institutional needs:
            </p>
            <ul class="list-disc ml-6 space-y-1 text-gray-700 dark:text-gray-300">
                <li>
                    <strong>Horizontal Scaling:</strong> Can be deployed across multiple instances with
                    load balancing
                </li>
                <li>
                    <strong>Database Optimization:</strong> PostgreSQL with proper indexing handles high
                    transaction volumes
                </li>
                <li>
                    <strong>Containerized Deployment:</strong> Docker enables consistent deployment across
                    environments
                </li>
                <li>
                    <strong>Efficient Updates:</strong> SSE reduces polling overhead compared to traditional
                    REST APIs
                </li>
            </ul>
        </div>

        <div>
            <h3 class="text-2xl font-semibold mb-3 dark:text-white">Integration Capabilities</h3>
            <p class="text-gray-700 dark:text-gray-300 mb-3">
                COS can integrate with existing systems:
            </p>
            <ul class="list-disc ml-6 space-y-1 text-gray-700 dark:text-gray-300">
                <li>Email notifications via Azure Communication Services</li>
                <li>Payment gateway integration for digital transactions</li>
                <li>Identity management system integration for SSO</li>
                <li>Analytics platforms for business intelligence</li>
                <li>REST API endpoints for third-party integrations</li>
            </ul>
        </div>

        <div>
            <h3 class="text-2xl font-semibold mb-3 dark:text-white">Support & Maintenance</h3>
            <p class="text-gray-700 dark:text-gray-300 mb-3">Ongoing support includes:</p>
            <ul class="list-disc ml-6 space-y-1 text-gray-700 dark:text-gray-300">
                <li>Regular feature updates and improvements</li>
                <li>Bug fixes and security patches</li>
                <li>Performance monitoring and optimization</li>
                <li>Database backup and disaster recovery procedures</li>
                <li>Technical support for canteen managers and administrators</li>
            </ul>
        </div>

        <div>
            <h3 class="text-2xl font-semibold mb-3 dark:text-white">Future Roadmap</h3>
            <p class="text-gray-700 dark:text-gray-300 mb-3">Planned enhancements include:</p>
            <ul class="list-disc ml-6 space-y-1 text-gray-700 dark:text-gray-300">
                <li>Advanced analytics dashboard with predictive insights</li>
                <li>Mobile native applications for iOS and Android</li>
                <li>Loyalty programs and reward points system</li>
                <li>Integration with campus ID cards for seamless payments</li>
                <li>Expanded notification channels (SMS, WhatsApp)</li>
                <li>Multi-language support for diverse user bases</li>
            </ul>
        </div>

        <div>
            <h3 class="text-2xl font-semibold mb-3 dark:text-white">Institutional Onboarding Workflow</h3>
            <p class="text-gray-700 dark:text-gray-300 mb-4">
                For institutions considering COS adoption, here's the typical rollout workflow:
            </p>
            
            <div class="space-y-4">
                <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50 rounded-lg p-4">
                    <h4 class="font-semibold text-blue-900 dark:text-blue-300 mb-2">Phase 1: Planning & Setup (Weeks 1-2)</h4>
                    <ul class="list-disc ml-6 space-y-1 text-gray-700 dark:text-gray-300 text-sm">
                        <li>Identify system administrator(s) and IT staff for COS</li>
                        <li>Determine which canteens will participate</li>
                        <li>Deploy COS infrastructure (database, servers, domain)</li>
                        <li>Establish administrator account(s)</li>
                        <li>Set up email and notification services</li>
                        <li>Create system documentation for your institution</li>
                    </ul>
                </div>

                <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50 rounded-lg p-4">
                    <h4 class="font-semibold text-green-900 dark:text-green-300 mb-2">Phase 2: Canteen Onboarding (Weeks 3-4)</h4>
                    <ul class="list-disc ml-6 space-y-1 text-gray-700 dark:text-gray-300 text-sm">
                        <li>Meet with each canteen management team</li>
                        <li>Explain the system and its benefits</li>
                        <li>Create canteen records in the system</li>
                        <li>Assign and provision canteen manager accounts</li>
                        <li>Provide managers with login credentials and documentation</li>
                        <li>Conduct training sessions for canteen staff</li>
                        <li>Managers set up their canteen profiles and menus</li>
                    </ul>
                </div>

                <div class="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-900/50 rounded-lg p-4">
                    <h4 class="font-semibold text-purple-900 dark:text-purple-300 mb-2">Phase 3: Pilot Testing (Week 5)</h4>
                    <ul class="list-disc ml-6 space-y-1 text-gray-700 dark:text-gray-300 text-sm">
                        <li>Select a small group of users for testing</li>
                        <li>Provide them with login credentials and instructions</li>
                        <li>Monitor system performance and gather feedback</li>
                        <li>Address any issues discovered during testing</li>
                        <li>Make adjustments to system configuration or workflows</li>
                    </ul>
                </div>

                <div class="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-900/50 rounded-lg p-4">
                    <h4 class="font-semibold text-orange-900 dark:text-orange-300 mb-2">Phase 4: Wider Rollout (Week 6+)</h4>
                    <ul class="list-disc ml-6 space-y-1 text-gray-700 dark:text-gray-300 text-sm">
                        <li>Announce COS to the broader user community</li>
                        <li>Create login credentials for all staff and students</li>
                        <li>Distribute access instructions via email or portal</li>
                        <li>Support user questions and issues through a help desk</li>
                        <li>Monitor system usage and performance metrics</li>
                        <li>Collect feedback from users and managers</li>
                        <li>Make refinements based on real-world usage</li>
                    </ul>
                </div>

                <div class="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-900/50 rounded-lg p-4">
                    <h4 class="font-semibold text-cyan-900 dark:text-cyan-300 mb-2">Phase 5: Ongoing Operations</h4>
                    <ul class="list-disc ml-6 space-y-1 text-gray-700 dark:text-gray-300 text-sm">
                        <li>Monitor system health and performance continuously</li>
                        <li>Provide technical support to canteen managers</li>
                        <li>Review analytics and generate reports for management</li>
                        <li>Plan and implement feature improvements</li>
                        <li>Maintain security, backups, and disaster recovery</li>
                        <li>Engage with users to identify enhancement opportunities</li>
                    </ul>
                </div>
            </div>
        </div>

        <div>
            <h3 class="text-2xl font-semibold mb-3 dark:text-white">Success Metrics</h3>
            <p class="text-gray-700 dark:text-gray-300 mb-4">
                Track these key indicators to measure COS implementation success:
            </p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                    <h4 class="font-semibold text-gray-900 dark:text-white mb-2">User Adoption</h4>
                    <ul class="list-disc ml-6 text-gray-700 dark:text-gray-300 text-sm space-y-1">
                        <li>% of eligible users registered</li>
                        <li>Active daily/weekly users</li>
                        <li>Orders placed per week</li>
                    </ul>
                </div>
                <div class="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                    <h4 class="font-semibold text-gray-900 dark:text-white mb-2">Operational Impact</h4>
                    <ul class="list-disc ml-6 text-gray-700 dark:text-gray-300 text-sm space-y-1">
                        <li>Reduction in manual order taking time</li>
                        <li>Improvement in order accuracy</li>
                        <li>Reduction in queue wait times</li>
                    </ul>
                </div>
                <div class="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                    <h4 class="font-semibold text-gray-900 dark:text-white mb-2">Financial Metrics</h4>
                    <ul class="list-disc ml-6 text-gray-700 dark:text-gray-300 text-sm space-y-1">
                        <li>Total revenue generated</li>
                        <li>Average order value</li>
                        <li>Peak ordering periods</li>
                    </ul>
                </div>
                <div class="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                    <h4 class="font-semibold text-gray-900 dark:text-white mb-2">Satisfaction</h4>
                    <ul class="list-disc ml-6 text-gray-700 dark:text-gray-300 text-sm space-y-1">
                        <li>User feedback and ratings</li>
                        <li>Canteen manager satisfaction</li>
                        <li>System uptime and reliability</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</section>
