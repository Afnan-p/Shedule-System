# Login Issue Fix Guide

## Possible Issues and Solutions

### 1. Database Not Seeded
**Problem**: No users exist in the database.

**Solution**:
```bash
cd backend
npm run seed
```

This creates:
- Admin: `admin@institute.com` / `password123`
- Scheduler: `scheduler@institute.com` / `password123`

### 2. Backend Not Running
**Problem**: Frontend can't connect to backend API.

**Solution**:
```bash
cd backend
npm run dev
```

Check if backend is running on `http://localhost:5000`

### 3. MongoDB Connection Failed
**Problem**: Backend can't connect to MongoDB.

**Solution**:
- Check `.env` file in `backend/` folder
- Verify `MONGODB_URI` is correct
- If using local MongoDB: `mongodb://localhost:27017/schedule-management`
- If using Atlas: `mongodb+srv://username:password@cluster.mongodb.net/database`

### 4. CORS Issues
**Problem**: Frontend blocked by CORS.

**Solution**:
- Check `backend/.env` has `FRONTEND_URL=http://localhost:3000`
- Restart backend server after changing `.env`

### 5. JWT Secret Not Set
**Problem**: Token generation fails.

**Solution**:
Add to `backend/.env`:
```
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

### 6. Test Users Exist
**Quick Check**:
```bash
cd backend
npm run test-login
```

This will show all users in database.

### 7. Frontend API URL Wrong
**Problem**: Frontend pointing to wrong API.

**Solution**:
- Create `frontend/.env` file:
```
VITE_API_URL=http://localhost:5000/api
```
- Restart frontend dev server

## Step-by-Step Debugging

1. **Check Backend is Running**:
   ```bash
   curl http://localhost:5000/api/health
   ```
   Should return: `{"success":true,"message":"Server is running"}`

2. **Check Users Exist**:
   ```bash
   cd backend
   npm run test-login
   ```

3. **Check MongoDB**:
   ```bash
   # If using local MongoDB
   mongosh
   use schedule-management
   db.users.find()
   ```

4. **Test Login API Directly**:
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@institute.com","password":"password123"}'
   ```

5. **Check Browser Console**:
   - Open browser DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for API calls

6. **Check Backend Logs**:
   - Look at terminal where backend is running
   - Check for error messages

## Common Error Messages

- **"Invalid credentials"**: Wrong email/password or user doesn't exist
- **"Network Error"**: Backend not running or CORS issue
- **"Token not found"**: JWT_SECRET not set
- **"MongoDB connection failed"**: MongoDB URI wrong or MongoDB not running

## Quick Fix Commands

```bash
# 1. Setup backend
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT_SECRET
npm run seed

# 2. Setup frontend
cd ../frontend
npm install
# Create .env with VITE_API_URL=http://localhost:5000/api

# 3. Start both
# Terminal 1:
cd backend && npm run dev

# Terminal 2:
cd frontend && npm run dev

# 4. Login
# Email: admin@institute.com
# Password: password123
```

## Still Not Working?

1. Clear browser localStorage:
   - Open DevTools (F12)
   - Application tab → Local Storage → Clear all

2. Check all environment variables are set correctly

3. Make sure ports 3000 and 5000 are not in use

4. Try creating a new user via register endpoint:
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test User",
       "email": "test@test.com",
       "password": "test123",
       "role": "admin",
       "branch": "CS"
     }'
   ```

5. Check backend server logs for detailed error messages









