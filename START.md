# 🚀 Quick Start Guide

## ⚠️ IMPORTANT: Network Error Fix

If you're seeing **"ERR_CONNECTION_REFUSED"** or **"Network Error"**, it means the **backend server is not running**!

## ✅ Step-by-Step Startup

### Terminal 1: Start Backend

```bash
cd backend

# 1. Install dependencies (first time only)
npm install

# 2. Create .env file (if not exists)
# Copy from .env.example or create with:
# PORT=5000
# NODE_ENV=development
# MONGODB_URI=mongodb://localhost:27017/schedule-management
# JWT_SECRET=your-super-secret-jwt-key-change-in-production
# JWT_EXPIRE=7d
# FRONTEND_URL=http://localhost:3000

# 3. Seed database (first time only)
npm run seed

# 4. Start backend server
npm run dev
```

**✅ You should see:**
```
MongoDB Connected: ...
Server running in development mode on port 5000
```

**❌ If you see errors:**
- **MongoDB error**: Make sure MongoDB is running
- **Port in use**: Change PORT in .env or kill the process using port 5000
- **Module not found**: Run `npm install` again

### Terminal 2: Start Frontend

```bash
cd frontend

# 1. Install dependencies (first time only)
npm install

# 2. Create .env file (if not exists)
# Create frontend/.env with:
# VITE_API_URL=http://localhost:5000/api

# 3. Start frontend
npm run dev
```

**✅ You should see:**
```
VITE v4.x.x  ready in xxx ms

➜  Local:   http://localhost:3000/
```

### Terminal 3: Test (Optional)

Open browser and go to:
- **Backend Health Check**: http://localhost:5000/api/health
  - Should return: `{"success":true,"message":"Server is running",...}`
  
- **Frontend**: http://localhost:3000
  - Should show login page

## 🔑 Login Credentials

After running `npm run seed` in backend:

- **Admin**: 
  - Email: `admin@institute.com`
  - Password: `password123`

- **Scheduler**:
  - Email: `scheduler@institute.com`
  - Password: `password123`

## ⚡ Quick Test

### Test Backend is Running:

```bash
# Windows PowerShell
curl http://localhost:5000/api/health

# Or open in browser:
# http://localhost:5000/api/health
```

Should return JSON with `"success": true`

### Test Login API:

```bash
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@institute.com\",\"password\":\"password123\"}"
```

## ❌ Common Issues

### 1. "ERR_CONNECTION_REFUSED"

**Cause**: Backend not running

**Fix**: 
- Open a terminal
- `cd backend`
- `npm run dev`
- Wait for "Server running on port 5000"

### 2. "MongoDB connection failed"

**Cause**: MongoDB not running

**Fix**:
- **Local MongoDB**: Start MongoDB service
  - Windows: Open Services → Start MongoDB
  - Mac: `brew services start mongodb-community`
  - Linux: `sudo systemctl start mongod`
- **MongoDB Atlas**: Update `MONGODB_URI` in `.env` with Atlas connection string

### 3. "Port 5000 already in use"

**Fix**:
```bash
# Windows PowerShell
netstat -ano | findstr :5000
# Note the PID
taskkill /PID <PID_NUMBER> /F

# Or change PORT in backend/.env to 5001
# Then update frontend/.env VITE_API_URL to http://localhost:5001/api
```

### 4. "Module not found"

**Fix**:
```bash
cd backend
npm install

cd ../frontend
npm install
```

### 5. Frontend still shows Network Error after starting backend

**Fix**:
1. Check backend is actually running (see Terminal 1)
2. Check browser console → Network tab → See if request is made
3. Verify `VITE_API_URL` in `frontend/.env` is correct
4. **Restart frontend dev server** after creating/changing .env

## 📝 Checklist

Before trying to login, verify:

- [ ] Backend terminal shows "Server running on port 5000"
- [ ] Frontend terminal shows "Local: http://localhost:3000/"
- [ ] Browser can access http://localhost:5000/api/health
- [ ] `backend/.env` file exists with correct values
- [ ] `frontend/.env` file exists with `VITE_API_URL=http://localhost:5000/api`
- [ ] MongoDB is running (or Atlas connection is correct)
- [ ] Database is seeded (`npm run seed` completed successfully)

## 🎯 Still Having Issues?

1. **Check both terminals are running**
   - Backend: Should show server running
   - Frontend: Should show Vite dev server

2. **Check .env files exist**
   - `backend/.env` ✓
   - `frontend/.env` ✓

3. **Clear browser cache**
   - Ctrl+Shift+Delete → Clear cache
   - Or use Incognito/Private window

4. **Check ports are free**
   - Port 5000 (backend)
   - Port 3000 (frontend)

5. **See TROUBLESHOOTING.md for detailed help**









