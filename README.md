# Workload Monitoring System - Fullstack Conversion

Konversi lengkap dari Next.js + PostgreSQL + Prisma ke React.js + Node.js + Express.js + MongoDB

## 📁 Struktur Project

```
workload-monitoring-converted/
├── client/              # Frontend React.js (✅ SELESAI)
│   ├── src/
│   │   ├── components/  # UI components & layouts
│   │   │   ├── ui/      # Reusable UI (Button, Input, Card, etc)
│   │   │   ├── Navbar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/       # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── teamlead/
│   │   │   └── supervisor/
│   │   ├── services/    # API services (axios)
│   │   ├── context/     # React Context (Auth)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── server/              # Backend Express.js (✅ SELESAI)
│   ├── src/
│   │   ├── config/      # Database configuration
│   │   ├── controllers/ # Business logic
│   │   ├── middleware/  # Auth & error handling
│   │   ├── models/      # Mongoose schemas (9 models)
│   │   ├── routes/      # API endpoints
│   │   └── server.js    # Entry point
│   ├── package.json
│   └── .env.example
│
├── PANDUAN_LENGKAP_INDONESIA.txt
├── QUICK_START.txt
└── README.md           # This file
```

## ✅ Status Konversi

### Backend (✅ SELESAI 100%)

- ✅ Express.js server setup
- ✅ MongoDB connection configuration
- ✅ 9 Mongoose models (User, Employee, EmployeeOrganikDetail, EmployeeMitraDetail, Job, JobAssignment, ExperienceType, MitraExperience, OrganikWorkHistory)
- ✅ JWT authentication middleware
- ✅ Error handling middleware
- ✅ Controllers untuk Auth, Employees, Jobs
- ✅ 20+ RESTful API endpoints
- ✅ Documentation (README.md)

### Frontend (✅ SELESAI 100%)

- ✅ Vite + React 18.3 setup
- ✅ React Router 6.26 dengan routing lengkap
- ✅ Tailwind CSS 3.4 untuk styling
- ✅ Axios services untuk API integration
- ✅ AuthContext untuk state management
- ✅ 7 UI components minimalis (Button, Input, Card, Table, Badge, Modal, Loading)
- ✅ 2 Authentication pages (Login, Register)
- ✅ Main Dashboard (pilih role)
- ✅ Team Lead Dashboard dengan job management
- ✅ 3 Job management pages (Create, Select Employee, Finalize)
- ✅ Supervisor Dashboard dengan employee monitoring
- ✅ Responsive design (desktop, tablet, mobile)
- ✅ Documentation (README.md)

## 🚀 Quick Start - Menjalankan Aplikasi

### Prerequisites
- Node.js v18 atau lebih tinggi
- MongoDB (local atau MongoDB Atlas)
- npm atau yarn

### 1. Clone & Setup

```powershell
cd "d:\My Files\PKL BPS Batu\Fauzi\workload-monitoring-converted"
```

### 2. Setup Backend

```powershell
# Masuk ke folder server
cd server

# Install dependencies
npm install

# Copy environment example
copy .env.example .env

# Edit .env dan isi:
# MONGODB_URI=your_mongodb_connection_string
# JWT_SECRET=your_secret_key
# PORT=5000

# Run server
npm run dev
```

Backend akan running di **http://localhost:5000**

### 3. Setup Frontend

Di terminal baru:

```powershell
# Masuk ke folder client
cd client

# Install dependencies
npm install

# Copy environment example
copy .env.example .env

# .env sudah berisi konfigurasi default:
# VITE_API_URL=http://localhost:5000/api

# Run frontend
npm run dev
```

Frontend akan running di **http://localhost:3000**

### 4. Access Application

1. Buka browser: **http://localhost:3000**
2. Register akun baru
3. Login dengan akun yang dibuat
4. Pilih dashboard (Team Lead atau Supervisor)

**Selesai! Aplikasi sudah running** ✅

---

## 📚 Dokumentasi Lengkap

### Untuk Pengguna Bahasa Indonesia:
Baca **PANDUAN_LENGKAP_INDONESIA.txt** untuk:
- Penjelasan detail setiap folder
- Cara kerja authentication
- API endpoints documentation
- Troubleshooting

### Untuk Developer:
- **server/README.md** - Backend documentation
- **client/README.md** - Frontend documentation
- **QUICK_START.txt** - Panduan cepat memulai

---

## 🎯 Fitur Aplikasi

### Authentication
- ✅ User registration dengan validasi
- ✅ Login dengan JWT token
- ✅ Protected routes
- ✅ Auto logout on token expiry

