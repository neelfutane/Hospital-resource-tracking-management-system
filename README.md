# 🏥 MedTrack Pro — Hospital Resource Tracking System

> A real-time MERN stack application for hospitals to monitor and manage beds, equipment, and rooms. Built with Socket.io for live updates to improve emergency resource allocation and patient care efficiency.


## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Seeds & Login — Important Note](#-seeds--login--important-note)
- [Running the App](#-running-the-app)
- [Folder Structure](#-folder-structure)
- [API Endpoints](#-api-endpoints)
- [Socket.io Events](#-socketio-events)
- [Role-Based Access](#-role-based-access-control)
- [Environment Variables](#-environment-variables)
- [NPM Scripts](#-npm-scripts)

---

## 🌟 Overview

Hospitals during emergencies face critical challenges — beds tracked on whiteboards, equipment misplaced across wards, no central visibility. MedTrack Pro solves this by digitizing all hospital resources with live status updates pushed to every connected device via WebSockets.

```
React Dashboard  ←→  Socket.io  ←→  Node/Express API  ←→  MongoDB
      ↓                                     ↓
  Real-time UI                      REST endpoints + JWT Auth
  Ward views                        Change history logging
  Alert system                      Role-based access control
```

---

## ✨ Features

| Feature | Description |
|---|---|
| 🛏️ **Bed Tracking** | Real-time bed availability per ward with patient assignment |
| 🔧 **Equipment Monitor** | Track ventilators, monitors, wheelchairs with location tagging |
| 🚪 **Room Management** | OR rooms, ICU, isolation — live occupancy status |
| 📊 **Dashboard** | Occupancy charts, stat cards, ward-level breakdowns |
| 🔔 **Alert System** | Auto-alerts when resources drop below critical thresholds |
| 👤 **Role-Based Access** | Admin, Doctor, Nurse, Staff with different permissions |
| 📋 **Activity Log** | Full audit trail of every status change with timestamps |
| ⚡ **Live Updates** | Socket.io pushes changes to all connected clients instantly |

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React.js + Vite | UI framework with fast HMR |
| Backend | Node.js + Express.js | REST API server |
| Database | MongoDB + Mongoose | Resource data persistence |
| Real-time | Socket.io | Live status push updates |
| Auth | JWT + bcryptjs | Secure role-based access |
| Validation | Joi | Request body validation |
| Routing | React Router v6 | Client-side navigation |
| HTTP Client | Axios | Frontend API calls |
| Charts | Recharts | Occupancy visualizations |
| Styling | CSS + clsx | Component styling utilities |

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18 or higher
- MongoDB Atlas account (free tier works)
- npm or yarn

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/neelfutane/Hospital-resource-tracking-management-system.git
cd Hospital-resource-tracking-management-system
```

**2. Setup Backend**

```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env` with your values:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/hospital-db
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

**3. Setup Frontend**

```bash
cd ../client
npm install
cp .env.example .env
```

Edit `client/.env`:

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

---

## 🌱 Seeds & Login — Important Note

This project includes a **seed script** that pre-fills the database with sample data and test user accounts to make development faster.

> **You have two options — choose one:**

### ✅ Option A — Use Seed *(Recommended for development)*

Run the seed script to auto-create all sample data:

```bash
cd server
npm run seed
```

This creates:
- 🛏️ **84 beds** across 6 wards
- 🔧 **65 equipment items** (ventilators, monitors, etc.)
- 🚪 **31 rooms** (ICU, OR, isolation, recovery)
- 👤 **4 user accounts** (admin, doctor, nurse, staff)

Then log in using the test credentials below.

### 🔐 Seed Test Credentials

| Role | Email | Password | Ward |
|---|---|---|---|
| Admin | admin@hospital.com | admin123 | All wards |
| Doctor | doctor@hospital.com | doctor123 | General |
| Nurse | nurse@hospital.com | nurse123 | ICU |
| Staff | staff@hospital.com | staff123 | Emergency |

> ⚠️ **Change these passwords immediately if deploying to production.**

---

### ✅ Option B — Skip Seed *(Real world / production)*

If you don't want to use the seed script, you can skip it entirely:

1. Start both servers (see [Running the App](#-running-the-app))
2. Go to `http://localhost:5173/register`
3. Create your admin account manually
4. Log in and start adding beds, equipment, and rooms through the app

```
Register → Login as Admin → Add Beds → Add Equipment → Add Rooms → Invite Staff
```

> 📌 **Seeds are a development tool only. In real hospital production deployments, never run seeds — all data is entered by actual staff through the app.**

---

## ▶️ Running the App

You need **two terminals** running simultaneously:

**Terminal 1 — Backend**

```bash
cd server
npm run dev
```

Server starts at `http://localhost:5000`

**Terminal 2 — Frontend**

```bash
cd client
npm run dev
```

App opens at `http://localhost:5173`

---


## 🔌 API Endpoints

All routes are prefixed with `/api/v1`

### Auth

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register (doctor / nurse / staff) |
| POST | `/auth/login` | Public | Login and receive JWT token |
| POST | `/auth/create-user` | Admin only | Create any role including admin |

### Beds

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/beds` | Protected | Get all beds (filter by `?ward=`) |
| GET | `/beds/:id` | Protected | Get single bed |
| POST | `/beds` | Admin | Add new bed |
| PATCH | `/beds/:id` | Admin / Nurse / Doctor | Update bed status + patient |

### Equipment

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/equipment` | Protected | Get all (filter by `?type=` `?location=`) |
| POST | `/equipment` | Admin | Add new equipment |
| PATCH | `/equipment/:id` | Admin / Nurse | Update status and location |

### Rooms

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/rooms` | Protected | Get all rooms (filter by `?type=`) |
| PATCH | `/rooms/:id` | Admin / Nurse / Doctor | Update room status |

### Other

| Method | Endpoint | Description |
|---|---|---|
| GET | `/logs` | Activity log — last 50 entries (admin only) |
| GET | `/stats/summary` | Hospital-wide occupancy stats |
| GET | `/health` | Server health check → `{ status: "ok" }` |

---

## ⚡ Socket.io Events

| Direction | Event | Payload |
|---|---|---|
| Server → Client | `bed:updated` | Updated bed object |
| Server → Client | `equipment:updated` | Updated equipment object |
| Server → Client | `room:updated` | Updated room object |
| Server → Client | `alert:triggered` | `{ message: string }` |
| Server → Client | `stats:refresh` | Updated occupancy stats |

---

## 👤 Role-Based Access Control

| Feature | Admin | Doctor | Nurse | Staff |
|---|---|---|---|---|
| View Dashboard | ✅ Full | ✅ Full | ✅ Own ward | ✅ View only |
| Add / Edit Beds | ✅ | ✅ | ✅ | ❌ |
| Add Equipment | ✅ | ❌ | ✅ | ❌ |
| Manage Rooms | ✅ | ✅ | ✅ | ❌ |
| View Activity Logs | ✅ All | ✅ Own | ✅ Own ward | ❌ |
| Create User Accounts | ✅ | ❌ | ❌ | ❌ |
| View Stats & Reports | ✅ | ✅ | ✅ | ✅ |

---

## 🔐 Environment Variables

### `server/.env`

| Variable | Example | Description |
|---|---|---|
| `PORT` | `5000` | Express server port |
| `MONGO_URI` | `mongodb+srv://...` | MongoDB Atlas connection string |
| `JWT_SECRET` | `your_secret_key` | Secret for signing JWT tokens |
| `JWT_EXPIRES_IN` | `7d` | Token expiry duration |
| `CLIENT_URL` | `http://localhost:5173` | Frontend URL for CORS |

### `client/.env`

| Variable | Example | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:5000` | Backend API base URL |
| `VITE_SOCKET_URL` | `http://localhost:5000` | Socket.io server URL |

---

## 📦 NPM Scripts

### Server (`cd server`)

| Script | Description |
|---|---|
| `npm run dev` | Start backend with hot reload (nodemon) |
| `npm start` | Start backend for production |
| `npm run seed` | Seed database with sample data |
| `npm test` | Run API tests with Jest |

### Client (`cd client`)

| Script | Description |
|---|---|
| `npm run dev` | Start frontend dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

---

## 🗄️ MongoDB Collections

```
beds          → ward, number, status, patientId, lastUpdated
equipment     → type, serialId, status, location, lastUpdated
rooms         → type, roomId, floor, status, lastUpdated
users         → name, email, passwordHash, role, assignedWard
activitylogs  → resourceType, resourceId, oldStatus, newStatus, updatedBy, timestamp
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">

Built with the **MERN Stack** · Real-time with **Socket.io** · Secured with **JWT**

**MedTrack Pro** — Hospital Resource Tracking System

</div>
