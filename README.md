# Institute Schedule Management System

A comprehensive MERN stack application for managing institute schedules with drag-and-drop functionality, conflict detection, and role-based access control.

## Features

- 🎯 **Drag & Drop Scheduling**: Intuitive drag-and-drop interface to assign batches to teacher time slots
- 🔒 **Role-Based Access Control**: Admin, Scheduler, and Teacher roles with appropriate permissions
- ⚠️ **Conflict Detection**: Automatic detection and prevention of scheduling conflicts
- 📊 **Multi-Branch Support**: Manage schedules across different branches
- 📅 **Weekly View**: Navigate through weeks and view schedules
- 🔄 **Undo/Redo**: Revert or reapply scheduling actions
- 📤 **Export**: Export schedules to CSV and PDF formats
- 📝 **Audit Log**: Track all changes with detailed audit trail
- 📱 **Responsive Design**: Mobile-friendly interface with collapsible sidebar

## Tech Stack

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs for password hashing
- Joi for validation

### Frontend
- React 18
- React Router
- React DnD for drag-and-drop
- TailwindCSS for styling
- Axios for API calls
- React Hot Toast for notifications
- Day.js for date handling

## Project Structure

```
├── backend/
│   ├── models/           # Mongoose schemas
│   ├── controllers/      # Route controllers
│   ├── routes/          # Express routes
│   ├── middleware/      # Auth, error handling, validation
│   ├── tests/           # Backend tests
│   ├── scripts/         # Seed script
│   └── server.js        # Express app entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── contexts/    # React contexts (Auth)
│   │   ├── hooks/       # Custom hooks
│   │   ├── pages/       # Page components
│   │   ├── utils/       # Utility functions
│   │   └── test/        # Frontend tests
│   └── vite.config.js
└── README.md
```

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd "Shedule system"
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/schedule-management
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Seed Database

```bash
cd backend
npm run seed
```

This will create:
- Admin user: `admin@institute.com` / `password123`
- Scheduler user: `scheduler@institute.com` / `password123`
- Sample batches and teachers

## Running the Application

### Development Mode

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

- Backend runs on `http://localhost:5000`
- Frontend runs on `http://localhost:3000`

### Production Build

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## Testing

### Backend Tests

```bash
cd backend
npm test
```

### Frontend Tests

```bash
cd frontend
npm test
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Batches
- `GET /api/batches` - Get all batches (Protected)
- `GET /api/batches/:id` - Get single batch (Protected)
- `POST /api/batches` - Create batch (Admin/Scheduler)
- `PUT /api/batches/:id` - Update batch (Admin/Scheduler)
- `DELETE /api/batches/:id` - Delete batch (Admin)

### Teachers
- `GET /api/teachers` - Get all teachers (Protected)
- `GET /api/teachers/:id` - Get single teacher (Protected)
- `POST /api/teachers` - Create teacher (Admin/Scheduler)
- `PUT /api/teachers/:id` - Update teacher (Admin/Scheduler)
- `DELETE /api/teachers/:id` - Delete teacher (Admin)

### Schedule
- `GET /api/schedule` - Get schedule for a week (Protected)
- `POST /api/schedule/check` - Check for conflicts (Protected)
- `POST /api/schedule/assign` - Assign batches to slot (Admin/Scheduler)
- `POST /api/schedule/remove` - Remove batches from slot (Admin/Scheduler)
- `POST /api/schedule/auto-suggest` - Auto-suggest assignments (Admin/Scheduler)

### Export
- `GET /api/schedule/export/csv` - Export schedule as CSV (Protected)
- `GET /api/schedule/export/pdf` - Export schedule as PDF (Protected)

### Audit
- `GET /api/audit` - Get audit logs (Admin/Scheduler)

## Usage

1. **Login**: Use the seeded credentials or register a new account
2. **View Schedule**: Navigate through weeks using the arrow buttons
3. **Drag & Drop**: Select batches from the sidebar and drag them to teacher time slots
4. **Filter**: Use search and filter options to find specific batches or teachers
5. **Export**: Click the Export button to download schedule as CSV or PDF
6. **Audit**: View audit log to see all changes made to the schedule

## Role Permissions

### Admin
- Full access to all features
- Can create, edit, and delete batches and teachers
- Can assign/remove schedules
- Can view audit logs
- Can export schedules

### Scheduler
- Can create and edit batches and teachers
- Can assign/remove schedules
- Can view audit logs
- Can export schedules

### Teacher
- Can view their own schedule
- Read-only access to batches and teachers

## Deployment

### Backend Deployment (Render/Heroku)

1. Create a new web service
2. Connect your repository
3. Set environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `PORT` (auto-set by platform)
   - `FRONTEND_URL` (your frontend URL)
4. Build command: `cd backend && npm install`
5. Start command: `cd backend && npm start`

### Frontend Deployment (Vercel/Netlify)

1. Connect your repository
2. Set build directory to `frontend`
3. Set build command: `cd frontend && npm install && npm run build`
4. Set publish directory: `frontend/dist`
5. Add environment variable:
   - `VITE_API_URL` (your backend API URL)

### MongoDB Atlas Setup

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get connection string
4. Update `MONGODB_URI` in backend `.env`
5. Add your IP address to whitelist

## Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
FRONTEND_URL=https://your-frontend-url.com
```

### Frontend (.env)
```
VITE_API_URL=https://your-backend-url.com/api
```

## Troubleshooting

### MongoDB Connection Issues
- Verify MongoDB is running (if local)
- Check connection string in `.env`
- Ensure network access is configured (if using Atlas)

### CORS Errors
- Verify `FRONTEND_URL` in backend `.env` matches frontend URL
- Check CORS configuration in `server.js`

### Authentication Issues
- Verify JWT_SECRET is set
- Check token expiration settings
- Clear localStorage and re-login

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please create an issue in the repository.









