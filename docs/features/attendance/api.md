# API Specification: Attendance Feature

**Base URL:** `/api/v1`
**Authentication:** JWT Bearer Token

---

## 1. Authentication Endpoints

### 1.1 Login
```
POST /auth/login
```

**Request Body:**
```json
{
  "email": "siswa@school.id",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid-123",
      "email": "siswa@school.id",
      "name": "Ahmad Santoso",
      "role": "STUDENT",
      "class": {
        "id": "class-uuid-1",
        "name": "Kelas 10A"
      }
    }
  }
}
```

**Error Responses:**
- `401`: Invalid credentials
- `400`: Missing email or password

---

### 1.2 Get Current User
```
GET /auth/me
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-123",
    "email": "siswa@school.id",
    "name": "Ahmad Santoso",
    "nis": "2024001",
    "role": "STUDENT",
    "class": {
      "id": "class-uuid-1",
      "name": "Kelas 10A",
      "geofenceLat": -6.200000,
      "geofenceLng": 106.816666,
      "geofenceRadius": 100
    }
  }
}
```

---

## 2. Attendance Endpoints

### 2.1 Check-In
```
POST /attendance/check-in
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "latitude": -6.200123,
  "longitude": 106.816789,
  "accuracy": 15.5
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "att-uuid-1",
    "date": "2026-02-06",
    "checkInTime": "2026-02-06T07:30:00.000Z",
    "checkInLat": -6.200123,
    "checkInLng": 106.816789,
    "checkInAccuracy": 15.5,
    "checkInStatus": "INSIDE",
    "distanceFromCenter": 45.2
  },
  "message": "Check-in berhasil! Anda berada di dalam area kelas."
}
```

**Error Responses:**
- `400`: Already checked in today
- `400`: Missing location data
- `401`: Unauthorized

---

### 2.2 Check-Out
```
POST /attendance/check-out
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "latitude": -6.200456,
  "longitude": 106.816123,
  "accuracy": 12.0
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "att-uuid-1",
    "date": "2026-02-06",
    "checkInTime": "2026-02-06T07:30:00.000Z",
    "checkOutTime": "2026-02-06T12:00:00.000Z",
    "checkOutLat": -6.200456,
    "checkOutLng": 106.816123,
    "checkOutAccuracy": 12.0,
    "durationMinutes": 270,
    "durationFormatted": "4 jam 30 menit"
  },
  "message": "Check-out berhasil! Durasi kehadiran: 4 jam 30 menit"
}
```

**Error Responses:**
- `400`: No check-in found for today
- `400`: Already checked out today
- `401`: Unauthorized

---

### 2.3 Get Today's Attendance
```
GET /attendance/today
Authorization: Bearer <token>
```

**Response (200) - Has Attendance:**
```json
{
  "success": true,
  "data": {
    "id": "att-uuid-1",
    "date": "2026-02-06",
    "checkInTime": "2026-02-06T07:30:00.000Z",
    "checkOutTime": null,
    "checkInStatus": "INSIDE",
    "status": "CHECKED_IN"
  }
}
```

**Response (200) - No Attendance:**
```json
{
  "success": true,
  "data": null,
  "message": "Belum ada absensi hari ini"
}
```

---

### 2.4 Get Attendance History
```
GET /attendance/history?startDate=2026-02-01&endDate=2026-02-28
Authorization: Bearer <token>
```

