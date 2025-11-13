# 📊 Sistem Status Karyawan - Workload Monitoring

## Status yang Tersedia

### 1. **Available (Tersedia)** ✅
- **Arti**: Karyawan siap dan tersedia untuk ditugaskan
- **Dapat ditugaskan**: ✅ **YA** - Muncul di SelectEmployee dan bisa dipilih
- **Digunakan untuk**: Karyawan yang tidak sedang bertugas atau sedang luang

### 2. **On_Project (Sedang Bertugas)** 🔄
- **Arti**: Karyawan sedang mengerjakan satu atau lebih proyek
- **Dapat ditugaskan**: ✅ **YA** - Muncul di SelectEmployee dan **TETAP BISA DIPILIH**
- **Catatan**: Team Lead dapat menugaskan karyawan yang sudah On_Project ke job tambahan (multi-tasking)
- **Cara set**: Manual oleh Admin/Supervisor untuk menandai karyawan sedang bertugas

### 3. **Unavailable (Tidak Tersedia)** ❌
- **Arti**: Karyawan tidak tersedia untuk ditugaskan
- **Dapat ditugaskan**: ❌ **TIDAK** - Muncul di SelectEmployee tapi **DISABLED (tidak bisa dipilih)**
- **Contoh penggunaan**:
  - Cuti
  - Sakit
  - Tugas luar
  - Suspended
- **Cara mengubah**: Manual oleh Admin/Supervisor melalui Edit Employee

---

## Cara Kerja di SelectEmployee

### 🎯 **Tampilan Karyawan**

**Team Lead dapat melihat SEMUA karyawan:**
- ✅ **Available**: Muncul normal, bisa dipilih
- ✅ **On_Project**: Muncul normal, **BISA DIPILIH** (untuk multi-tasking)
- ⚠️ **Unavailable**: Muncul dengan opacity 50%, checkbox **DISABLED**, tidak bisa dipilih

**Kolom yang ditampilkan:**
1. Checkbox (disabled untuk Unavailable)
2. Nama & Avatar
3. Tipe (Organik/Mitra)
4. Status dengan badge berwarna:
   - 🟢 Tersedia (Available)
   - 🟡 Sedang Bertugas (On_Project)
   - � Tidak Tersedia (Unavailable)
5. Info tambahan (Department/Education)

---

## Logika Bisnis Baru

### ✅ **Assignment Karyawan**

```javascript
// Team Lead bisa assign karyawan dengan status:
- Available ✅ (diperbolehkan)
- On_Project ✅ (diperbolehkan - multi-tasking)
- Unavailable ❌ (ditolak oleh sistem)
```

**Backend Validation:**
```javascript
if (employee.status === 'Unavailable') {
  throw new Error(`Employee ${employee.name} is currently unavailable and cannot be assigned`);
}
```

### 🔄 **Status TIDAK Otomatis Berubah**

**Status karyawan HANYA berubah secara MANUAL:**
- Admin/Supervisor mengubah melalui Edit Employee
- Team Lead **TIDAK** bisa mengubah status
- Status **TIDAK** otomatis berubah saat:
  - Ditugaskan ke job ❌
  - Job selesai ❌
  - Assignment dihapus ❌
  - Job dihapus ❌

**Alasan:**
- Memberikan kontrol penuh ke Supervisor/Admin
- Mencegah perubahan status yang tidak diinginkan
- Memungkinkan multi-tasking (karyawan bisa ditugaskan ke banyak job)

---

## Role & Permission

### 👔 **Team Lead**
- ✅ Dapat melihat semua karyawan (Available, On_Project, Unavailable)
- ✅ Dapat menugaskan karyawan Available & On_Project
- ❌ Tidak dapat menugaskan karyawan Unavailable
- ❌ Tidak dapat mengubah status karyawan
- ✅ Dapat membuat job baru
- ✅ Dapat assign/unassign employee dari job

