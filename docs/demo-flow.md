# PeoplePay360 — Hackathon Demonstration Scenario Guide

Follow hero employee **Arav Mehta** (`EMP001`) through the complete 14-step presentation flow:

## Demo Credentials
- **Admin**: `admin@peoplepay360.com` / `admin123`
- **HR Manager**: `hr@peoplepay360.com` / `hr123`
- **Payroll User**: `payroll@peoplepay360.com` / `payroll123`
- **Employee (Arav Mehta)**: `arav@peoplepay360.com` / `employee123`

---

## 14-Step Presentation Script

1. **Step 1: Login**: Sign in as HR/Payroll Admin.
2. **Step 2: Open Directory**: Navigate to `/employees`.
3. **Step 3: Open Employee Hub**: Click on **Arav Mehta** (`EMP001`) to inspect profile, department, job title, and linked records.
4. **Step 4: Contract Inspection & Overlap Rejection**:
   - Inspect Contract 1 (Expired: Jan 1 – Mar 31, ₹30,000).
   - Inspect Contract 2 (Running: Apr 1 – Dec 31, ₹35,000).
   - Attempt to add an overlapping RUNNING contract for May 1 – Dec 31.
   - **Show system rejection toast and conflict banner!**
5. **Step 5: Attendance Widget & Issue Audit**:
   - Click **Check In** to start live timer tick (`00:00:05`).
   - Click **Check Out**.
   - Show missing checkout audit example.
6. **Step 6: Time Off Balance**:
   - Show Annual Leave: 20 Days Allocated, 3 Approved Used, 17 Remaining.
7. **Step 7: Payrun Wizard Step 1**:
   - Navigate to `/payruns/create`.
   - Select April 2026 period & Regular Executive Salary Structure.
   - Click **CONTINUE** (Verify no payrun document saved yet!).
8. **Step 8: Payrun Wizard Step 2**:
   - Select Arav Mehta and staff.
   - Click **CREATE PAYRUN**.
9. **Step 9: Compute Payroll**:
   - Click **COMPUTE PAYROLL**. Engine automatically resolves Arav's April contract (₹35,000 wage).
10. **Step 10: Rule Breakdown**:
    - Basic (₹35,000) $\rightarrow$ HRA (₹7,000) $\rightarrow$ Meal (₹2,000) $\rightarrow$ Gross (₹44,000) $\rightarrow$ Net.
11. **Step 11: Validate Payroll**:
    - Click **VALIDATE PAYROLL**. System runs pre-flight audit and displays alerts.
12. **Step 12: Mark Paid**:
    - Click **MARK AS PAID**. Status updates to `PAID` and locks records.
13. **Step 13: Download PDF Payslip**:
    - Open Arav's payslip and click **DOWNLOAD PDF PAYSLIP**.
14. **Step 14: Dashboard Update**:
    - Open `/` to view updated Total Net Paid (₹24.8L+), charts, and department breakdown.
