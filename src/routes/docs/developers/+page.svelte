<svelte:head>
	<title>Developer Documentation - COS</title>
</svelte:head>

<section id="developers" class="mb-12 scroll-mt-4">
    <h2 class="text-3xl font-bold mb-6 dark:text-white">For Developers</h2>

    <div class="space-y-6">
        <div>
            <h3 class="text-2xl font-semibold mb-3 dark:text-white">Technology Stack</h3>
            <div class="grid grid-cols-2 gap-4 mt-3">
                <div>
                    <h4 class="font-semibold text-gray-900 dark:text-white mb-2">Frontend</h4>
                    <ul class="list-disc ml-6 text-gray-700 dark:text-gray-300 space-y-1">
                        <li>SvelteKit (Svelte 5)</li>
                        <li>Tailwind CSS v4</li>
                        <li>TypeScript</li>
                        <li>Lucide & Phosphor Icons</li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-semibold text-gray-900 dark:text-white mb-2">Backend</h4>
                    <ul class="list-disc ml-6 text-gray-700 dark:text-gray-300 space-y-1">
                        <li>PostgreSQL</li>
                        <li>Drizzle ORM</li>
                        <li>Server-Sent Events</li>
                        <li>Web Push API</li>
                    </ul>
                </div>
            </div>
        </div>

        <div>
            <h3 class="text-2xl font-semibold mb-3 dark:text-white">Project Structure</h3>
            <div class="bg-gray-900 dark:bg-gray-950 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto border border-gray-700">
                <pre>src/
├── lib/
│   ├── components/        # Reusable UI components
│   ├── server/            # Server-side logic
│   │   ├── db/           # Database schema & connection
│   │   ├── emailService.ts
│   │   ├── notificationService.ts
│   │   └── sse-events.ts
│   └── utils/            # Utility functions
├── routes/               # SvelteKit routes
│   ├── api/             # API endpoints
│   ├── auth/            # Authentication
│   ├── basket/          # Basket management
│   ├── canteen/         # Canteen operations
│   ├── menu/            # Menu browsing
│   ├── orders/          # Order tracking
│   └── ...
└── static/              # Static assets & PWA files</pre>
            </div>
        </div>

        <div>
            <h3 class="text-2xl font-semibold mb-3 dark:text-white">Development Setup</h3>
            <p class="text-gray-700 dark:text-gray-300 mb-3">Prerequisites: Node.js 20+, Docker, pnpm</p>
            <div class="bg-gray-900 dark:bg-gray-950 text-gray-100 p-4 rounded-lg font-mono text-sm space-y-2 border border-gray-700">
                <div># Clone repository</div>
                <div class="text-green-400">git clone [repository-url]</div>
                <div class="text-green-400">cd cos</div>
                <div class="mt-3"># Install dependencies</div>
                <div class="text-green-400">pnpm install</div>
                <div class="mt-3"># Start database</div>
                <div class="text-green-400">npm run db:start</div>
                <div class="mt-3"># Push schema</div>
                <div class="text-green-400">npm run db:push</div>
                <div class="mt-3"># Start dev server</div>
                <div class="text-green-400">npm run dev</div>
            </div>
        </div>

        <div>
            <h3 class="text-2xl font-semibold mb-3 dark:text-white">Key Features to Understand</h3>
            <div class="space-y-3">
                <div>
                    <h4 class="font-semibold text-gray-900 dark:text-white">Server-Sent Events (SSE)</h4>
                    <p class="text-gray-700 dark:text-gray-300">
                        Real-time order updates are pushed to clients via SSE. The implementation is in
                        <code class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">src/lib/server/sse-events.ts</code>
                        with endpoints under
                        <code class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">src/routes/api/sse/</code>.
                    </p>
                </div>
                <div>
                    <h4 class="font-semibold text-gray-900 dark:text-white">Session Management</h4>
                    <p class="text-gray-700 dark:text-gray-300">
                        Uses secure session cookies with Argon2 password hashing. Session handling is in
                        <code class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">src/lib/server/session.ts</code>.
                    </p>
                </div>
                <div>
                    <h4 class="font-semibold text-gray-900 dark:text-white">Database Schema</h4>
                    <p class="text-gray-700 dark:text-gray-300">
                        Drizzle ORM schema definitions are in
                        <code class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">src/lib/server/db/schema.ts</code
                        >. Use <code class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">npm run db:studio</code> to
                        explore the database visually.
                    </p>
                </div>
                <div>
                    <h4 class="font-semibold text-gray-900 dark:text-white">PWA Configuration</h4>
                    <p class="text-gray-700 dark:text-gray-300">
                        Service worker and manifest files are in the
                        <code class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">static/</code> directory. Web Push
                        notifications use VAPID keys for authentication.
                    </p>
                </div>
            </div>
        </div>

        <div>
            <h3 class="text-2xl font-semibold mb-3 dark:text-white">API Endpoints</h3>
            <div class="space-y-2">
                <div class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded border border-gray-200 dark:border-gray-600">
                    <code class="font-semibold dark:text-blue-300">/api/sse/orders/*</code>
                    <span class="text-gray-600 dark:text-gray-400 ml-2">- Server-Sent Events for order updates</span>
                </div>
                <div class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded border border-gray-200 dark:border-gray-600">
                    <code class="font-semibold dark:text-blue-300">/api/push/subscribe</code>
                    <span class="text-gray-600 dark:text-gray-400 ml-2">- Subscribe to push notifications</span>
                </div>
                <div class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded border border-gray-200 dark:border-gray-600">
                    <code class="font-semibold dark:text-blue-300">/api/push/unsubscribe</code>
                    <span class="text-gray-600 dark:text-gray-400 ml-2">- Unsubscribe from push notifications</span>
                </div>
                <div class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded border border-gray-200 dark:border-gray-600">
                    <code class="font-semibold dark:text-blue-300">/api/push/vapid-key</code>
                    <span class="text-gray-600 dark:text-gray-400 ml-2">- Get VAPID public key</span>
                </div>
            </div>
        </div>

        <div>
            <h3 class="text-2xl font-semibold mb-3 dark:text-white">Contributing Guidelines</h3>
            <ul class="list-disc ml-6 space-y-1 text-gray-700 dark:text-gray-300">
                <li>Follow the existing code style and use Prettier for formatting</li>
                <li>Write TypeScript with proper type definitions</li>
                <li>Use SvelteKit's form actions for server-side operations</li>
                <li>Test changes locally with Docker database before committing</li>
                <li>Keep components small and focused on single responsibilities</li>
                <li>Document complex logic with comments</li>
            </ul>
        </div>
    </div>
</section>
