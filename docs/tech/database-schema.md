# Database Schema

**Database:** PostgreSQL
**ORM:** Prisma

---

## 1. Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o{ Attendance : "has many"
    User }o--|| Class : "belongs to"
    Class ||--o{ User : "has many students"
    Class }o--|| User : "has one teacher"
    
    User {
        uuid id PK
        string email UK
        string password_hash
        string name
        string nis
        enum role
        uuid class_id FK
        datetime created_at
        datetime updated_at
    }
    
    Class {
        uuid id PK
        string name
        uuid teacher_id FK
        float geofence_lat
        float geofence_lng
        int geofence_radius
        datetime created_at
        datetime updated_at
    }
    
    Attendance {
        uuid id PK
        uuid user_id FK
        date date
        datetime check_in_time
        datetime check_out_time
        float check_in_lat
        float check_in_lng
        float check_in_accuracy
        enum check_in_status
        float check_out_lat
        float check_out_lng
        float check_out_accuracy
        int duration_minutes
        datetime created_at
        datetime updated_at
    }
```

---

## 2. Table Definitions

### 2.1 `users` Table

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | User email for login |
| `password_hash` | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| `name` | VARCHAR(100) | NOT NULL | Full name |
| `nis` | VARCHAR(20) | UNIQUE, NULLABLE | Student ID (only for students) |
| `role` | ENUM | NOT NULL | 'STUDENT', 'TEACHER', 'ADMIN' |
| `class_id` | UUID | FK → classes.id, NULLABLE | Student's class (NULL for teachers/admins) |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Record creation time |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update time |

**Indexes:**
- `idx_users_email` on `email`
- `idx_users_role` on `role`
- `idx_users_class_id` on `class_id`

---

### 2.2 `classes` Table

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| `name` | VARCHAR(50) | NOT NULL | Class name (e.g., "Kelas 10A") |
| `teacher_id` | UUID | FK → users.id, NULLABLE | Assigned teacher |
| `geofence_lat` | DECIMAL(10,8) | NULLABLE | Geofence center latitude |
| `geofence_lng` | DECIMAL(11,8) | NULLABLE | Geofence center longitude |
| `geofence_radius` | INTEGER | DEFAULT 100 | Geofence radius in meters |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Record creation time |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update time |

**Indexes:**
- `idx_classes_teacher_id` on `teacher_id`

---

### 2.3 `attendances` Table

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| `user_id` | UUID | FK → users.id, NOT NULL | Student who checked in |
| `date` | DATE | NOT NULL | Attendance date |
| `check_in_time` | TIMESTAMP | NOT NULL | Time of check-in |
| `check_out_time` | TIMESTAMP | NULLABLE | Time of check-out |
| `check_in_lat` | DECIMAL(10,8) | NOT NULL | Check-in latitude |
| `check_in_lng` | DECIMAL(11,8) | NOT NULL | Check-in longitude |
| `check_in_accuracy` | DECIMAL(10,2) | NULLABLE | GPS accuracy in meters |
| `check_in_status` | ENUM | NOT NULL | 'INSIDE', 'OUTSIDE' geofence |
| `check_out_lat` | DECIMAL(10,8) | NULLABLE | Check-out latitude |
| `check_out_lng` | DECIMAL(11,8) | NULLABLE | Check-out longitude |
| `check_out_accuracy` | DECIMAL(10,2) | NULLABLE | GPS accuracy in meters |
| `duration_minutes` | INTEGER | NULLABLE | Calculated duration |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Record creation time |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update time |

**Indexes:**
- `idx_attendances_user_id` on `user_id`
- `idx_attendances_date` on `date`
- `idx_attendances_user_date` on `(user_id, date)` (composite, unique per day)

**Constraints:**
- UNIQUE (`user_id`, `date`) - One attendance record per student per day

---

## 3. Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  STUDENT
  TEACHER
  ADMIN
}

enum GeofenceStatus {
  INSIDE
  OUTSIDE
}

model User {
  id           String       @id @default(uuid())
  email        String       @unique
  passwordHash String       @map("password_hash")
  name         String
  nis          String?      @unique
  role         Role
  classId      String?      @map("class_id")
  createdAt    DateTime     @default(now()) @map("created_at")
  updatedAt    DateTime     @updatedAt @map("updated_at")

  // Relations
  class        Class?       @relation("ClassStudents", fields: [classId], references: [id])
  teacherOf    Class[]      @relation("ClassTeacher")
  attendances  Attendance[]

  @@index([email])
  @@index([role])
  @@index([classId])
  @@map("users")
}

model Class {
  id             String   @id @default(uuid())
  name           String
  teacherId      String?  @map("teacher_id")
  geofenceLat    Decimal? @map("geofence_lat") @db.Decimal(10, 8)
  geofenceLng    Decimal? @map("geofence_lng") @db.Decimal(11, 8)
  geofenceRadius Int      @default(100) @map("geofence_radius")
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  // Relations
  teacher  User?  @relation("ClassTeacher", fields: [teacherId], references: [id])
  students User[] @relation("ClassStudents")

  @@index([teacherId])
  @@map("classes")
}

model Attendance {
  id               String         @id @default(uuid())
  userId           String         @map("user_id")
  date             DateTime       @db.Date
  checkInTime      DateTime       @map("check_in_time")
  checkOutTime     DateTime?      @map("check_out_time")
  checkInLat       Decimal        @map("check_in_lat") @db.Decimal(10, 8)
  checkInLng       Decimal        @map("check_in_lng") @db.Decimal(11, 8)
  checkInAccuracy  Decimal?       @map("check_in_accuracy") @db.Decimal(10, 2)
  checkInStatus    GeofenceStatus @map("check_in_status")
  checkOutLat      Decimal?       @map("check_out_lat") @db.Decimal(10, 8)
  checkOutLng      Decimal?       @map("check_out_lng") @db.Decimal(11, 8)
  checkOutAccuracy Decimal?       @map("check_out_accuracy") @db.Decimal(10, 2)
  durationMinutes  Int?           @map("duration_minutes")
  createdAt        DateTime       @default(now()) @map("created_at")
  updatedAt        DateTime       @updatedAt @map("updated_at")

  // Relations
  user User @relation(fields: [userId], references: [id])

  @@unique([userId, date])
  @@index([userId])
  @@index([date])
  @@map("attendances")
}
```

---

## 4. Sample Data

### Users
| id | email | name | nis | role | class_id |
| :--- | :--- | :--- | :--- | :--- | :--- |
| uuid-1 | admin@school.id | Administrator | NULL | ADMIN | NULL |
| uuid-2 | guru1@school.id | Pak Budi | NULL | TEACHER | NULL |
| uuid-3 | siswa1@school.id | Ahmad Santoso | 2024001 | STUDENT | class-uuid-1 |

### Classes
| id | name | teacher_id | geofence_lat | geofence_lng | geofence_radius |
| :--- | :--- | :--- | :--- | :--- | :--- |
| class-uuid-1 | Kelas 10A | uuid-2 | -6.200000 | 106.816666 | 100 |
| class-uuid-2 | Kelas 10B | uuid-2 | -6.200000 | 106.816666 | 100 |

### Attendances
| id | user_id | date | check_in_time | check_out_time | check_in_status | duration_minutes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| att-uuid-1 | uuid-3 | 2026-02-06 | 07:30:00 | 12:00:00 | INSIDE | 270 |
