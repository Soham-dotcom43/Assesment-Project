# Employee Attendance Management System

Full-stack MERN application built for the Inner Eye Consultancy Services LLP developer assignment.

## Features

- **Auth** — JWT-based registration/login, role-based access (`employee`, `hr`, `admin`)
- **Attendance** — daily check-in/check-out, automatic working-hours calculation, automatic status detection (present / late / half-day)
- **Leave management** — apply for leave, HR approval/rejection workflow, automatic leave-balance deduction on approval, and automatic "on-leave" attendance marking for the approved date range
- **HR dashboard** — live headcount, today's present/late/absent/on-leave counts, department breakdown, pending leave queue
- **Employee dashboard** — today's status, monthly hours/attendance summary, remaining leave balance
- **Employee directory** — HR/admin can search, add, and deactivate employee accounts
- **Attendance records** — HR/admin can view and manually adjust any employee's daily record

## Tech stack

- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT auth, bcrypt password hashing
- **Frontend:** React (Create React App), React Router, Axios, plain CSS (no UI framework)

## Project structure

```
attendance-system/
├── backend/     Express REST API
└── frontend/    React single-page app
```

## Prerequisites

- Node.js 18+ and npm
- MongoDB running locally, or a free MongoDB Atlas cluster

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
- Set `MONGO_URI` to your local or Atlas connection string
- Set `JWT_SECRET` to any long random string
- Optionally adjust `ADMIN_EMAIL` / `ADMIN_PASSWORD` — this is the first HR/admin login

Create the initial admin account (run once):

```bash
npm run seed:admin
```

Start the API:

```bash
npm run dev        # with nodemon, auto-restarts on change
# or
npm start
```

The API runs on `http://localhost:5000` by default. Check `GET /api/health` to confirm it's up.

## 2. Frontend setup

In a new terminal:

```bash
cd frontend
npm install
cp .env.example .env
```

`.env` should point at your running API (default is already correct for local dev):

```
REACT_APP_API_URL=http://localhost:5000/api
```

Start the app:

```bash
npm start
```

The app opens at `http://localhost:3000`.

## 3. Using the app

- **Sign in as admin/HR:** use the `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `backend/.env` (created by the seed script) at `/login`.
- **Sign up as an employee:** go to `/register` — new accounts are created with the `employee` role automatically.
- HR/admin can promote accounts to `hr` from the Employee Directory (admin only) by adding a new account with that role, or via a direct database update for existing users.

## API overview

| Method | Route                              | Access        | Description                          |
|--------|-------------------------------------|---------------|---------------------------------------|
| POST   | /api/auth/register                  | Public        | Employee self-signup                 |
| POST   | /api/auth/login                     | Public        | Login, returns JWT                   |
| GET    | /api/auth/me                        | Private       | Current user profile                 |
| POST   | /api/attendance/check-in            | Employee      | Check in for today                   |
| POST   | /api/attendance/check-out           | Employee      | Check out for today                  |
| GET    | /api/attendance/today               | Employee      | Today's own record                   |
| GET    | /api/attendance/my-history          | Employee      | Own attendance history               |
| GET    | /api/attendance/all                 | HR/Admin      | All attendance records (filterable)  |
| PUT    | /api/attendance/:id                 | HR/Admin      | Manually adjust a record             |
| POST   | /api/leaves                         | Employee      | Apply for leave                      |
| GET    | /api/leaves/my                      | Employee      | Own leave requests                   |
| PUT    | /api/leaves/:id/cancel              | Employee      | Cancel a pending request             |
| GET    | /api/leaves                         | HR/Admin      | All leave requests (filterable)      |
| PUT    | /api/leaves/:id/review              | HR/Admin      | Approve/reject a request             |
| GET    | /api/employees                      | HR/Admin      | List/search employees                |
| POST   | /api/employees                      | HR/Admin      | Create an employee account           |
| PUT    | /api/employees/:id                  | HR/Admin      | Update an employee                   |
| DELETE | /api/employees/:id                  | Admin         | Deactivate an employee               |
| PUT    | /api/employees/me/profile           | Private       | Update own profile/password          |
| GET    | /api/dashboard/me                   | Private       | Employee dashboard summary           |
| GET    | /api/dashboard/hr                   | HR/Admin      | HR dashboard summary                 |

## Notes on design decisions

- **Working hours** are computed server-side from `checkIn`/`checkOut` timestamps, never trusted from the client.
- **Late detection** compares check-in time against `LATE_AFTER` (configurable in `.env`).
- **Leave deduction** happens only on approval, not on submission, and unpaid leave does not touch the balance.
- **One attendance record per employee per day** is enforced with a unique compound index (`employee` + `date`).
- Passwords are hashed with bcrypt; JWTs are used for stateless auth with role-based route guards on the backend (never trust the frontend alone for authorization).

## Deliverables checklist (per assignment brief)

- [x] Source code (this repository)
- [x] Database schema (Mongoose models in `backend/models`, auto-created on first run)
- [x] Setup instructions (this file)
- [x] Environment/config templates (`.env.example` in both `backend/` and `frontend/`)
