# Fitur Edit Status Karyawan (Team Lead)

## Ringkasan Perubahan

Team Lead sekarang dapat mengelola status karyawan dengan lebih baik melalui modal popup yang user-friendly.

## Fitur Utama

### 1. **Modal Ubah Status**
- Tombol "Ubah Status" di tabel karyawan (hanya untuk status Available/Unavailable)
- Karyawan dengan status On_Project tidak bisa diubah secara manual

### 2. **Pilihan Status**
- **Available**: Karyawan siap ditugaskan
- **Unavailable**: Karyawan tidak tersedia

### 3. **Detail Ketidaktersediaan**
Saat memilih status Unavailable, Team Lead dapat mengisi:
- **Tanggal Mulai**: Kapan karyawan mulai tidak tersedia
- **Tanggal Selesai**: Kapan karyawan kembali tersedia
- **Alasan**: Cuti, Sakit, Dinas Luar, dll. (opsional)

### 4. **Informasi di Detail Karyawan**
Saat melihat detail karyawan dengan status Unavailable, akan muncul:
- Tanggal mulai dan selesai unavailable
- Alasan unavailable (jika ada)

## Cara Kerja Status

### Status Otomatis
1. **Available → On_Project**: Otomatis saat ditugaskan ke pekerjaan
2. **On_Project → Available**: Otomatis saat semua pekerjaan selesai

### Status Manual (Team Lead)
1. **Available → Unavailable**: Manual, dengan detail tanggal dan alasan
2. **Unavailable → Available**: Manual, menghapus detail unavailable

## Validasi

### Set ke Unavailable
- ❌ Tidak bisa jika karyawan masih punya pekerjaan aktif
- ✅ Harus memilih status (Available/Unavailable)
- ⚠️ Tanggal selesai tidak boleh lebih awal dari tanggal mulai

### Set ke Available
- ✅ Otomatis menghapus semua detail unavailable
- ✅ Karyawan bisa ditugaskan kembali

## Perubahan Backend

### Model Employee
Ditambahkan field baru:
```javascript
{
  unavailable_start_date: Date,
  unavailable_end_date: Date,
  unavailable_reason: String
}
```

### API Endpoint
```
PUT /api/employees/:id/status
```

**Request Body:**
```json
{
  "status": "Unavailable",
  "unavailable_start_date": "2025-11-15",
  "unavailable_end_date": "2025-11-20",
  "unavailable_reason": "Cuti"
}
```

## Perubahan Frontend

### Dashboard Team Lead
- Tombol "Ubah Status" menggantikan "Set Available" / "Set Unavailable"
- Modal popup dengan form lengkap
- Tampilan detail unavailable di employee details modal

### UI/UX Improvements
- Radio button untuk pilih status
- Form tanggal dan alasan muncul conditional
- Warning dan info message yang jelas
- Warna badge yang konsisten

## Testing

### Scenario 1: Set Unavailable
1. Buka Dashboard Team Lead
2. Klik tab "Daftar Karyawan"
3. Klik "Ubah Status" pada karyawan dengan status Available
4. Pilih "Unavailable"
5. Isi tanggal mulai, tanggal selesai, dan alasan
6. Klik "Simpan Perubahan"
7. Status berubah menjadi Unavailable dengan badge abu-abu

### Scenario 2: Lihat Detail Unavailable
1. Klik "Detail" pada karyawan Unavailable
2. Lihat informasi ketidaktersediaan (tanggal & alasan)

### Scenario 3: Set Available
1. Klik "Ubah Status" pada karyawan Unavailable
2. Pilih "Available"
3. Klik "Simpan Perubahan"
4. Status kembali Available, detail unavailable terhapus

### Scenario 4: Validasi (Tidak Bisa Set Unavailable)
1. Tugaskan karyawan ke pekerjaan (status On_Project)
2. Coba ubah status - tombol "Ubah Status" tidak muncul
3. Atau jika Available tapi ada pekerjaan aktif, akan muncul error

## Catatan Penting

⚠️ **Karyawan dengan status On_Project tidak bisa diubah manual**
- Status akan otomatis kembali Available saat semua pekerjaan selesai

⚠️ **Karyawan Unavailable tidak bisa ditugaskan**
- Sistem akan prevent assignment di SelectEmployee page

✅ **Tanggal dan alasan bersifat opsional**
- Team Lead bisa langsung set Unavailable tanpa tanggal
- Tapi direkomendasikan untuk tracking yang lebih baik
