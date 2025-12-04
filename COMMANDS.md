# 📋 Complete Backend & Frontend Commands

## 🚀 Quick Start (Complete Setup)

### Step 1: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file (if not exists)
# Windows PowerShell:
@"
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/schedule-management
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
"@ | Out-File -FilePath .env -Encoding utf8

# Seed database (creates admin and sample data)
npm run seed

# Start backend server (development mode)
npm run dev
```

**Expected Output:**
```
MongoDB Connected: ...
Server running in development mode on port 5000
```

### Step 2: Frontend Setup

**Open NEW Terminal/PowerShell Window:**

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file (if not exists)
# Windows PowerShell:
@"
VITE_API_URL=http://localhost:5000/api
"@ | Out-File -FilePath .env -Encoding utf8

# Start frontend server (development mode)
npm run dev
```

**Expected Output:**
```
VITE v4.x.x  ready in xxx ms
➜  Local:   http://localhost:3000/
```

---

## 🔧 Backend Commands

### Development Commands

```bash
cd backend

# Start development server (with auto-reload)
npm run dev

# Start production server
npm start

# Install dependencies
npm install

# Run database seed script (creates users, batches, teachers)
npm run seed

# Test login/users in database
npm run test-login
```

### Testing Commands

```bash
cd backend

# Run all tests
npm test

# Run tests with coverage
NODE_ENV=test npm test
```

### Environment Variables (.env)

Create `backend/.env` file:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/schedule-management
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

**For MongoDB Atlas (Cloud):**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/schedule-management
```

---

## 🎨 Frontend Commands

### Development Commands

```bash
cd frontend

# Start development server
npm run dev

# Install dependencies
npm install

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Testing Commands

```bash
cd frontend

# Run tests
npm test

# Run tests in watch mode
npm test -- --watch
```

### Environment Variables (.env)

Create `frontend/.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

**For Production:**
```env
VITE_API_URL=https://your-backend-url.com/api
```

---

## 📝 Complete Setup Scripts

### Windows PowerShell - Full Setup

**Backend Setup:**
```powershell
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
@"
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/schedule-management
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
"@ | Out-File -FilePath .env -Encoding utf8

# Seed database
npm run seed

# Start server (keep this terminal open)
npm run dev
```

**Frontend Setup (New Terminal):**
```powershell
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create .env file
@"
VITE_API_URL=http://localhost:5000/api
"@ | Out-File -FilePath .env -Encoding utf8

# Start server (keep this terminal open)
npm run dev
```

### Linux/Mac - Full Setup

**Backend Setup:**
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/schedule-management
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
EOF

# Seed database
npm run seed

# Start server (keep this terminal open)
npm run dev
```

**Frontend Setup (New Terminal):**
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
VITE_API_URL=http://localhost:5000/api
EOF

# Start server (keep this terminal open)
npm run dev
```

---

## 🧪 Testing Commands

### Backend API Testing

```bash
# Test backend health
curl http://localhost:5000/api/health

# Test login API
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@institute.com\",\"password\":\"password123\"}"

# Test with token
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### PowerShell - Test Commands

```powershell
# Test backend health
Invoke-WebRequest -Uri http://localhost:5000/api/health | Select-Object -ExpandProperty Content

# Test login
$body = @{
    email = "admin@institute.com"
    password = "password123"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:5000/api/auth/login `
  -Method POST `
  -ContentType "application/json" `
  -Body $body | Select-Object -ExpandProperty Content
```

---

## 🗄️ Database Commands

### MongoDB Commands

```bash
# Connect to MongoDB (if local)
mongosh mongodb://localhost:27017/schedule-management

# Or using mongosh directly
mongosh
use schedule-management

# Check collections
show collections

# View users
db.users.find().pretty()

# View batches
db.batches.find().pretty()

# View teachers
db.teachers.find().pretty()

# View schedule items
db.scheduleitems.find().pretty()

# Clear all data (careful!)
db.users.deleteMany({})
db.batches.deleteMany({})
db.teachers.deleteMany({})
db.scheduleitems.deleteMany({})
db.auditlogs.deleteMany({})

# Re-seed database
# Exit mongosh, then:
cd backend
npm run seed
```

---

## 🔍 Troubleshooting Commands

### Check if Servers are Running

```powershell
# Check if port 5000 is in use (backend)
netstat -ano | findstr :5000

# Check if port 3000 is in use (frontend)
netstat -ano | findstr :3000

# Kill process on port 5000 (Windows)
netstat -ano | findstr :5000
# Note the PID from output, then:
taskkill /PID <PID_NUMBER> /F

# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
# Note the PID from output, then:
taskkill /PID <PID_NUMBER> /F
```

### Check Node Version

```bash
node --version
# Should be v16 or higher
```

### Check MongoDB Connection

```bash
# Test MongoDB connection string
mongosh "mongodb://localhost:27017/schedule-management"

# Or test Atlas connection
mongosh "mongodb+srv://username:password@cluster.mongodb.net/schedule-management"
```

### Clear npm Cache

```bash
npm cache clean --force
```

### Reinstall Dependencies

```bash
# Backend
cd backend
rm -rf node_modules
rm package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules
rm package-lock.json
npm install
```

---

## 📦 Production Build Commands

### Backend Production

```bash
cd backend

# Ensure .env has production values
# NODE_ENV=production
# MONGODB_URI=<production-mongodb-uri>
# JWT_SECRET=<production-secret>

# Start production server
npm start

# Or use PM2 (if installed)
pm2 start server.js --name schedule-backend
pm2 save
pm2 startup
```

### Frontend Production

```bash
cd frontend

# Build for production
npm run build

# Preview production build locally
npm run preview

# Output will be in frontend/dist directory
# Deploy dist/ folder to Vercel/Netlify/etc.
```

---

## 🚀 Complete Startup Sequence

### First Time Setup:

```bash
# 1. Backend setup
cd backend
npm install
# Create .env file manually or use script above
npm run seed
npm run dev

# 2. Frontend setup (new terminal)
cd frontend
npm install
# Create .env file manually or use script above
npm run dev

# 3. Open browser
# Backend: http://localhost:5000/api/health
# Frontend: http://localhost:3000
# Login: admin@institute.com / password123
```

### Daily Startup:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

---

## 📋 Package.json Scripts Reference

### Backend (backend/package.json)

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "NODE_ENV=test jest --coverage",
    "seed": "node scripts/seed.js",
    "test-login": "node scripts/test-login.js"
  }
}
```

### Frontend (frontend/package.json)

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "lint": "eslint . --ext js,jsx"
  }
}
```

---

## 🎯 Quick Reference

| Task | Backend | Frontend |
|------|---------|----------|
| Install | `npm install` | `npm install` |
| Start Dev | `npm run dev` | `npm run dev` |
| Start Prod | `npm start` | `npm run build` then `npm run preview` |
| Test | `npm test` | `npm test` |
| Seed Data | `npm run seed` | N/A |
| Port | 5000 | 3000 |
| .env File | `backend/.env` | `frontend/.env` |

---

## ✅ Verification Checklist

After running all commands, verify:

- [ ] Backend terminal shows "Server running on port 5000"
- [ ] Frontend terminal shows "Local: http://localhost:3000/"
- [ ] Browser: `http://localhost:5000/api/health` returns JSON
- [ ] Browser: `http://localhost:3000` shows login page
- [ ] Can login with: `admin@institute.com` / `password123`

---

## 🆘 Need Help?

- See `START.md` for quick start guide
- See `TROUBLESHOOTING.md` for common issues
- See `FIX_NETWORK_ERROR.md` for connection errors
- See `README.md` for full documentation









