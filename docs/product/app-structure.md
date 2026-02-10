# Application Structure

**Application Name:** ClassAttend
**Version:** 1.0.0

---

## 1. Project Structure

```bash
ClassAttend/
├── backend/                    # Backend API (Node.js + Express)
│   ├── src/
│   │   ├── config/             # Database, environment configs
│   │   ├── controllers/        # Request handlers
│   │   ├── middleware/         # Auth, validation middleware
│   │   ├── models/             # Database models (Sequelize/Prisma)
│   │   ├── routes/             # API route definitions
│   │   ├── services/           # Business logic
│   │   ├── utils/              # Helper functions (geo, date, etc.)
│   │   └── index.js            # Entry point
│   ├── prisma/                 # Prisma schema and migrations
│   ├── package.json
│   └── .env.example
│
├── frontend/                   # Frontend (Next.js)
│   ├── src/
│   │   ├── app/                # Next.js App Router pages
│   │   │   ├── (auth)/         # Login, Register pages
│   │   │   ├── student/        # Student dashboard
│   │   │   ├── teacher/        # Teacher dashboard
│   │   │   ├── admin/          # Admin dashboard
│   │   │   └── layout.tsx      # Root layout
│   │   ├── components/         # Reusable UI components
│   │   │   ├── ui/             # Base components (Button, Input, Card)
│   │   │   ├── maps/           # Map-related components
│   │   │   └── layout/         # Header, Sidebar, Footer
│   │   ├── hooks/              # Custom React hooks
│   │   ├── lib/                # API client, utilities
│   │   ├── styles/             # Global CSS
│   │   └── types/              # TypeScript type definitions
│   ├── public/                 # Static assets
│   ├── package.json
│   └── next.config.js
│
├── docs/                       # Documentation (this folder)
└── README.md                   # Project overview
```

---

## 2. Tech Stack

### Backend
| Technology | Purpose |
| :--- | :--- |
| **Node.js** | Runtime environment |
| **Express.js** | Web framework |
| **Prisma** | ORM for database operations |
| **PostgreSQL** | Primary database |
| **JWT** | Authentication tokens |
| **bcrypt** | Password hashing |

### Frontend
| Technology | Purpose |
| :--- | :--- |
| **Next.js 14** | React framework with App Router |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Utility-first styling |
| **Leaflet.js** | Interactive maps |
| **React Query** | API state management |
| **Axios** | HTTP client |

---

## 3. Page Routes

### Public Routes
| Route | Page | Description |
| :--- | :--- | :--- |
| `/` | Landing/Login | Default redirect to login |
| `/login` | Login Page | Authentication form |

### Student Routes (Protected)
| Route | Page | Description |
| :--- | :--- | :--- |
| `/student` | Dashboard | Check-in/out buttons, today's status |
| `/student/history` | History | Past attendance records |

### Teacher Routes (Protected)
| Route | Page | Description |
| :--- | :--- | :--- |
| `/teacher` | Dashboard | Class attendance overview |
| `/teacher/class/:id` | Class Detail | Student list with map |
| `/teacher/reports` | Reports | Export attendance data |

### Admin Routes (Protected)
| Route | Page | Description |
| :--- | :--- | :--- |
| `/admin` | Dashboard | System overview |
| `/admin/users` | User Management | CRUD students/teachers |
| `/admin/classes` | Class Management | CRUD classes + geofence |
| `/admin/settings` | Settings | System configuration |

---

## 4. Component Hierarchy

```
App
├── AuthProvider (Context)
│   ├── LoginPage
│   └── ProtectedRoute
│       ├── StudentLayout
│       │   ├── Header
│       │   ├── StudentDashboard
│       │   │   ├── CheckInButton
│       │   │   ├── CheckOutButton
│       │   │   ├── LocationMap
│       │   │   └── TodayStatus
│       │   └── AttendanceHistory
│       │       └── AttendanceCard
│       │
│       ├── TeacherLayout
│       │   ├── Sidebar
│       │   ├── TeacherDashboard
│       │   │   ├── ClassSelector
│       │   │   ├── AttendanceTable
│       │   │   └── ClassMap
│       │   └── ReportsPage
│       │       └── ExportButton
│       │
│       └── AdminLayout
│           ├── Sidebar
│           ├── AdminDashboard
│           │   └── StatsCards
│           ├── UserManagement
│           │   ├── UserTable
│           │   └── UserFormModal
│           └── ClassManagement
│               ├── ClassTable
│               ├── ClassFormModal
│               └── GeofenceEditor
```

---

## 5. State Management

| State Type | Solution | Usage |
| :--- | :--- | :--- |
| **Server State** | React Query | API data (attendance, users, classes) |
| **Auth State** | Context + JWT | Current user, login status |
| **UI State** | useState/useReducer | Modals, forms, loading states |
| **Location State** | Custom Hook | GPS coordinates |

---

## 6. API Integration

All API calls go through a centralized Axios instance:

```typescript
// lib/api.ts
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor adds JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```