**Query Parameters:**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `startDate` | string (YYYY-MM-DD) | No | Filter start date |
| `endDate` | string (YYYY-MM-DD) | No | Filter end date |
| `page` | integer | No | Page number (default: 1) |
| `limit` | integer | No | Items per page (default: 10) |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "att-uuid-1",
      "date": "2026-02-06",
      "checkInTime": "2026-02-06T07:30:00.000Z",
      "checkOutTime": "2026-02-06T12:00:00.000Z",
      "checkInStatus": "INSIDE",
      "durationMinutes": 270,
      "durationFormatted": "4 jam 30 menit"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 20,
    "totalPages": 2
  }
}
```

---

## 3. Class Attendance Endpoints (Teacher/Admin)

### 3.1 Get Class Attendance
```
GET /classes/:classId/attendance?date=2026-02-06
Authorization: Bearer <token>
Role: TEACHER, ADMIN
```

**Query Parameters:**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `date` | string (YYYY-MM-DD) | No | Filter date (default: today) |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "class": {
      "id": "class-uuid-1",
      "name": "Kelas 10A",
      "geofenceLat": -6.200000,
      "geofenceLng": 106.816666,
      "geofenceRadius": 100
    },
    "date": "2026-02-06",
    "summary": {
      "total": 15,
      "present": 12,
      "absent": 3,
      "insideGeofence": 10,
      "outsideGeofence": 2
    },
    "students": [
      {
        "id": "uuid-3",
        "name": "Ahmad Santoso",
        "nis": "2024001",
        "status": "CHECKED_OUT",
        "checkInTime": "2026-02-06T07:30:00.000Z",
        "checkOutTime": "2026-02-06T12:00:00.000Z",
        "checkInLat": -6.200123,
        "checkInLng": 106.816789,
        "checkInStatus": "INSIDE",
        "durationMinutes": 270
      },
      {
        "id": "uuid-4",
        "name": "Budi Prasetyo",
        "nis": "2024002",
        "status": "ABSENT",
        "checkInTime": null,
        "checkOutTime": null
      }
    ]
  }
}
```

---

### 3.2 Export Attendance Report
```
GET /classes/:classId/attendance/export?startDate=2026-02-01&endDate=2026-02-28&format=csv
Authorization: Bearer <token>
Role: TEACHER, ADMIN
```

**Query Parameters:**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `startDate` | string | Yes | Report start date |
| `endDate` | string | Yes | Report end date |
| `format` | string | No | 'csv' or 'xlsx' (default: csv) |

**Response:** File download

---

## 4. Admin Endpoints

### 4.1 Update Class Geofence
```
PUT /classes/:classId/geofence
Authorization: Bearer <token>
Role: ADMIN
```

**Request Body:**
```json
{
  "geofenceLat": -6.200000,
  "geofenceLng": 106.816666,
  "geofenceRadius": 150
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "class-uuid-1",
    "name": "Kelas 10A",
    "geofenceLat": -6.200000,
    "geofenceLng": 106.816666,
    "geofenceRadius": 150
  },
  "message": "Geofence berhasil diperbarui"
}
```

---

### 4.2 Create User
```
POST /users
Authorization: Bearer <token>
Role: ADMIN
```

**Request Body:**
```json
{
  "email": "siswa.baru@school.id",
  "password": "password123",
  "name": "Siswa Baru",
  "nis": "2024099",
  "role": "STUDENT",
  "classId": "class-uuid-1"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-new",
    "email": "siswa.baru@school.id",
    "name": "Siswa Baru",
    "nis": "2024099",
    "role": "STUDENT",
    "classId": "class-uuid-1"
  },
  "message": "User berhasil dibuat"
}
```

---

### 4.3 Get All Users
```
GET /users?role=STUDENT&classId=class-uuid-1
Authorization: Bearer <token>
Role: ADMIN
```

**Query Parameters:**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `role` | string | No | Filter by role |
| `classId` | string | No | Filter by class |
| `page` | integer | No | Page number |
| `limit` | integer | No | Items per page |

---

### 4.4 Update User
```
PUT /users/:userId
Authorization: Bearer <token>
Role: ADMIN
```

---

### 4.5 Delete User
```
DELETE /users/:userId
Authorization: Bearer <token>
Role: ADMIN
```

---

## 5. Error Response Format

All error responses follow this structure:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Lokasi tidak valid",
    "details": [
      {
        "field": "latitude",
        "message": "Latitude harus berupa angka valid"
      }
    ]
  }
}
```

**Common Error Codes:**
| Code | HTTP Status | Description |
| :--- | :--- | :--- |
| `UNAUTHORIZED` | 401 | Token tidak valid atau expired |
| `FORBIDDEN` | 403 | Tidak memiliki akses ke resource |
| `NOT_FOUND` | 404 | Resource tidak ditemukan |
| `VALIDATION_ERROR` | 400 | Data input tidak valid |
| `ALREADY_EXISTS` | 409 | Data sudah ada (duplicate) |
| `INTERNAL_ERROR` | 500 | Kesalahan server |
