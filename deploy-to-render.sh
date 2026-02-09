#!/bin/bash
# Deploy Marvin Hub to Render in 5 minutes

echo "🚀 Marvin Hub - Render Deployment"
echo ""

# Step 1: Check if GitHub CLI is available
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI not found. Install it first or create repo manually."
    echo "   Go to: https://github.com/new"
    echo "   Create repo: marvin-hub"
else
    echo "✅ GitHub CLI found"
fi

echo ""
echo "=== GitHub Setup ==="
echo "1. Run: gh repo create marvin-hub --public --source=. --push"
echo ""

echo "=== Render Setup ==="
echo "1. Go to: https://render.com"
echo "2. Sign in with GitHub"
echo "3. Click: New + → Web Service"
echo "4. Configure:"
echo "   - Name: marvin-hub"
echo "   - Root: marvin-hub"
echo "   - Build: npm install"
echo "   - Start: npm start"
echo "   - Plan: Free"
echo ""
echo "5. Add env var: PORT=10000"
echo ""
echo "=== Your URL ==="
echo "https://marvin-hub.onrender.com"
echo ""
echo "✅ Done in ~5 minutes!"
