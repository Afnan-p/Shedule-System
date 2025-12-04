# Quick Start Guide

## Prerequisites
- Node.js v16+
- MongoDB (local or Atlas)

## Setup (5 minutes)

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI
npm run seed  # Creates admin, scheduler, sample data
npm run dev   # Starts on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
# Create .env file with: VITE_API_URL=http://localhost:5000/api
npm run dev   # Starts on http://localhost:3000
```

### 3. Login
- Admin: `admin@institute.com` / `password123`
- Scheduler: `scheduler@institute.com` / `password123`

## Key Features

### Drag & Drop
1. Select batch(es) from left sidebar
2. Drag to teacher time slot
3. Automatic conflict detection
4. Real-time updates

### Filters
- Search batches by name
- Filter by subject
- Filter by branch
- Multi-select batches

### Export
- Click "Export" button in TopBar
- Downloads CSV with current week schedule

### Undo/Redo
- Undo/Redo buttons in TopBar
- Tracks last assignment/removal actions

## Project Structure

```
backend/
├── models/          # User, Batch, Teacher, ScheduleItem, AuditLog
├── controllers/     # Business logic
├── routes/         # API endpoints
├── middleware/     # Auth, validation, error handling
├── tests/          # Jest + Supertest tests
└── scripts/        # Seed script

frontend/
├── src/
│   ├── components/ # React components
│   ├── contexts/   # AuthContext
│   ├── hooks/      # useSchedule hook
│   ├── pages/      # Dashboard, Login, AuditLog
│   └── utils/      # API client
└── tests/          # Vitest + React Testing Library
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Current user

### Schedule
- `GET /api/schedule` - Get week schedule
- `POST /api/schedule/assign` - Assign batches
- `POST /api/schedule/remove` - Remove batches
- `POST /api/schedule/check` - Check conflicts
- `POST /api/schedule/auto-suggest` - Auto-suggest

### Export
- `GET /api/schedule/export/csv` - Export CSV
- `GET /api/schedule/export/pdf` - Export PDF

## Testing

### Backend
```bash
cd backend
npm test
```

### Frontend
```bash
cd frontend
npm test
```

## Deployment

### Backend (Render/Heroku)
1. Set env vars: `MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL`
2. Build: `cd backend && npm install`
3. Start: `cd backend && npm start`

### Frontend (Vercel/Netlify)
1. Set env var: `VITE_API_URL`
2. Build command: `cd frontend && npm install && npm run build`
3. Publish: `frontend/dist`

## Common Issues

**MongoDB Connection Failed**
- Check `.env` file has correct `MONGODB_URI`
- Verify MongoDB is running (if local)
- Check network access (if Atlas)

**CORS Errors**
- Set `FRONTEND_URL` in backend `.env`
- Match exact frontend URL (including protocol)

**Auth Not Working**
- Check `JWT_SECRET` is set
- Verify token in localStorage
- Check token expiration

## Next Steps

1. Customize batch/teacher data
2. Adjust time slots in `ScheduleGrid.jsx`
3. Add more subjects/branches
4. Customize UI colors in Tailwind config
5. Add email notifications
6. Implement real-time updates with WebSockets









