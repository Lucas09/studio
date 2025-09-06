#!/bin/bash

echo "🚀 Setting up SudokuSphere with Neon + Upstash"
echo "=============================================="

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "✅ .env file created!"
    echo ""
    echo "⚠️  IMPORTANT: You need to update .env with your cloud credentials:"
    echo "   1. Get your Neon PostgreSQL connection string from https://neon.tech"
    echo "   2. Get your Upstash Redis connection string from https://upstash.com"
    echo "   3. Update DATABASE_URL and REDIS_URL in .env"
    echo ""
    read -p "Press Enter when you've updated the .env file..."
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run database migrations
echo "🗄️  Setting up database schema..."
npm run db:migrate

# Check if migrations succeeded
if [ $? -eq 0 ]; then
    echo "✅ Database schema created successfully!"
else
    echo "❌ Database migration failed. Check your DATABASE_URL in .env"
    exit 1
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start the backend: npm run dev"
echo "2. In another terminal, start the frontend: cd .. && npm run dev"
echo "3. Visit http://localhost:3000 to see your app!"
echo ""
echo "📊 Monitor your services:"
echo "   - Neon Dashboard: https://console.neon.tech"
echo "   - Upstash Dashboard: https://console.upstash.com"
echo "   - Health Check: http://localhost:3001/health"
