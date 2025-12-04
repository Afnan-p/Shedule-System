#!/bin/bash
# Bash Setup Script for Linux/Mac
# Run this script to automatically set up both backend and frontend

echo "🚀 Setting up Institute Schedule Management System..."
echo ""

# Check if Node.js is installed
echo "📦 Checking Node.js installation..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js installed: $NODE_VERSION"
else
    echo "❌ Node.js not found! Please install Node.js v16 or higher."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Setup Backend
echo ""
echo "🔧 Setting up Backend..."
cd backend || exit 1

# Install backend dependencies
echo "   Installing backend dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

# Create backend .env file if not exists
if [ ! -f .env ]; then
    echo "   Creating backend .env file..."
    cat > .env << EOF
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/schedule-management
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
EOF
    echo "   ✅ Created backend/.env"
else
    echo "   ✅ backend/.env already exists"
fi

cd ..

# Setup Frontend
echo ""
echo "🎨 Setting up Frontend..."
cd frontend || exit 1

# Install frontend dependencies
echo "   Installing frontend dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

# Create frontend .env file if not exists
if [ ! -f .env ]; then
    echo "   Creating frontend .env file..."
    cat > .env << EOF
VITE_API_URL=http://localhost:5000/api
EOF
    echo "   ✅ Created frontend/.env"
else
    echo "   ✅ frontend/.env already exists"
fi

cd ..

# Summary
echo ""
echo "✅ Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Make sure MongoDB is running (local or Atlas)"
echo "2. Seed the database (run once):"
echo "   cd backend"
echo "   npm run seed"
echo ""
echo "3. Start Backend (Terminal 1):"
echo "   cd backend"
echo "   npm run dev"
echo ""
echo "4. Start Frontend (Terminal 2):"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "5. Open browser:"
echo "   Frontend: http://localhost:3000"
echo "   Backend Health: http://localhost:5000/api/health"
echo ""
echo "6. Login with:"
echo "   Email: admin@institute.com"
echo "   Password: password123"
echo ""









