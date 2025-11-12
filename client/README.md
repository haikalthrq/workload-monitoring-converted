# Workload Monitoring - Frontend (React)

Frontend aplikasi Workload Monitoring BPS Batu menggunakan React.js dengan Vite.

## 🚀 Tech Stack

- **React 18.3** - UI Library
- **Vite 5.3** - Build Tool & Dev Server
- **React Router 6.26** - Client-side Routing
- **Axios 1.7** - HTTP Client
- **Tailwind CSS 3.4** - Utility-first CSS Framework

## 📦 Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup Environment Variables**
   ```bash
   # Copy .env.example to .env
   copy .env.example .env
   ```

   Edit `.env` file:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

## 🏃 Running the Application

### Development Mode
```bash
npm run dev
```
Application will run on `http://localhost:3000`

### Production Build
```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
client/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable components
│   │   ├── ui/         # UI components (Button, Input, Card, etc)
│   │   ├── Navbar.jsx
│   │   └── ProtectedRoute.jsx
│   ├── context/        # React Context
│   │   └── AuthContext.jsx
│   ├── pages/          # Page components
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── teamlead/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CreateJob.jsx
│   │   │   ├── SelectEmployee.jsx
│   │   │   └── FinalizeJob.jsx
│   │   └── supervisor/
│   │       └── Dashboard.jsx
│   ├── services/       # API services
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── employeeService.js
│   │   └── jobService.js
│   ├── App.jsx         # Main app component
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── .env.example
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 🎨 Features

### Authentication
- ✅ User Registration
- ✅ User Login
- ✅ JWT Token Authentication
- ✅ Protected Routes
- ✅ Auto Logout on Token Expiry

### Team Lead Dashboard
- ✅ View All Jobs with Statistics
- ✅ Create New Job
- ✅ Assign Employees to Job
- ✅ Finalize Job
- ✅ Filter Jobs by Status
- ✅ View Job Details

### Supervisor Dashboard
- ✅ View All Employees
- ✅ Employee Statistics
- ✅ Current Month Salary Summary
- ✅ Filter Employees by Type

## 🎯 User Flow

### 1. Registration & Login
1. User registers at `/register`
2. User logs in at `/login`
3. Redirected to main dashboard

### 2. Team Lead Workflow
1. Go to Team Lead Dashboard
2. Click "Create New Job"
3. Fill job details → Save as DRAFT
4. Select employees to assign
5. Finalize job → Status becomes FINALIZED

### 3. Supervisor Workflow
1. Go to Supervisor Dashboard
2. View employee list and statistics
3. Check current month salary summary

## 🔧 Configuration

### Vite Config (`vite.config.js`)
- Dev server port: 3000
- Proxy `/api` to backend (http://localhost:5000)

### Tailwind Config (`tailwind.config.js`)
- Custom primary color theme
- Extended color palette

## 🌐 API Integration

All API calls go through `services/api.js` which:
- Adds JWT token to requests
- Handles 401 (unauthorized) responses
- Redirects to login on authentication failure

### Available Services

**authService.js**
- `register(userData)`
- `login(credentials)`
- `logout()`
- `getCurrentUser()`

**employeeService.js**
- `getAll(params)`
- `getById(id)`
- `create(employeeData)`
- `update(id, employeeData)`
- `delete(id)`
- `getCurrentMonthSalary()`

**jobService.js**
- `getAll(params)`
- `getById(id)`
- `create(jobData)`
- `update(id, jobData)`
- `delete(id)`
- `assignEmployees(jobId, employeeIds)`
- `unassignEmployee(jobId, employeeId)`

## 📱 Responsive Design

The application is fully responsive:
- ✅ Desktop (1024px+)
- ✅ Tablet (768px - 1023px)
- ✅ Mobile (< 768px)

## 🎨 UI Components

All UI components are built with **Tailwind CSS** for a modern, minimalist look:

- **Button** - Multiple variants (primary, secondary, outline, ghost, danger)
- **Input** - With label and error message support
- **Card** - Container with optional title
- **Table** - Responsive table with empty state
- **Badge** - Status indicators
- **Modal** - Overlay dialogs
- **Loading** - Spinner components

## 🔐 Security

- JWT token stored in localStorage
- Automatic token inclusion in API requests
- Protected routes require authentication
- Auto logout on token expiry

## 📝 Notes

- Make sure backend server is running on `http://localhost:5000`
- All dates are formatted in Indonesian locale (id-ID)
- Currency formatted as Indonesian Rupiah (IDR)

## 🚀 Next Steps

After setup, you can:
1. Start the backend server (see `../server/README.md`)
2. Start this frontend dev server with `npm run dev`
3. Open browser at `http://localhost:3000`
4. Register a new account or login

## 📞 Support

For issues or questions, please refer to the main project documentation in the root folder.