### 👁️ **Supervisor (READ-ONLY)**
- ✅ Dapat melihat semua data karyawan
- ✅ Dapat melihat semua data pekerjaan/job
- ✅ Dapat melihat assignment karyawan ke job
- ❌ **TIDAK** dapat membuat/edit/delete job
- ❌ **TIDAK** dapat assign/unassign employee
- ❌ **TIDAK** dapat membuat/edit/delete karyawan
- ✅ Dapat mengubah status karyawan (Available/On_Project/Unavailable)
- 👁️ **Hanya untuk monitoring dan reporting**

---

## UI/UX SelectEmployee

### 🎨 **Visual Indicators**

**Karyawan Available:**
```
✅ [Checkbox Normal] 👤 Budi Santoso | Organik | 🟢 Tersedia
   Opacity: 100%
   Cursor: pointer
   Selectable: YES
```

**Karyawan On_Project:**
```
✅ [Checkbox Normal] 👤 Dewi Anggraini | Organik | 🟡 Sedang Bertugas
   Opacity: 100%
   Cursor: pointer
   Selectable: YES
   Note: Bisa ditugaskan untuk multi-tasking
```

**Karyawan Unavailable:**
```
☑️ [Checkbox Disabled] 👤 Siti Rahmawati | Mitra | 🔴 Tidak Tersedia
   Opacity: 50%
   Cursor: not-allowed
   Selectable: NO
   Message: ❌ Tidak dapat dipilih
```

### 🔍 **Fitur Search**
- Search berdasarkan nama atau tipe karyawan
- Filter tetap menampilkan semua status
- Hasil search tetap menunjukkan status dengan warna berbeda

### ✅ **Tombol "Pilih Semua"**
- Hanya memilih karyawan Available & On_Project
- **Melewati** karyawan Unavailable
- Counter menunjukkan jumlah yang dipilih

---

## Frontend Code

### SelectEmployee.jsx

```javascript
// Fetch ALL employees (no status filter)
const response = await employeeService.getAll();

// Handle selection - prevent Unavailable
const handleSelectEmployee = (employeeId, employee) => {
  if (employee.status === 'Unavailable') {
    return; // Do nothing
  }
  // ... selection logic
};

// Select All - exclude Unavailable
const handleSelectAll = () => {
  const selectableEmployees = filteredEmployees.filter(
    emp => emp.status !== 'Unavailable'
  );
  // ... selection logic
};

// Render with status-based styling
<tr className={isUnavailable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}>
  <input 
    type="checkbox"
    disabled={isUnavailable}
  />
  <Badge variant={
    status === 'Available' ? 'success' : 
    status === 'On_Project' ? 'warning' : 
    'destructive'
  }>
    {statusText}
  </Badge>
</tr>
```

---

## Backend Code

### jobController.js - assignEmployees

```javascript
// Prevent assigning Unavailable employees
if (employee.status === 'Unavailable') {
  throw new Error(`Employee ${employee.name} is currently unavailable and cannot be assigned`);
}

// Create assignment (no status update)
await JobAssignment.create({
  job_id: job._id,
  employee_id,
});
// Status remains unchanged
```

---

## Skenario Penggunaan

### Skenario 1: Multi-tasking
```
1. Budi (Available) ✅
2. Ditugaskan ke Job A
3. Status tetap Available atau diubah manual ke On_Project 🔄
4. Ditugaskan ke Job B (masih bisa dipilih karena On_Project masih selectable) ✅
5. Job A selesai - Status tetap On_Project (manual)
6. Job B selesai - Supervisor ubah manual ke Available ✅
```

### Skenario 2: Karyawan Cuti
```
1. Dewi (Available) ✅
2. Supervisor set: Unavailable (cuti 1 minggu) ❌
3. Team Lead tidak bisa assign ke job manapun
4. Muncul di SelectEmployee tapi disabled
5. Setelah cuti selesai, Supervisor set: Available ✅
6. Karyawan bisa ditugaskan lagi
```

