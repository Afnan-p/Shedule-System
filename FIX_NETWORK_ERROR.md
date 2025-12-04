# 🔧 Fix: ERR_CONNECTION_REFUSED Error

## Problem
You're seeing: `ERR_CONNECTION_REFUSED` or `Network Error`

**This means**: Backend server is **NOT running**!

## ✅ Solution (Follow These Steps)

### Step 1: Create .env Files (If Not Exists)

I've automatically created:
- ✅ `backend/.env`
- ✅ `frontend/.env`

**If they don't exist**, create them manually:

**backend/.env**:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/schedule-management
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

**frontend/.env**:
```env
VITE_API_URL=http://localhost:5000/api
```

### Step 2: Start Backend Server

**Open Terminal 1** (PowerShell/Command Prompt):

```bash
cd backend
npm run dev
```

**Wait until you see**:
```
MongoDB Connected: ...
Server running in development mode on port 5000
```

**✅ DO NOT CLOSE THIS TERMINAL!**

### Step 3: Start Frontend Server

**Open Terminal 2** (New PowerShell/Command Prompt):

```bash
cd frontend
npm run dev
```

**Wait until you see**:
```
VITE v4.x.x  ready in xxx ms
➜  Local:   http://localhost:3000/
```

**✅ DO NOT CLOSE THIS TERMINAL!**

### Step 4: Test Backend

Open browser and go to:
```
http://localhost:5000/api/health
```

Should return:
```json
{"success":true,"message":"Server is running","timestamp":"..."}
```

**If you see this, backend is running correctly! ✅**

### Step 5: Test Frontend

Open browser and go to:
```
http://localhost:3000
```

Should show the login page.

### Step 6: Login

Use these credentials:
- **Email**: `admin@institute.com`
- **Password**: `password123`

**First time?** Run seed script:
```bash
cd backend
npm run seed
```

## ⚠️ Common Issues

### Issue 1: "MongoDB connection failed"

**Solution**:
- Make sure MongoDB is running
  - Windows: Check Services → MongoDB should be running
  - Or use MongoDB Atlas (cloud)
- Update `MONGODB_URI` in `backend/.env` with your MongoDB connection string

### Issue 2: "Port 5000 already in use"

**Solution**:
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with number from above)
taskkill /PID <PID_NUMBER> /F

# Or change PORT in backend/.env to 5001
# And update frontend/.env VITE_API_URL to http://localhost:5001/api
```

### Issue 3: Backend starts but frontend still shows error

**Solution**:
1. ✅ Verify backend is running (check Terminal 1)
2. ✅ Check `http://localhost:5000/api/health` in browser works
3. ✅ Verify `frontend/.env` exists with correct `VITE_API_URL`
4. ✅ **Restart frontend dev server** (Ctrl+C, then `npm run dev` again)

### Issue 4: "Module not found"

**Solution**:
```bash
cd backend
npm install

cd ../frontend
npm install
```

## 📋 Quick Checklist

Before trying to login:

- [ ] Backend terminal shows "Server running on port 5000"
- [ ] Frontend terminal shows "Local: http://localhost:3000/"
- [ ] Browser can access `http://localhost:5000/api/health` (returns JSON)
- [ ] `backend/.env` file exists
- [ ] `frontend/.env` file exists
- [ ] MongoDB is running (or using Atlas)
- [ ] Database is seeded (`npm run seed`)

## 🎯 Test Backend is Running

Open new PowerShell and run:
```powershell
curl http://localhost:5000/api/health
```

Or open in browser:
```
http://localhost:5000/api/health
```

**If this works**, backend is running! ✅
**If this fails**, backend is NOT running. Start it in Terminal 1!

## 💡 Remember

**You need BOTH terminals running at the same time:**

1. **Terminal 1**: Backend (`cd backend && npm run dev`)
2. **Terminal 2**: Frontend (`cd frontend && npm run dev`)

**Keep both terminals open while using the app!**

## 🆘 Still Having Issues?

1. Check both terminals for error messages
2. Check browser console (F12) → Console tab for errors
3. Check browser console (F12) → Network tab → See if requests are being made
4. Verify `.env` files exist and have correct values
5. Try clearing browser cache (Ctrl+Shift+Delete)

See `TROUBLESHOOTING.md` for more detailed help!

