# PowerShell Setup Script for Windows
# Run this script to automatically set up both backend and frontend

Write-Host "🚀 Setting up Institute Schedule Management System..." -ForegroundColor Green
Write-Host ""

# Check if Node.js is installed
Write-Host "📦 Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found! Please install Node.js v16 or higher." -ForegroundColor Red
    Write-Host "   Download from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Setup Backend
Write-Host ""
Write-Host "🔧 Setting up Backend..." -ForegroundColor Yellow
Set-Location backend

# Install backend dependencies
Write-Host "   Installing backend dependencies..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install backend dependencies" -ForegroundColor Red
    exit 1
}

# Create backend .env file if not exists
if (-not (Test-Path .env)) {
    Write-Host "   Creating backend .env file..." -ForegroundColor Cyan
    @"
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/schedule-management
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
"@ | Out-File -FilePath .env -Encoding utf8
    Write-Host "   ✅ Created backend/.env" -ForegroundColor Green
} else {
    Write-Host "   ✅ backend/.env already exists" -ForegroundColor Green
}

Set-Location ..

# Setup Frontend
Write-Host ""
Write-Host "🎨 Setting up Frontend..." -ForegroundColor Yellow
Set-Location frontend

# Install frontend dependencies
Write-Host "   Installing frontend dependencies..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
    exit 1
}

# Create frontend .env file if not exists
if (-not (Test-Path .env)) {
    Write-Host "   Creating frontend .env file..." -ForegroundColor Cyan
    @"
VITE_API_URL=http://localhost:5000/api
"@ | Out-File -FilePath .env -Encoding utf8
    Write-Host "   ✅ Created frontend/.env" -ForegroundColor Green
} else {
    Write-Host "   ✅ frontend/.env already exists" -ForegroundColor Green
}

Set-Location ..

# Summary
Write-Host ""
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Make sure MongoDB is running (local or Atlas)" -ForegroundColor Cyan
Write-Host "2. Seed the database (run once):" -ForegroundColor Cyan
Write-Host "   cd backend" -ForegroundColor White
Write-Host "   npm run seed" -ForegroundColor White
Write-Host ""
Write-Host "3. Start Backend (Terminal 1):" -ForegroundColor Cyan
Write-Host "   cd backend" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "4. Start Frontend (Terminal 2):" -ForegroundColor Cyan
Write-Host "   cd frontend" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "5. Open browser:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   Backend Health: http://localhost:5000/api/health" -ForegroundColor White
Write-Host ""
Write-Host "6. Login with:" -ForegroundColor Cyan
Write-Host "   Email: admin@institute.com" -ForegroundColor White
Write-Host "   Password: password123" -ForegroundColor White
Write-Host ""