### Skenario 3: Emergency Override
```
1. Siti (On_Project) 🔄
2. Ada tugas urgent, Team Lead assign ke Job Urgent ✅
3. Siti sekarang handle 2 job sekaligus
4. Setelah kedua job selesai, Supervisor ubah: Available ✅
```

---

## Database Schema

**Employee Model:**
```javascript
status: {
  type: String,
  enum: ['Available', 'Unavailable', 'On_Project'],
  default: 'Available',
}
// Status does NOT auto-update
```

**Job Model:**
```javascript
status: {
  type: String,
  enum: ['DRAFT', 'FINALIZED', 'ONGOING', 'COMPLETED'],
  default: 'DRAFT',
}
```

---

## Summary

| Status | Muncul di SelectEmployee | Bisa Dipilih | Cara Berubah | Auto Update |
|--------|-------------------------|--------------|--------------|-------------|
| **Available** ✅ | ✅ Ya | ✅ Ya | Manual oleh Supervisor/Admin | ❌ No |
| **On_Project** 🔄 | ✅ Ya | ✅ Ya (Multi-tasking) | Manual oleh Supervisor/Admin | ❌ No |
| **Unavailable** ❌ | ✅ Ya (Disabled) | ❌ Tidak | Manual oleh Supervisor/Admin | ❌ No |

**Key Points:**
- ✅ Team Lead bisa assign karyawan Available & On_Project
- ❌ Team Lead tidak bisa assign karyawan Unavailable
- 🔄 Status karyawan **HANYA** berubah secara **MANUAL**
- 👁️ Supervisor: **READ-ONLY** untuk job & employee management
- 👔 Team Lead: Bisa create/edit job & assign employee (kecuali Unavailable)


---

## Alur Otomatis Status Karyawan

### 🔄 **Saat Karyawan Ditugaskan ke Job**

```
1. Team Lead membuat job baru
2. Team Lead memilih karyawan dengan status "Available"
3. Setelah assign, status karyawan otomatis berubah:
   Available → On_Project
4. Karyawan tidak muncul lagi di SelectEmployee untuk job lain
```

**Backend Code (jobController.assignEmployees):**
```javascript
// Update employee status to On_Project
await Employee.findByIdAndUpdate(employee_id, {
  status: 'On_Project',
});
```

---

### ✅ **Saat Job Selesai (Status = COMPLETED)**

```
1. Supervisor/Team Lead mengubah status job menjadi COMPLETED
2. System otomatis mengecek semua karyawan yang ditugaskan
3. Jika karyawan tidak punya job lain yang aktif:
   On_Project → Available
4. Karyawan muncul kembali di SelectEmployee
```

**Backend Code (jobController.updateJob):**
```javascript
if (req.body.status === 'COMPLETED') {
  // Cek semua karyawan yang ditugaskan
  const assignments = await JobAssignment.find({ job_id: job._id });
  
  for (const assignment of assignments) {
    // Cek apakah punya job lain
    const otherActiveAssignments = await JobAssignment.countDocuments({
      employee_id: assignment.employee_id,
      job_id: { $ne: job._id },
    });

    // Jika tidak ada job lain, kembalikan ke Available
    if (otherActiveAssignments === 0) {
      await Employee.findByIdAndUpdate(assignment.employee_id, {
        status: 'Available',
      });
    }
  }
}
```

---

### 🗑️ **Saat Karyawan Dihapus dari Assignment**

```
1. Team Lead menghapus karyawan dari job assignment
2. System mengecek: apakah karyawan punya job lain?
3. Jika TIDAK ada job lain:
   On_Project → Available
4. Jika MASIH ada job lain:
   Tetap On_Project
```

**Backend Code (jobController.removeEmployeeAssignment):**
```javascript
// Hapus assignment
await JobAssignment.findOneAndDelete({ job_id, employee_id });

// Cek apakah punya assignment lain
const otherAssignments = await JobAssignment.countDocuments({
  employee_id: employeeId,
});

// Jika tidak ada, kembalikan ke Available
if (otherAssignments === 0) {
  await Employee.findByIdAndUpdate(employeeId, {
    status: 'Available',
  });
}
```

