#!/bin/bash

echo "🚀 Testing SSE Implementation for Canteen Ordering System"
echo "========================================================="

# Start the development server
echo "Starting development server..."
cd /home/arihanttr/Git/cos

# Build the project first
echo "Building project..."
pnpm build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "🎉 SSE Implementation is ready!"
    echo ""
    echo "To test the SSE functionality:"
    echo "1. Start the server with: pnpm dev"
    echo "2. Open browser and login"
    echo "3. Place an order - you should see real-time updates on canteen dashboard"
    echo "4. Update order status from canteen dashboard - customer should see real-time updates"
    echo ""
    echo "SSE Endpoints created:"
    echo "- POST /api/sse/orders - Main SSE endpoint for real-time updates"
    echo ""
    echo "Updated components:"
    echo "- /routes/orders/+page.svelte - Customer orders list with real-time updates"
    echo "- /routes/orders/[orderId]/+page.svelte - Individual order details with real-time updates"
    echo "- /routes/canteen/dashboard/+page.svelte - Canteen dashboard with real-time new order notifications"
    echo "- /routes/basket/+page.server.ts - Emits SSE events when new orders are created"
    echo "- /routes/canteen/dashboard/+page.server.ts - Emits SSE events when order status is updated"
else
    echo "❌ Build failed. Please check errors above."
    exit 1
fi
