# Network Error: ERR_CONNECTION_REFUSED - Fix Guide

## Problem
Frontend cannot connect to backend at `http://localhost:5000`

**Error**: `ERR_CONNECTION_REFUSED` or `Network Error`

## Quick Fix Steps

### 1. Check Backend is Running

Open a new terminal and run:
```bash
cd backend
npm run dev
```

You should see:
```
Server running in development mode on port 5000
MongoDB Connected: ...
```

**If you see errors**, check below.

### 2. Verify Backend Port

Backend should be running on **port 5000**. 

Check if port 5000 is in use:
```bash
# Windows PowerShell
netstat -ano | findstr :5000

# If port is in use, kill the process or change PORT in backend/.env
```

### 3. Create Backend .env File

Create `backend/.env` file with:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/schedule-management
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

### 4. Create Frontend .env File

Create `frontend/.env` file with:
```env
VITE_API_URL=http://localhost:5000/api
```

**Important**: Restart frontend dev server after creating/editing .env file!

### 5. Test Backend Connection

Open browser or use curl:
```bash
# Check if backend is running
curl http://localhost:5000/api/health

# Should return:
# {"success":true,"message":"Server is running","timestamp":"..."}
```

Or open in browser: `http://localhost:5000/api/health`

### 6. Install Dependencies

If backend isn't starting:
```bash
cd backend
npm install
```

If frontend isn't working:
```bash
cd frontend
npm install
```

## Common Issues

### Issue 1: MongoDB Not Running

**Error**: `MongoDB connection failed` or `MongooseServerSelectionError`

**Solution**:
```bash
# Start MongoDB (if installed locally)
# Windows: Check Services and start MongoDB
# Mac/Linux: brew services start mongodb-community

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in backend/.env to Atlas connection string
```

### Issue 2: Port Already in Use

**Error**: `EADDRINUSE: address already in use :::5000`

**Solution**:
```bash
# Windows PowerShell - Kill process on port 5000
netstat -ano | findstr :5000
# Note the PID number
taskkill /PID <PID_NUMBER> /F

# Or change PORT in backend/.env to another port (e.g., 5001)
# Then update frontend/.env VITE_API_URL accordingly
```

### Issue 3: CORS Error

**Error**: `CORS policy` or `Access-Control-Allow-Origin`

**Solution**:
- Ensure `FRONTEND_URL=http://localhost:3000` in `backend/.env`
- Restart backend server
- Clear browser cache

### Issue 4: .env File Not Loaded

**Error**: Variables undefined or using defaults

**Solution**:
- Ensure `.env` file is in correct location:
  - `backend/.env` (not `backend/env` or root)
  - `frontend/.env` (not `frontend/env` or root)
- Restart dev servers after creating/editing .env
- Check file doesn't have extra spaces or quotes

### Issue 5: Frontend Not Using .env

**Solution**:
- Vite requires `.env` file (not `.env.local`)
- Variable names must start with `VITE_` for frontend
- Actually, for API URL, we're using `VITE_API_URL`
- Restart frontend dev server after changing .env

## Step-by-Step Setup (Complete)

### Terminal 1 - Backend
```bash
cd backend

# Install dependencies
npm install

# Create .env file (if not exists)
# Copy content from above

# Seed database (first time only)
npm run seed

# Start backend
npm run dev
```

**Expected output**:
```
MongoDB Connected: ...
Server running in development mode on port 5000
```

### Terminal 2 - Frontend
```bash
cd frontend

# Install dependencies
npm install

# Create .env file (if not exists)
echo "VITE_API_URL=http://localhost:5000/api" > .env

# Start frontend
npm run dev
```

**Expected output**:
```
VITE v4.x.x  ready in xxx ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

### Terminal 3 - Test (Optional)
```bash
# Test backend health
curl http://localhost:5000/api/health

# Test login (after seeding)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@institute.com\",\"password\":\"password123\"}"
```

## Verify Everything Works

1. ✅ Backend terminal shows: "Server running on port 5000"
2. ✅ Frontend terminal shows: "Local: http://localhost:3000/"
3. ✅ Browser: `http://localhost:5000/api/health` returns JSON
4. ✅ Browser: `http://localhost:3000` shows login page
5. ✅ Login with: `admin@institute.com` / `password123`

## Still Not Working?

### Check Browser Console
1. Open DevTools (F12)
2. Go to Network tab
3. Try to login
4. Check if request to `http://localhost:5000/api/auth/login` shows
5. If request shows, check status code and response

### Check Backend Logs
Look at backend terminal for:
- Error messages
- Request logs
- MongoDB connection status

### Common Errors in Logs

**"Cannot find module"**:
```bash
npm install
```

**"EACCES" or permission error**:
```bash
# Use different port
PORT=5001
```

**"MongoServerError"**:
- Check MongoDB is running
- Verify MONGODB_URI is correct
- Check network/firewall settings (if using Atlas)

## Quick Test Commands

```bash
# 1. Check Node version (need v16+)
node --version

# 2. Check MongoDB
mongosh --version
# Or try connecting
mongosh mongodb://localhost:27017/schedule-management

# 3. Check ports
netstat -ano | findstr :5000
netstat -ano | findstr :3000

# 4. Check if backend process is running
# Windows Task Manager -> Details -> node.exe
```

## Need Help?

If still having issues, provide:
1. Backend terminal output
2. Frontend terminal output
3. Browser console errors
4. Browser network tab (screenshot)
5. Contents of backend/.env (without secrets)
6. Contents of frontend/.env