### Team Lead Dashboard
- ✅ Lihat semua pekerjaan (jobs)
- ✅ Statistics cards (total, ongoing, completed)
- ✅ Create job baru
- ✅ Assign employees ke job
- ✅ Finalisasi job
- ✅ Filter jobs by status
- ✅ View job details

### Supervisor Dashboard
- ✅ Lihat semua karyawan
- ✅ Employee statistics
- ✅ Current month salary summary
- ✅ Filter employees by type (Organik/Mitra)
- ✅ Employee status monitoring

---

### 5. Struktur Folder Frontend

Buat folder-folder berikut di `client/src/`:

```
client/src/
├── components/
│   ├── ui/              # Shadcn UI components
│   ├── Header.jsx
│   └── ProtectedRoute.jsx
├── pages/
│   ├── auth/
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── teamlead/
│   │   ├── Dashboard.jsx
│   │   ├── JobCreate.jsx
│   │   ├── JobSelectEmployee.jsx
│   │   └── JobsTable.jsx
│   └── supervisor/
│       ├── Dashboard.jsx
│       └── EmployeeDetail.jsx
├── services/
│   ├── api.js           # Axios instance
│   ├── authService.js
│   ├── employeeService.js
│   └── jobService.js
├── context/
│   └── AuthContext.jsx
├── hooks/
│   └── useAuth.js
├── lib/
│   └── utils.js
├── App.jsx
└── main.jsx
```

### 6. File-file Penting yang Perlu Dibuat

#### `client/src/services/api.js`

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor untuk menambahkan token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor untuk handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

#### `client/src/context/AuthContext.jsx`

