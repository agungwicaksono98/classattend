# Product Requirement Document (PRD)

**Feature Name:** ClassAttend - Sistem Absensi Pelajar Berbasis Lokasi
**Status:** Draft
**Owner:** @product-management

---

## 1. Problem Statement

Guru dan admin sekolah membutuhkan sistem untuk melacak kehadiran pelajar secara real-time dengan verifikasi lokasi. Pelajar harus dapat melakukan absensi dari mana saja, namun sistem harus dapat menampilkan koordinat lokasi saat absen untuk keperluan verifikasi oleh guru/admin.

**Target Users:**
- ~30 Pelajar (2 Kelas)
- 5 Guru
- 2 Admin

---

## 2. Goals & Success Metrics

| Metric Type | Metric Name | Target |
| :--- | :--- | :--- |
| **Product** | Daily Active Users | > 80% dari total pelajar |
| **Product** | Attendance Completion Rate | > 95% check-in memiliki check-out |
| **Technical** | API Response Time | < 500ms |
| **Technical** | Location Accuracy | < 50 meter |

---

## 3. User Stories

### Pelajar (Student)
- As a **Pelajar**, I want to **check-in dengan GPS** so that **guru tahu saya sudah hadir**.
- As a **Pelajar**, I want to **check-out saat pulang** so that **durasi kehadiran tercatat**.
- As a **Pelajar**, I want to **melihat riwayat absen saya** so that **saya tahu kehadiran saya**.

### Guru (Teacher)
- As a **Guru**, I want to **melihat daftar kehadiran kelas** so that **saya tahu siapa yang hadir hari ini**.
- As a **Guru**, I want to **melihat lokasi pelajar di peta** so that **saya bisa verifikasi lokasi mereka**.
- As a **Guru**, I want to **export laporan kehadiran** so that **saya punya rekap untuk penilaian**.

### Admin
- As an **Admin**, I want to **mengatur geofence kelas** so that **sistem bisa deteksi siapa yang di dalam/di luar area**.
- As an **Admin**, I want to **mengelola data pelajar, guru, dan kelas** so that **sistem selalu up-to-date**.

---

## 4. Functional Requirements

### A. Frontend (UI/UX)

#### 4.1 Authentication
- [ ] **Login Page**: Form NIS/Email + Password
- [ ] **Role-based Redirect**: Pelajar → Dashboard Pelajar, Guru → Dashboard Guru, Admin → Dashboard Admin

#### 4.2 Student Dashboard (Mobile-First)
- [ ] **Check-in Button**: Capture GPS coordinates, submit to API
- [ ] **Check-out Button**: Capture GPS coordinates, calculate duration
- [ ] **Location Display**: Show current location on map (Leaflet + OpenStreetMap)
- [ ] **Attendance History**: List of past attendance with date, time, location, duration
- [ ] **Offline Warning**: Banner/overlay when network is unavailable

#### 4.3 Teacher Dashboard (Desktop + Mobile)
- [ ] **Class Attendance List**: Table showing all students with status (Belum Hadir / Hadir / Sudah Pulang)
- [ ] **Map View**: Pin locations of all checked-in students
- [ ] **Student Detail Modal**: Click student → show detail (times, location, duration)
- [ ] **Export Report**: Download CSV/Excel of attendance data (weekly/monthly)

#### 4.4 Admin Dashboard (Desktop + Mobile)
- [ ] **User Management**: CRUD for Students, Teachers
- [ ] **Class Management**: CRUD for Classes
- [ ] **Geofence Configuration**: Set center point (lat/lng) + radius (meters) per class
- [ ] **System Overview**: Statistics (total users, attendance today, etc.)

### B. Backend (API)

See `docs/features/attendance/api.md` for detailed API specifications.

**Core Endpoints:**
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration (Admin only)
- `GET /api/attendance/today` - Get today's attendance for current user
- `POST /api/attendance/check-in` - Record check-in with GPS
- `POST /api/attendance/check-out` - Record check-out with GPS
- `GET /api/attendance/history` - Get attendance history
- `GET /api/classes/:id/attendance` - Get class attendance (Teacher/Admin)
- `PUT /api/classes/:id/geofence` - Update geofence settings (Admin only)

### C. Geofencing Logic

```
IF student.location IS WITHIN class.geofence.radius FROM class.geofence.center:
    status = "INSIDE"
ELSE:
    status = "OUTSIDE"
```

- Geofence center and radius are configurable by Admin
- Status is calculated on check-in and displayed to Teacher/Admin
- Does NOT prevent check-in (informational only)

---

## 5. Data & Privacy

- **Data Attributes**: User ID, Name, Role, Class, Timestamp, GPS Coordinates
- **Retention**: Store indefinitely (or as per school policy)
- **Privacy**: Location data only visible to Teachers/Admins of the same class

---

## 6. Risk Mitigation (Fallbacks)

| Risk | Fallback Strategy |
| :--- | :--- |
| GPS Unavailable | Show error "Please enable location services" |
| Network Offline | Show warning banner, disable check-in/out buttons |
| Low GPS Accuracy | Accept but flag with warning if accuracy > 100m |
| API Timeout | Show retry button with "Please try again" message |

---

## 7. Non-Functional Requirements

| Requirement | Specification |
| :--- | :--- |
| **Platform** | Web (PWA) - Mobile-first for students, Desktop for teachers/admin |
| **Browser Support** | Chrome, Safari, Firefox (latest 2 versions) |
| **Responsiveness** | Fully responsive (320px - 1920px) |
| **Offline Handling** | Detect offline → show warning, disable actions |
| **Performance** | Initial load < 3s, API calls < 500ms |

---

## 8. Out of Scope (v1.0)

- ❌ Face verification / Photo selfie
- ❌ Schedule-based attendance (fixed time)
- ❌ Integration with external systems (School IS, WhatsApp)
- ❌ Offline mode (queue and sync later)
- ❌ Push notifications

---

## 9. Golden Dataset (QA)

1. **Check-in Inside Geofence**
   - Input: Student at coordinates within 50m of class center
   - Output: Status = "INSIDE", check-in recorded

2. **Check-in Outside Geofence**
   - Input: Student at coordinates 200m from class center
   - Output: Status = "OUTSIDE", check-in recorded with flag

3. **Check-out with Duration**
   - Input: Check-out 2 hours after check-in
   - Output: Duration = "2 jam 0 menit"

4. **Offline Attempt**
   - Input: User tries to check-in without network
   - Output: Warning banner, button disabled
