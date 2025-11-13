# 🎴 Quick Reference - Registration Keys

## 🔑 Default Keys (Development)

| Role | Registration Key |
|------|------------------|
| **Team Lead** | `TEAMLEAD2025SECRET` |
| **Supervisor** | `SUPERVISOR2025SECRET` |

## ⚡ Quick Commands

### Start Server
```bash
cd server
npm start
```

### Check Environment Variables
```bash
cat server/.env | grep REGISTRATION
```

### Change Keys
```bash
nano server/.env
# Edit TEAM_LEAD_REGISTRATION_KEY dan SUPERVISOR_REGISTRATION_KEY
# Save dan restart server
```

## 🧪 Quick Test

### Test Team Lead Registration
```
URL: http://localhost:3000/register

Form Data:
✓ Nama: Test Team Lead
✓ Email: teamlead@test.com
✓ Password: test123
✓ Konfirmasi Password: test123
✓ Role: Team Lead (pilih radio button)
✓ Registration Key: TEAMLEAD2025SECRET
```

### Test Supervisor Registration
```
URL: http://localhost:3000/register

Form Data:
✓ Nama: Test Supervisor
✓ Email: supervisor@test.com
✓ Password: test123
✓ Konfirmasi Password: test123
✓ Role: Supervisor (pilih radio button)
✓ Registration Key: SUPERVISOR2025SECRET
```

## 🚨 Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| `Invalid registration key for Team Lead` | Key salah untuk Team Lead | Gunakan key Team Lead yang benar |
| `Invalid registration key for Supervisor` | Key salah untuk Supervisor | Gunakan key Supervisor yang benar |
| `Registration key is required` | Field key kosong | Isi registration key |
| `Invalid role` | Role tidak valid | Pilih Team Lead atau Supervisor |
| `Email already registered` | Email sudah terdaftar | Gunakan email lain |

## 🔐 Security Checklist

Before Production:
- [ ] Ganti TEAM_LEAD_REGISTRATION_KEY
- [ ] Ganti SUPERVISOR_REGISTRATION_KEY
- [ ] Simpan keys di password manager
- [ ] JANGAN commit .env ke Git
- [ ] Share keys hanya ke pihak berwenang

## 📱 Contact

Need help? Contact:
- System Administrator
- Developer/IT Support

---

**Last Updated:** November 13, 2025
