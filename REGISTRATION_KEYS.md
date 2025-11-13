# 🔐 Registration Keys - Panduan Keamanan

## ⚠️ PENTING - BACA INI!

Sistem registrasi sekarang menggunakan **Secret Registration Keys** untuk mencegah pendaftaran yang tidak sah.

---

## 🔑 Registration Keys yang Tersedia

### **Team Lead Key**
```
TEAMLEAD2025SECRET
```
- Digunakan untuk: Mendaftar sebagai **Team Lead**
- Akses: Kelola pekerjaan, tugaskan karyawan, ubah status karyawan

### **Supervisor Key**
```
SUPERVISOR2025SECRET
```
- Digunakan untuk: Mendaftar sebagai **Supervisor**
- Akses: Monitoring pekerjaan dan karyawan (read-only)

---

## 📝 Cara Menggunakan

### Untuk User yang Ingin Register:

1. Buka halaman **Register**
2. Isi data lengkap:
   - Nama Lengkap
   - Email
   - Password
   - Pilih **Role** (Team Lead atau Supervisor)
   - Masukkan **Registration Key** yang sesuai dengan role
3. Klik **Daftar**

### Contoh:
- Jika ingin register sebagai **Team Lead**: 
  - Pilih role: Team Lead
  - Registration Key: `TEAMLEAD2025SECRET`

- Jika ingin register sebagai **Supervisor**:
  - Pilih role: Supervisor
  - Registration Key: `SUPERVISOR2025SECRET`

---

## 🔒 Keamanan

### ⚠️ SEBELUM PRODUCTION - WAJIB GANTI!

**File:** `server/.env`

```env
# GANTI DENGAN KEY YANG AMAN DAN UNIK!
TEAM_LEAD_REGISTRATION_KEY=GantiDenganKeyYangKuat123!@#
SUPERVISOR_REGISTRATION_KEY=GantiDenganKeyLainYangKuat456!@#
```

### ✅ Tips Membuat Key yang Aman:

1. **Panjang minimal 16 karakter**
2. **Kombinasi huruf besar, kecil, angka, dan simbol**
3. **Tidak mengandung kata yang mudah ditebak**
4. **Berbeda untuk setiap role**

**Contoh Key yang Baik:**
```
TEAM_LEAD_REGISTRATION_KEY=TmL3ad#2025@BPS!Batu$Secure
SUPERVISOR_REGISTRATION_KEY=Spv#Monitor2025@BPS!Safety$
```

---

## 🚨 Jika Key Bocor - Langkah Darurat

1. **Segera ganti** key di file `.env`:
   ```env
   TEAM_LEAD_REGISTRATION_KEY=KeyBaruYangBerbeda123!
   SUPERVISOR_REGISTRATION_KEY=KeyBaruLainnya456!
   ```

2. **Restart server** agar perubahan berlaku:
   ```bash
   # Stop server (Ctrl+C)
   # Start server lagi
   npm start
   ```

3. **Informasikan** key baru kepada orang yang berwenang

4. **JANGAN** share key melalui:
   - ❌ Email yang tidak terenkripsi
   - ❌ Chat group publik
   - ❌ Screenshot yang dibagikan
   
   **DO:** 
   - ✅ Berikan secara langsung/tatap muka
   - ✅ Gunakan komunikasi terenkripsi
   - ✅ Catat di tempat aman (password manager)

---

## 📊 Cara Kerja Sistem

### Flow Registrasi:

```
User mengisi form register
    ↓
Pilih Role (Team Lead / Supervisor)
    ↓
Masukkan Registration Key
    ↓
Backend validasi key sesuai role
    ↓
Jika VALID → Akun dibuat dengan role yang dipilih
    ↓
Jika INVALID → Error "Invalid registration key"
```

### Validasi di Backend:

```javascript
// Team Lead
if (role === 'Team_Lead' && key !== TEAM_LEAD_KEY) {
  → Error: Invalid registration key for Team Lead
}

// Supervisor
if (role === 'Supervisor' && key !== SUPERVISOR_KEY) {
  → Error: Invalid registration key for Supervisor
}
```

