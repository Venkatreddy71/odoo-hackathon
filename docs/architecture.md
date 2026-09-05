# PeoplePay360 System Architecture & Engine Specification

## Tech Stack
- **Database**: MongoDB & Mongoose ORM
- **Backend API**: Node.js & Express.js
- **Frontend UI**: React.js (Vite + Tailwind CSS + Lucide Icons + Recharts)
- **Security**: JWT Authentication, bcrypt password hashing, Role-Based Access Control Middleware
- **Document Engine**: PDFKit PDF Payslip Generator

## Key System Engines

### 1. Contract Overlap Prevention Engine (`Contract.js`)
Blocks any attempt to create overlapping `RUNNING` contracts for the same employee:
$$\text{Overlap Condition: } (\text{Start}_A \le \text{End}_B) \land (\text{End}_A \ge \text{Start}_B)$$

### 2. Sequential Salary Rule Engine (`payrollEngine.js` & `expressionParser.js`)
Evaluates rules ordered by `sequence` (1..N). Rules support:
- **FIXED**: Static amounts (e.g. Meal Allowance = ₹2,000).
- **PERCENTAGE**: Relative percentage of base component (e.g. HRA = 20% of BASIC).
- **FORMULA**: Safe mathematical expressions (e.g. `UNPAID_DAYS * (BASIC / 30)` or `BASIC + HRA + MEAL_ALLOWANCE`).

### 3. Pre-Payroll Validation Auditor (`payrunController.js`)
Audits payruns before marking as paid:
- Checks missing bank accounts.
- Flags unclosed attendance sessions (`MISSING_CHECKOUT`).
- Verifies single applicable contract for period.
