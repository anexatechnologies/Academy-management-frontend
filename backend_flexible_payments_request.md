# Technical Request: Flexible Fee Payment & Reminder System

We are implementing a "Flexible Fee Paying Mode" on the frontend. This will allow admins to record partial payments and set a specific "Next Reminder Date" for the remaining balance.

To support this, we need to clarify/update the current backend logic for the **Payments** and **Dashboard** APIs.

### 1. Partial Payments & Rescheduling

**Endpoint**: `POST /api/v1/students/:id/payments`

**Required Logic**:
When a payment is recorded with an `amount` less than the current due balance:

- The system should accept a `next_due_date` field in the payload.
- **Reschedule Remaining Balance**: The backend should automatically update the `due_date` of the next pending installment (EMI) to this provided `next_due_date`.
- **Constraint**: If there are no future installments (e.g., student is paying the last bit), the backend should create a new installment placeholder or update the current one to remain "pending" but with the new `due_date`.

**Example Workflow**:

1.  Total Fees: ₹10,000 | Current Due: ₹10,000 | Due Date: May 16.
2.  Admin records payment of **₹2,000** today.
3.  Admin sets `next_due_date` as **May 21**.
4.  **Backend result**: The remaining balance of ₹8,000 is now scheduled for **May 21**.

---

### 2. Dashboard Reminders (Due Payments)

**Endpoint**: `GET /api/v1/dashboard/due-payments`

**Requirement**:

- Reminders should be strictly date-aware based on the user's feedback.
- Please confirm if this API currently filters by `due_date <= today`.
- To support "reminders only on that date", ensure that if an installment's `due_date` is shifted (as described above), it disappears from the current "Due Payments" list until that new date arrives.

---

### 3. Check for Confirmation

Please confirm:

1.  Is the `next_due_date` field already being processed in the `POST /payments` endpoint?
2.  If so, does it currently handle installment rescheduling/splitting logic correctly?
3.  Are there any specific ENUM values or status codes (e.g., "Partial", "Overridden") we should use on the frontend to indicate these shifts in the EMI schedule?
