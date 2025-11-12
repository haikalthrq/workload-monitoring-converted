# 🚀 QUICK START GUIDE - Frontend React

## Step 1: Install Dependencies

```bash
cd client
npm install
```

## Step 2: Setup Environment

```bash
# Copy environment example
copy .env.example .env
```

File `.env` sudah berisi konfigurasi default:
```
VITE_API_URL=http://localhost:5000/api
```

## Step 3: Run Development Server

```bash
npm run dev
```

✅ Frontend akan berjalan di: **http://localhost:3000**

## Step 4: Access Application

1. Buka browser ke `http://localhost:3000`
2. Klik "Daftar di sini" untuk registrasi
3. Isi form registrasi (nama, email, password)
4. Login dengan akun yang baru dibuat
5. Pilih dashboard (Team Lead atau Supervisor)

## ⚠️ IMPORTANT

**Backend harus running terlebih dahulu!**

Di terminal terpisah, jalankan backend:
```bash
cd server
npm run dev
```

Backend akan running di: **http://localhost:5000**

---

## 📱 Login Credentials (Testing)

Setelah registrasi pertama, Anda bisa login dengan:
- **Email**: yang Anda daftarkan
- **Password**: yang Anda buat

---

## 🎯 What's Next?

### Team Lead:
1. Buat pekerjaan baru
2. Pilih karyawan untuk ditugaskan
3. Finalisasi pekerjaan

### Supervisor:
1. Lihat daftar karyawan
2. Monitor gaji bulan ini
3. Track status karyawan

---

## 🐛 Troubleshooting

**Error: Cannot connect to server**
→ Pastikan backend running di port 5000

**Error: Module not found**
→ Jalankan `npm install` lagi

**Port 3000 already in use**
→ Ubah port di `vite.config.js`

---

Selamat menggunakan! 🎉