---

### 🗑️ **Saat Job Dihapus**

```
1. Job dihapus dari sistem
2. Semua assignment terkait job tersebut dihapus
3. Untuk setiap karyawan yang ditugaskan:
   - Cek apakah punya job lain
   - Jika TIDAK: On_Project → Available
   - Jika MASIH ada: Tetap On_Project
```

**Backend Code (jobController.deleteJob):**
```javascript
// Ambil semua assignment sebelum dihapus
const assignments = await JobAssignment.find({ job_id: job._id });

// Hapus semua assignment
await JobAssignment.deleteMany({ job_id: job._id });

// Update status karyawan
for (const assignment of assignments) {
  const otherAssignments = await JobAssignment.countDocuments({
    employee_id: assignment.employee_id,
  });

  if (otherAssignments === 0) {
    await Employee.findByIdAndUpdate(assignment.employee_id, {
      status: 'Available',
    });
  }
}
```

---

## Skenario Penggunaan

### Skenario 1: Karyawan Sederhana (1 Job)
```
1. Karyawan baru: Status = Available ✅
2. Ditugaskan ke Job A: Status = On_Project 🔄
3. Job A selesai: Status = Available ✅
```

### Skenario 2: Karyawan Multi-tasking (Beberapa Job)
```
1. Karyawan: Status = Available ✅
2. Ditugaskan ke Job A: Status = On_Project 🔄
3. Ditugaskan ke Job B: Status = On_Project 🔄 (tetap)
4. Job A selesai: Status = On_Project 🔄 (karena masih ada Job B)
5. Job B selesai: Status = Available ✅ (semua job selesai)
```

### Skenario 3: Karyawan Cuti
```
1. Admin set manual: Status = Unavailable ❌
2. Tidak bisa ditugaskan ke job manapun
3. Setelah cuti selesai, Admin set: Status = Available ✅
4. Karyawan bisa ditugaskan lagi
```

---

## Filter di SelectEmployee

Halaman **SelectEmployee** hanya menampilkan karyawan dengan:
- ✅ `status = 'Available'`

Karyawan dengan status berikut **TIDAK muncul**:
- ❌ `status = 'On_Project'`
- ❌ `status = 'Unavailable'`

**Frontend Code:**
```javascript
const response = await employeeService.getAll({ status: 'Available' });
```

**Backend Code:**
```javascript
const filter = {};
if (status) filter.status = status;
const employees = await Employee.find(filter);
```

---

## Manajemen Manual Status

Admin/Supervisor dapat mengubah status karyawan secara manual melalui:
- Edit Employee Form
- Update Employee API

**Use Case Manual Update:**
1. Set `Unavailable` untuk karyawan cuti/sakit
2. Set `Available` untuk karyawan yang sudah siap kerja lagi
3. Emergency override jika ada masalah sistem

**Note:** Sebaiknya hindari manual update status ke `On_Project` karena akan membingungkan sistem otomatis.

---

## Database Schema

**Employee Model:**
```javascript
status: {
  type: String,
  enum: ['Available', 'Unavailable', 'On_Project'],
  default: 'Available',
}
```

**Job Model:**
```javascript
status: {
  type: String,
  enum: ['DRAFT', 'FINALIZED', 'ONGOING', 'COMPLETED'],
  default: 'DRAFT',
}
```

---

## Summary

| Status | Muncul di SelectEmployee | Bisa Ditugaskan | Cara Berubah |
|--------|-------------------------|-----------------|--------------|
| **Available** ✅ | ✅ Ya | ✅ Ya | Default, job selesai, assignment dihapus |
| **On_Project** 🔄 | ❌ Tidak | ❌ Tidak | Otomatis saat ditugaskan |
| **Unavailable** ❌ | ❌ Tidak | ❌ Tidak | Manual oleh Admin |

