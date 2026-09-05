# PEOPLEPAY360 — Integrated HR & Payroll Management System

PEOPLEPAY360 is a standalone, full-stack MERN (MongoDB, Express.js, React.js, Node.js) web application designed to connect employee contracts, attendance, time off, salary structures, sequential salary rules, and payroll execution into a validated end-to-end workflow.

---

## Central Core Pitch

> "PeoplePay360 connects employee contracts, attendance, time off and salary rules into one validated payroll workflow, so payroll becomes an automated output of the employee's actual HR data instead of a monthly manual investigation."

---

## Key Differentiators & Business Rules

1. **Connected Employee Hub**: Centralizes profile, contract history, clock-in/out records, leave allocations, and payslips.
2. **Contract Overlap Prevention Engine**: Mongoose service validation strictly blocks overlapping `RUNNING` contracts for an employee.
3. **Period-Based Contract Resolution**: Payroll automatically matches the exact contract covering the selected pay period (does NOT simply pick the latest contract).
4. **Sequential Salary Rule Engine**: Executes rules ordered strictly by sequence (1..N). Supports `FIXED`, `PERCENTAGE`, and `FORMULA` calculations with safe expression parsing.
5. **Two-Step Payrun Creation Wizard**:
   - **Step 1**: Select period & salary structure (Does NOT create a database record).
   - **Step 2**: Render employee candidate list & selected employees (Saves payrun in `DRAFT`).
6. **Pre-Payroll Validation & Alerts**: Automatically audits missing bank accounts, unclosed check-outs (`MISSING_CHECKOUT`), and contract issues before marking as paid.
7. **Computer-Generated PDF Payslips**: Integrated PDFKit streaming generator for official downloadable payslips.
8. **Dynamic MongoDB Aggregation Dashboard**: Real-time KPI metrics, department salary breakdown, and monthly salary trends using Recharts.

---

## Tech Stack

- **Database**: MongoDB (Mongoose ORM)
- **Backend**: Node.js, Express.js, JWT, bcryptjs, PDFKit, Jest, Supertest
- **Frontend**: React.js (Vite), Tailwind CSS, Lucide React Icons, Recharts, Axios
- **Environment**: Node.js v24+, npm 11+

---

## Quick Start & Installation

### 1. Prerequisites
Ensure MongoDB Server is running locally on port 27017 (`mongodb://127.0.0.1:27017/peoplepay360`).

### 2. Install Dependencies
```bash
npm install
cd server && npm install
cd ../client && npm install
```

### 3. Seed Hackathon Demo Dataset
```bash
npm run seed
```

### 4. Run Development Servers (Concurrent Backend + Frontend)
```bash
npm run dev
```
- **Backend API**: `http://localhost:5000`
- **Frontend Web Application**: `http://localhost:5173`

---

## Demo Login Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@peoplepay360.com` | `admin123` |
| **HR Manager** | `hr@peoplepay360.com` | `hr123` |
| **Payroll User** | `payroll@peoplepay360.com` | `payroll123` |
| **Employee (Arav Mehta)** | `arav@peoplepay360.com` | `employee123` |

---

## Automated Backend Integration Tests

To run Jest integration tests verifying auth, contract overlap rejection, and payroll engine calculation:
```bash
cd server && npm test
```

---

## Project Structure

```
PeoplePay360/
├── client/                 # React Frontend (Vite + Tailwind + Recharts)
│   ├── src/
│   │   ├── components/     # Layout, Sidebar, Header, ProtectedRoute
│   │   ├── context/        # AuthContext & ToastContext
│   │   ├── pages/          # Login, Dashboard, Employees, Contracts, Attendance, TimeOff, Payruns, Payslips, Users
│   │   └── services/       # Axios API client
├── server/                 # Express Backend REST API
│   ├── config/             # Database connection
│   ├── controllers/        # REST Controllers
│   ├── middleware/         # JWT Auth & Role Access Control
│   ├── models/             # Mongoose Schemas (User, Employee, Contract, Attendance, Payrun, Payslip, etc.)
│   ├── routes/             # API Routers
│   ├── services/           # Payroll Engine, PDF Generator, Seed Script
│   └── tests/              # Jest integration tests
├── docs/                   # Problem Statement, Architecture, Demo Flow
└── README.md
```