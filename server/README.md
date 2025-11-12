# Workload Monitoring System - Backend API

Backend API untuk sistem monitoring beban kerja pegawai BPS Batu menggunakan Node.js, Express.js, dan MongoDB.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB
- **ODM:** Mongoose
- **Authentication:** JWT (JSON Web Tokens)
- **Security:** Helmet, bcryptjs
- **Logging:** Morgan

## Struktur Folder

```
server/
├── src/
│   ├── config/          # Database configuration
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Custom middleware (auth, error handling)
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   └── server.js        # Entry point
├── .env.example         # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## Setup & Installation

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Setup Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` dan sesuaikan dengan konfigurasi Anda:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/workload_monitoring
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

### 3. Install & Start MongoDB

**Untuk Windows:**
- Download MongoDB dari: https://www.mongodb.com/try/download/community
- Install dan jalankan MongoDB service
- Atau gunakan MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas

**Untuk Development (Local):**
```bash
# Pastikan MongoDB sudah running di localhost:27017
mongosh
```

### 4. Run Development Server

```bash
npm run dev
```

Server akan berjalan di `http://localhost:5000`

### 5. Run Production Server

```bash
npm start
```

## API Endpoints

### Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/me` | Get current user | Private |

### Employees

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/employees` | Get all employees | Private |
| GET | `/api/employees/:id` | Get single employee | Private |
| POST | `/api/employees` | Create employee | Private |
| PUT | `/api/employees/:id` | Update employee | Private |
| DELETE | `/api/employees/:id` | Delete employee | Private |
| GET | `/api/employees/salary/current-month` | Get employees with salary this month | Private |

### Jobs

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/jobs` | Get all jobs | Private |
| GET | `/api/jobs/:id` | Get single job | Private |
| POST | `/api/jobs` | Create job | Private |
| PUT | `/api/jobs/:id` | Update job | Private |
| DELETE | `/api/jobs/:id` | Delete job | Private |
| POST | `/api/jobs/:id/assign` | Assign employees to job | Private |
| DELETE | `/api/jobs/:jobId/assign/:employeeId` | Remove employee from job | Private |
| PUT | `/api/jobs/:id/finalize` | Finalize job | Private |
| GET | `/api/jobs/stats/summary` | Get job statistics | Private |

### Health Check

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/health` | Server health check | Public |

## Request & Response Examples

### Register User

**Request:**
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "teamlead"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "teamlead"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login

**Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "teamlead"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Create Job

**Request:**
```http
POST /api/jobs
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "SUSENAS 2025",
  "type": "Sensus_Survey",
  "start_date": "2025-01-01",
  "end_date": "2025-01-31",
  "estimated_honorarium": 5000000,
  "transport_allowance": 500000
}
```

## Authentication

API menggunakan JWT (JSON Web Token) untuk authentication. 

Setelah login, gunakan token yang didapat di header request:

```http
Authorization: Bearer <your_jwt_token>
```

## Database Models

### User
- email (unique, required)
- name (required)
- password (hashed, required)
- role (teamlead/supervisor/admin)

### Employee
- name (required)
- employee_type (Organik/Mitra)
- status (Available/Unavailable/On_Project)
- organik_details (for Organik employees)
- mitra_details (for Mitra employees)

### Job
- title (required)
- type (Sensus_Survey/Kegiatan_Lain)
- start_date, end_date
- estimated_honorarium
- transport_allowance
- status (DRAFT/FINALIZED/ONGOING/COMPLETED)
- created_by (ref: User)

### JobAssignment
- job_id (ref: Job)
- employee_id (ref: Employee)

## Error Handling

API menggunakan format error response yang konsisten:

```json
{
  "success": false,
  "message": "Error message here"
}
```

## Development

### Watch Mode

```bash
npm run dev
```

Nodemon akan otomatis restart server saat ada perubahan file.

### Testing dengan Thunder Client / Postman

Import collection dari folder `/postman` (jika ada) atau buat request manual sesuai dokumentasi endpoint di atas.

## Production Deployment

1. Set `NODE_ENV=production` di `.env`
2. Gunakan MongoDB Atlas untuk production database
3. Set strong JWT_SECRET
4. Enable rate limiting dan additional security measures
5. Deploy ke platform seperti:
   - Heroku
   - Railway
   - DigitalOcean
   - AWS EC2

## Troubleshooting

### MongoDB Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:** Pastikan MongoDB service berjalan atau gunakan MongoDB Atlas.

### JWT Error

```
Error: jwt must be provided
```

**Solution:** Sertakan token di header Authorization: `Bearer <token>`

## License

ISC
