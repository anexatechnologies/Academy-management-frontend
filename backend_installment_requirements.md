# Backend Requirements for Installments & Refunds

Currently, the frontend relies on the `amount_due` field in the `installments` array from the `GET /api/v1/students/:id` details API. However, when an installment is fully paid, the backend sets this `amount_due` to `"0.00"`.

While this logic is technically correct for tracking what's left, it forces the frontend EMI Schedule table to show `₹0.00` in the "Amount Due" column for paid installments. This is visually confusing because admins need to see what the *original scheduled amount* was.

Furthermore, when a refund is processed via the Payments API, the `student_course` fee totals are correctly reversed, but the corresponding `installment` is not being tracked or reversed back to pending.

Below are the changes required from the backend to ensure accurate tracking and historical rendering.

---

## 1. Add `original_amount` to Installments

The `installments` records returned in the student details need a permanent record of the original due amount.

**Current Output (`GET /api/v1/students/:id`):** 
```json
{
    "id": 1,
    "student_course_id": 420001,
    "installment_number": 1,
    "amount_due": "0.00",            // Paid, so it goes to zero
    "due_date": "2026-03-31...",
    "status": "paid",
    "paid_on": "2026-03-08..."
}
```

**Required Change:** Add `original_amount` that never changes.
```json
{
    "id": 1,
    "student_course_id": 420001,
    "installment_number": 1,
    "original_amount": "127.32",     // NEW: The scheduled EMI amount. Never changes.
    "amount_due": "0.00",            // Keep this. It drops to 0 when paid.
    "due_date": "2026-03-31...",
    "status": "paid",
    "paid_on": "2026-03-08..."
}
```

---

## 2. Implement Installment Reversal on Refunds

When the admin issues a refund using `POST /api/v1/payments/:id/refund`, the backend must reverse the specific installment that was originally paid by that transaction.

**Required Logic on Refund:**
1. **Identify the Installment:** Find the installment that was marked as "paid" by the original payment transaction.
2. **Reverse the Status:** Change the installment `status` back to `pending`.
3. **Reset the Amount Due:** Set `amount_due` back to the `original_amount`.
4. **Clear Paid Date:** Set `paid_on` back to `null`.
5. **Sync Course Fees:** Deduct the refunded amount from `fees_paid` and add it back to `fees_remaining` on the `student_course` association.

--- 

## 3. Link Payments to Installments (Optional but Recommended)

Currently, the `installments` data does not carry a `payment_id`, and the payments API (`GET /api/v1/students/:id/payments`) does not tell the frontend *which* installment was paid. 

It is highly recommended to add an `installment_id` foreign key onto the `payments` table. This provides a strict audit trail and makes the refund reversal logic described in Setp 2 much easier to implement accurately on the backend.
