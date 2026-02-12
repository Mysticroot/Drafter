#!/bin/bash
# Setup and install dependencies
echo "Setting up Anime Draft Arena..."
echo ""

echo "[Step 1] Installing backend dependencies..."
npm install

echo ""
echo "[Step 2] Installing frontend dependencies..."
cd client
npm install
cd ..

echo ""
echo "==================================="
echo "Setup complete!"
echo "==================================="
echo ""
echo "Next, run one of the following:"
echo ""
echo "Option A (Recommended - Two terminals):"
echo "  Terminal 1: npm run dev"
echo "  Terminal 2: cd client && npm run dev"
echo ""
echo "Option B (Production):"
echo "  npm run build"
echo "  cd client && npm run build"
echo "  cd .."
echo "  npm start"
echo ""