```javascript
import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { user, token } = response.data.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    
    return response.data;
  };

  const register = async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    const { user, token } = response.data.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

#### `client/src/App.jsx`

```javascript
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import TeamLeadDashboard from './pages/teamlead/Dashboard';
import SupervisorDashboard from './pages/supervisor/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route
            path="/dashboard/teamlead"
            element={
              <ProtectedRoute>
                <TeamLeadDashboard />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/dashboard/supervisor"
            element={
              <ProtectedRoute>
                <SupervisorDashboard />
              </ProtectedRoute>
            }
          />
          
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
```

## 🏃 Cara Menjalankan Project

### Prerequisites

1. **Node.js** (v18 atau lebih baru)
2. **MongoDB** (local atau MongoDB Atlas)

### Setup & Run

#### 1. Backend (Server)

```powershell
# Masuk ke folder server
cd server

# Install dependencies
npm install

# Copy .env.example ke .env
copy .env.example .env

# Edit .env dan sesuaikan dengan konfigurasi Anda
# Terutama MONGODB_URI

# Run development server
npm run dev
```

Backend akan berjalan di: `http://localhost:5000`

#### 2. Frontend (Client)

```powershell
# Masuk ke folder client (di terminal baru)
cd client

# Install dependencies (jika belum)
npm install

# Run development server
npm run dev
```

Frontend akan berjalan di: `http://localhost:5173`

#### 3. Run Both Concurrently (Setelah frontend dibuat)

Di root folder, buat `package.json`:

```json
{
  "name": "workload-monitoring-fullstack",
  "version": "1.0.0",
  "scripts": {
    "server": "cd server && npm run dev",
    "client": "cd client && npm run dev",
    "dev": "concurrently \"npm run server\" \"npm run client\""
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

Install dan run:

```powershell
npm install
npm run dev
```

## 📋 Mapping Fitur dari Next.js ke React

### Pages Mapping

| Next.js (Original) | React Router (New) | Status |
|--------------------|-------------------|--------|
| `/app/page.tsx` | `/` → redirect to `/login` | ⏳ Perlu dibuat |
| `/app/(auth)/login/page.tsx` | `/login` | ⏳ Perlu dibuat |
| `/app/(auth)/register/page.tsx` | `/register` | ⏳ Perlu dibuat |
| `/app/(teamlead)/dashboard/teamlead/page.tsx` | `/dashboard/teamlead` | ⏳ Perlu dibuat |
| `/app/(teamlead)/jobs/create/page.tsx` | `/jobs/create` | ⏳ Perlu dibuat |
| `/app/(teamlead)/jobs/[jobId]/selectEmployee/page.tsx` | `/jobs/:jobId/select-employee` | ⏳ Perlu dibuat |
| `/app/(supervisor)/dashboard/supervisor/page.tsx` | `/dashboard/supervisor` | ⏳ Perlu dibuat |
| `/app/(supervisor)/dashboard/supervisor/employee/[employeeId]/page.tsx` | `/employees/:employeeId` | ⏳ Perlu dibuat |

### API Calls Mapping

| Next.js | React + Express |
|---------|-----------------|
| `await supabase.from('employees').select()` | `await api.get('/employees')` |
| `await prisma.user.create()` | `await api.post('/auth/register', data)` |
| NextAuth untuk auth | JWT dengan Context API |
| Server Components | Client Components dengan useEffect |

## 🔧 Tips Konversi

### 1. Data Fetching

**Next.js (Old):**
```javascript
const { data } = await supabase.from('employees').select('*');
```

**React (New):**
```javascript
const [employees, setEmployees] = useState([]);

useEffect(() => {
  const fetchEmployees = async () => {
    const response = await api.get('/employees');
    setEmployees(response.data.data);
  };
  fetchEmployees();
}, []);
```

### 2. Authentication

**Next.js (Old):**
```javascript
import { useSession } from 'next-auth/react';
const { data: session } = useSession();
```

**React (New):**
```javascript
import { useAuth } from '../hooks/useAuth';
const { user } = useAuth();
```

### 3. Routing

**Next.js (Old):**
```javascript
import { useRouter } from 'next/navigation';
const router = useRouter();
router.push('/dashboard');
```

**React (New):**
```javascript
import { useNavigate } from 'react-router-dom';
const navigate = useNavigate();
navigate('/dashboard');
```

## 📊 Database Schema Conversion

### PostgreSQL → MongoDB

| PostgreSQL/Prisma | MongoDB/Mongoose | Perubahan |
|-------------------|------------------|-----------|
| UUID primary keys | ObjectId | Auto-generated |
| Foreign keys | References | Manual population needed |
| Enums (native) | Enum strings | Mongoose enum validation |
| Relations (Prisma) | populate() method | Mongoose populate |
| Cascading deletes | Manual cascade | Dalam controller |

### Contoh Perubahan:

**PostgreSQL Schema:**
```prisma
model Employee {
  id              String   @id @default(uuid())
  employee_type   employee_type
  job_assignments job_assignments[]
}
```

**MongoDB Schema:**
```javascript
const employeeSchema = new mongoose.Schema({
  // _id auto-generated
  employee_type: {
    type: String,
    enum: ['Organik', 'Mitra']
  }
  // job_assignments via separate collection dengan reference
});
```

## 🎯 Checklist Lengkap Konversi

### Backend ✅ SELESAI
- [x] Express server setup
- [x] MongoDB connection
- [x] All Mongoose models
- [x] Authentication middleware
- [x] All controllers (Auth, Employee, Job)
- [x] All routes
- [x] Error handling
- [x] Documentation

### Frontend ⏳ DALAM PROSES
- [ ] Create Vite React app
- [ ] Install all dependencies
- [ ] Setup Tailwind CSS
- [ ] Setup React Router
- [ ] Create AuthContext
- [ ] Create API service layer
- [ ] Convert all pages:
  - [ ] Login page
  - [ ] Register page
  - [ ] Team Lead Dashboard
  - [ ] Supervisor Dashboard
  - [ ] Job Create page
  - [ ] Job Select Employee page
  - [ ] Employee Detail page
- [ ] Copy all UI components (shadcn)
- [ ] Testing all features

## 🐛 Troubleshooting

### Backend Issues

**MongoDB tidak connect:**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
Solution: Install dan jalankan MongoDB, atau gunakan MongoDB Atlas

**JWT Error:**
```
Error: jwt must be provided
```
Solution: Pastikan token ada di header `Authorization: Bearer <token>`

### Frontend Issues

**CORS Error:**
```
Access to XMLHttpRequest blocked by CORS policy
```
Solution: Pastikan backend `cors` dikonfigurasi untuk accept `http://localhost:5173`

**API Error 401:**
```
Unauthorized
```
Solution: Token expired atau tidak valid, login ulang

## 📞 Support

Jika ada pertanyaan atau issue, silakan check:

1. Backend README: `server/README.md`
2. Console logs untuk error details
3. Network tab di browser DevTools
4. MongoDB logs

## 📝 Notes

- Project ini adalah konversi LENGKAP dari Next.js + PostgreSQL ke React + MongoDB
- Semua fitur dari project asli dipertahankan
- API menggunakan RESTful convention
- Authentication menggunakan JWT
- Database structure disesuaikan dari relational ke document-based
- Frontend menggunakan Vite untuk faster development

## 🚀 Next Steps

1. ✅ Backend sudah SELESAI dan siap digunakan
2. ⏳ Buat frontend React sesuai instruksi di atas
3. ⏳ Test semua endpoint dengan frontend
4. ⏳ Deploy ke production (optional)

---

**Created:** November 12, 2025  
**Tech Stack:** React.js + Node.js + Express.js + MongoDB  
**Original:** Next.js + PostgreSQL + Prisma + Supabase