---

## 🎯 Skenario Penggunaan

### Scenario 1: Kantor Baru Butuh Team Lead
1. Admin berikan **Team Lead Key** kepada calon Team Lead
2. Calon Team Lead register dengan key tersebut
3. Akun terbuat dengan role **Team_Lead**
4. Team Lead bisa langsung kelola pekerjaan

### Scenario 2: Butuh Supervisor Tambahan
1. Admin berikan **Supervisor Key** kepada calon Supervisor
2. Calon Supervisor register dengan key tersebut
3. Akun terbuat dengan role **Supervisor**
4. Supervisor bisa monitoring (read-only)

### Scenario 3: Orang Tidak Berwenang Coba Register
1. Tidak tahu registration key
2. Coba register → Error
3. Tidak bisa membuat akun ❌

---

## 🔍 Troubleshooting

### Problem: "Invalid registration key"
**Solusi:**
- Pastikan key yang dimasukkan **PERSIS SAMA** (case-sensitive)
- Pastikan tidak ada spasi di awal/akhir
- Pastikan role yang dipilih sesuai dengan key
  - Team Lead key → harus pilih role Team Lead
  - Supervisor key → harus pilih role Supervisor

### Problem: "Registration key is required"
**Solusi:**
- Field registration key tidak boleh kosong
- Isi dengan key yang valid

### Problem: Key lupa/hilang
**Solusi:**
- Cek file `server/.env`
- Atau tanya developer/admin yang setup

---

## 📞 Kontak

Jika ada pertanyaan atau butuh key baru, hubungi:
- **Developer/Admin** yang bertanggung jawab atas sistem ini
- Atau yang punya akses ke server production

---

## ⚙️ Untuk Developer

### Lokasi File Penting:

1. **Backend Validation:**
   - File: `server/src/controllers/authController.js`
   - Function: `register()`

2. **Environment Variables:**
   - File: `server/.env`
   - Keys: `TEAM_LEAD_REGISTRATION_KEY`, `SUPERVISOR_REGISTRATION_KEY`

3. **Frontend Form:**
   - File: `client/src/pages/Register.jsx`

### Cara Mengubah Key di Production:

```bash
# 1. SSH ke server production
ssh user@your-server.com

# 2. Edit .env file
nano /path/to/project/server/.env

# 3. Ubah keys:
TEAM_LEAD_REGISTRATION_KEY=NewSecureKey123!
SUPERVISOR_REGISTRATION_KEY=AnotherSecureKey456!

# 4. Save (Ctrl+O, Enter, Ctrl+X)

# 5. Restart aplikasi
pm2 restart workload-monitoring
# atau
systemctl restart workload-monitoring
```

---

## 📋 Checklist Sebelum Production

- [ ] Ganti `TEAM_LEAD_REGISTRATION_KEY` dengan key yang kuat
- [ ] Ganti `SUPERVISOR_REGISTRATION_KEY` dengan key yang kuat
- [ ] Pastikan kedua key berbeda
- [ ] Simpan key di tempat aman (password manager)
- [ ] Bagikan key hanya kepada orang yang berwenang
- [ ] Jangan commit `.env` ke Git
- [ ] Test registrasi dengan key baru
- [ ] Dokumentasikan siapa saja yang punya key

---

## 🎓 FAQ

**Q: Apakah key ini permanen?**
A: Tidak, bisa diganti kapan saja di file `.env` dan restart server.

**Q: Berapa banyak orang bisa pakai 1 key?**
A: Tidak terbatas, tapi sebaiknya ganti key secara berkala untuk keamanan.

**Q: Apakah bisa buat key untuk role lain?**
A: Ya, tinggal tambahkan di `.env` dan update validasi di controller.

**Q: Bagaimana jika lupa key?**
A: Cek file `server/.env` atau hubungi yang punya akses server.

**Q: Apakah key bisa dilihat setelah registrasi?**
A: Tidak, key hanya untuk registrasi dan tidak disimpan di database user.

---

**Last Updated:** November 13, 2025
**Version:** 1.0
