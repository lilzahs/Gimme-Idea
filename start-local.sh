#!/bin/bash

echo "🚀 Starting Gimme Idea Project..."
echo ""

# Kill any existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f "next dev" 2>/dev/null
pkill -f "tsx watch" 2>/dev/null
pkill -f "node.*GMI" 2>/dev/null
sleep 1

# Check ports are free
if lsof -i :3000 -i :3001 >/dev/null 2>&1; then
  echo "⚠️  Ports still in use. Waiting..."
  sleep 2
fi

echo "✅ Ports cleared"
echo ""

# Open 2 terminal tabs and start servers
echo "📦 Starting Backend on port 3001..."
osascript -e 'tell application "Terminal" to do script "cd \"'"$(pwd)"'/GMI-BE\" && npm run prisma:generate && npm run dev"'

sleep 3

echo "🎨 Starting Frontend on port 3000..."
osascript -e 'tell application "Terminal" to do script "cd \"'"$(pwd)"'/GMI-FE\" && npm run dev"'

echo ""
echo "✅ Both servers starting in new Terminal tabs!"
echo ""
echo "📝 Check:"
echo "  - Backend:  http://localhost:3001/api/health"
echo "  - Frontend: http://localhost:3000"
echo ""
echo "🎯 Enter code: GMI2025"
