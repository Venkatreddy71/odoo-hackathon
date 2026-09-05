# PEOPLEPAY360 — Core Problem Statement & Solution Overview

## Problem Statement

> "HR data exists, but employee, contract, attendance, leave and payroll information are not sufficiently connected when payroll decisions need to be made."

In legacy organization structures, HR data is siloed:
- Attendance is recorded in biometric or timekeeping logs.
- Contracts and salary amendments exist in HR spreadsheets.
- Time off requests are approved in separate leave portals.
- Payroll managers have to perform monthly manual investigations to verify contract dates, leave balances, worked hours, and missing check-outs before disbursing salaries.

This causes:
- Payroll calculation errors (overpayment or underpayment).
- Incorrect leave balance calculations.
- Overlapping contract conflicts.
- Delays and immense manual overhead.

---

## Solution Philosophy

> "Payroll should not be a monthly investigation. Payroll should be the natural output of connected HR data."

PeoplePay360 places the **Employee Hub** at the center of the architecture:

```
                    PEOPLEPAY360
                         |
                    EMPLOYEE HUB
                         |
       +-----------------+-----------------+
       |                 |                 |
    CONTRACT         ATTENDANCE         TIME OFF
       |                 |                 |
       +-----------------+-----------------+
                         |
                  PAYROLL ENGINE
                         |
                  SALARY RULES
                         |
                      PAYSLIP
                         |
                      PAYRUN
                         |
              VALIDATE → MARK PAID
                         |
                     DASHBOARD
```
