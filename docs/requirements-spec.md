# Requirements Specification — UBMS

> **Version:** 1.0 | **Date:** 2026-08-26 | **Status:** Draft for Review
> **Currency:** Philippine Peso (₱) throughout all modules

---

## 1. Module: User Authentication & Management

### FR-AUTH-001: User Login
- **User Story:** As an authorized user, I want to log in with email and password so that I can access the system securely.
- **Priority:** P0 (Critical)
- **Source:** Pain Point — secure access to business records
- **Acceptance Criteria:**
  - GIVEN a registered and active user account, WHEN the user enters a valid email and correct password, THEN the system authenticates the user and redirects to the dashboard.
  - GIVEN an invalid email or incorrect password, WHEN the user attempts login, THEN the system displays a generic error message "Invalid email or password" without revealing which field is incorrect.
  - GIVEN 5 consecutive failed login attempts on a single account, WHEN a subsequent attempt is made, THEN the system locks the account for 15 minutes and displays "Account locked. Try again in 15 minutes."
  - GIVEN a user with a deactivated account, WHEN the user attempts login, THEN the system displays "Account deactivated. Contact administrator."

### FR-AUTH-002: Session Management
- **User Story:** As a user, I want my session to persist during active use but expire after inactivity so that my data remains secure.
- **Priority:** P0 (Critical)
- **Acceptance Criteria:**
  - GIVEN an authenticated user, WHEN the user is active (interacting with the UI), THEN the session remains valid indefinitely.
  - GIVEN an authenticated user, WHEN no user interaction occurs for 30 consecutive minutes, THEN the system automatically logs out the user and redirects to the login page.
  - GIVEN a logged-out user, WHEN the user attempts to access a protected route, THEN the system redirects to the login page.
  - GIVEN a user closes the browser, WHEN the user reopens the browser and navigates to the application within the session duration, THEN the user remains logged in (persistent sessions via Supabase Auth).

### FR-AUTH-003: User Management (Admin)
- **User Story:** As an administrator, I want to create, edit, and deactivate user accounts so that I control who can access the system.
- **Priority:** P1 (High)
- **Acceptance Criteria:**
  - GIVEN an admin user, WHEN the admin creates a new user with email, full name, and role, THEN the system creates the account and sends a password setup email to the user.
  - GIVEN an admin user, WHEN the admin edits an existing user's full name or role, THEN the system saves the changes and they take effect immediately.
  - GIVEN an admin user, WHEN the admin deactivates a user account, THEN the deactivated user cannot log in and any active session is terminated immediately.
  - GIVEN an admin user, WHEN the admin views the user list, THEN the system displays all users with their email, full name, role, status (active/inactive), and last login date.
  - The system supports exactly two roles: `admin` and `staff`.
  - ONLY users with the `admin` role can access the user management screen.

### FR-AUTH-004: Password Management
- **User Story:** As a user, I want to reset my password so that I can regain access if I forget it.
- **Priority:** P1 (High)
- **Acceptance Criteria:**
  - GIVEN a user on the login page, WHEN the user clicks "Forgot Password", THEN the system prompts for an email address and sends a password reset link if the email is registered.
  - GIVEN a valid password reset link, WHEN the user clicks it and enters a new password, THEN the system updates the password and the user can log in with the new password.
  - GIVEN a password reset link, WHEN more than 1 hour has elapsed since the link was sent, THEN the link expires and the system displays "Link expired. Request a new one."
  - Passwords must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.

---

## 2. Module: Finance (HIGHEST PRIORITY)

### FR-FIN-001: Customer Receivables Tracking
- **User Story:** As a business operator, I want to track amounts owed by each customer so that I can manage collections effectively.
- **Priority:** P0 (Critical)
- **Source:** Pain Point #1, #3 — manual receipt tracking, no centralized financial view
- **Acceptance Criteria:**
  - GIVEN a B2B fulfillment completed or a B2C printing order released, WHEN the system processes the status change, THEN the system creates a receivable record with: customer_id, source_type (B2B or B2C), source_id, amount (₱), due_date, and status (Outstanding).
  - GIVEN an existing receivable with status "Outstanding", WHEN a payment is recorded against it, THEN the system updates the receivable status to "Partially Paid" if partial payment, or "Fully Paid" if full payment.
  - The stored statuses for receivables are: **Outstanding, Partially Paid, Fully Paid, Voided**. "Overdue" is NOT a stored status — it is a computed flag (see FR-FIN-005).
  - The outstanding balance is calculated as: `outstanding_balance = receivable.amount - SUM(all payments linked to this receivable)`.
  - All monetary values are stored and displayed in Philippine Peso (₱) with exactly 2 decimal places.

### FR-FIN-002: Supplier Payables Tracking
- **User Story:** As a business operator, I want to track amounts I owe to suppliers so that I can manage my obligations.
- **Priority:** P0 (Critical)
- **Source:** Pain Point #2, #3 — manual calculations, no centralized financial view
- **Acceptance Criteria:**
  - GIVEN a B2B purchase order that has reached "Fully Received" status, WHEN the system processes the status change, THEN the system automatically creates a payable record with: supplier_id, source_type (B2B), source_id, amount (₱), due_date, and status (Outstanding).
  - GIVEN an existing payable with status "Outstanding", WHEN a payment is recorded against it, THEN the system updates the payable status to "Partially Paid" if partial payment, or "Fully Paid" if full payment.
  - The stored statuses for payables are: **Outstanding, Partially Paid, Fully Paid, Voided**. "Overdue" is NOT a stored status — it is a computed flag (see FR-FIN-005).
  - The outstanding balance is calculated as: `outstanding_balance = payable.amount - SUM(all payments linked to this payable)`.
  - All monetary values are in Philippine Peso (₱) with exactly 2 decimal places.

### FR-FIN-003: Payment Recording
- **User Story:** As a business operator, I want to record payments received from customers and made to suppliers so that balances stay accurate.
- **Priority:** P0 (Critical)
- **Source:** Pain Point #1, #2 — manual receipt tracking, manual calculations
- **Acceptance Criteria:**
  - GIVEN a user on the payment recording screen, WHEN the user selects a receivable or payable, enters payment amount (₱), payment date, payment method (Cash/Bank Transfer/Check), and optional reference number, THEN the system creates a payment record and recalculates the outstanding balance.
  - GIVEN a payment amount entered, WHEN the payment amount exceeds the outstanding balance, THEN the system displays a warning "Payment exceeds outstanding balance" and requires explicit confirmation before saving.
  - GIVEN a payment amount of ₱0 or negative, WHEN the user attempts to save, THEN the system rejects the entry and displays "Payment amount must be greater than zero."
  - GIVEN a saved payment, WHEN the payment amount equals the outstanding balance, THEN the system automatically sets the receivable/payable status to "Fully Paid".
  - GIVEN a saved payment, WHEN the payment amount is less than the outstanding balance, THEN the system sets the status to "Partially Paid".
  - Each payment record contains: id, payment_type (receivable/payable), source_id, amount, payment_date, payment_method, reference_number, recorded_by (user_id), created_at.

### FR-FIN-004: Outstanding Balance Auto-Calculation
- **User Story:** As a business operator, I want outstanding balances calculated automatically so that I never need to compute them manually.
- **Priority:** P0 (Critical)
- **Source:** Pain Point #2 — manual calculations
- **Acceptance Criteria:**
  - GIVEN a receivable with amount ₱50,000 and payments totaling ₱20,000, WHEN any user views the receivable, THEN the system displays "Remaining Balance: ₱30,000.00".
  - GIVEN a payable with amount ₱100,000 and payments totaling ₱100,000, WHEN any user views the payable, THEN the system displays "Remaining Balance: ₱0.00" and status "Fully Paid".
  - Balance calculations occur in real-time upon any payment creation, edit, or deletion.
  - The formula used is: `remaining_balance = original_amount - SUM(all linked payment amounts)`.
  - The system never stores the remaining balance as a mutable field — it is always computed from the source amount and linked payments.

### FR-FIN-005: Due Date Tracking and Overdue Identification
- **User Story:** As a business operator, I want to see which receivables and payables are overdue so that I can prioritize collections and payments.
- **Priority:** P0 (Critical)
- **Source:** Pain Point #3 — no centralized financial view
- **Acceptance Criteria:**
  - "Overdue" is a **computed flag**, not a stored status. The formula is: `is_overdue = (status IN ('Outstanding', 'Partially Paid')) AND (due_date < CURRENT_DATE)`. This is computed on every query (database view or application-level filter), never stored as a mutable field.
  - GIVEN a Finance dashboard view, WHEN the user views it, THEN the system displays a count of overdue receivables and overdue payables (where is_overdue = true) with their total amounts.
  - GIVEN an overdue receivable, WHEN a payment is recorded, THEN the stored status changes to "Partially Paid" or "Fully Paid" and the is_overdue flag re-evaluates to false if the balance is now zero.
  - Overdue items are highlighted with a red background/badge (e.g., `bg-red-100` or `text-red-600`) in all finance lists.

### FR-FIN-006: Payment History
- **User Story:** As a business operator, I want to see the complete payment history for any customer or supplier so that I can verify past transactions.
- **Priority:** P0 (Critical)
- **Source:** Pain Point #1 — manual receipt tracking
- **Acceptance Criteria:**
  - GIVEN a customer or supplier record, WHEN the user navigates to the payment history view, THEN the system displays all payments (received or made) for that entity in reverse chronological order.
  - Each payment history entry displays: payment date, amount (₱), payment method, reference number, source document (invoice/PO number), and the user who recorded it.
  - GIVEN a payment history list, WHEN there are more than 20 entries, THEN the system paginates the results (20 per page).
  - The payment history is read-only (payments cannot be edited after creation — they can only be voided with a reason, per FR-FIN-010).

### FR-FIN-007: Searchable Financial Transactions
- **User Story:** As a business operator, I want to search financial transactions by keyword, date range, or entity so that I can find records quickly.
- **Priority:** P0 (Critical)
- **Source:** Pain Point #1, #3 — difficult to search physical receipts
- **Acceptance Criteria:**
  - GIVEN the Finance search interface, WHEN the user enters a search term, THEN the system searches across: customer/supplier name, reference number, payment method, and amount.
  - GIVEN the Finance search interface, WHEN the user specifies a date range (from_date, to_date), THEN the system filters results to transactions within that range (inclusive).
  - GIVEN the Finance search interface, WHEN the user filters by transaction type (Receivable/Payable/Payment), THEN the system displays only matching transactions.
  - Search results display: date, type, entity name, amount (₱), status, and a link to the source document.
  - Search results are paginated (20 per page) and sortable by date, amount, or entity name.

### FR-FIN-008: Receivables Summary
- **User Story:** As a business operator, I want a summary of all customer receivables so that I can see total money owed to me.
- **Priority:** P0 (Critical)
- **Acceptance Criteria:**
  - GIVEN the Finance dashboard, WHEN the user views the receivables summary, THEN the system displays: total outstanding amount (₱), total overdue amount (₱), count of outstanding receivables, and count of overdue receivables.
  - The receivables summary includes a list of all receivables grouped by status: Outstanding, Partially Paid, Overdue, Fully Paid.
  - Each receivable in the list shows: customer name, source document number, original amount (₱), outstanding balance (₱), due date, and status.

### FR-FIN-009: Payables Summary
- **User Story:** As a business operator, I want a summary of all supplier payables so that I can see total money I owe.
- **Priority:** P0 (Critical)
- **Acceptance Criteria:**
  - GIVEN the Finance dashboard, WHEN the user views the payables summary, THEN the system displays: total outstanding amount (₱), total overdue amount (₱), count of outstanding payables, and count of overdue payables.
  - The payables summary includes a list of all payables grouped by status: Outstanding, Partially Paid, Overdue, Fully Paid.
  - Each payable in the list shows: supplier name, source document number, original amount (₱), outstanding balance (₱), due date, and status.

### FR-FIN-010: Payment Voiding
- **User Story:** As an admin, I want to void an incorrect payment record so that errors can be corrected with an audit trail.
- **Priority:** P1 (High)
- **Acceptance Criteria:**
  - GIVEN an admin user viewing a payment record, WHEN the admin clicks "Void" and enters a reason, THEN the system marks the payment as voided, recalculates the outstanding balance (adding back the voided amount), and records the void reason and admin user.
  - Voided payments remain visible in history with a "VOIDED" label and the original details grayed out.
  - ONLY users with the `admin` role can void payments.
  - The system does not allow deletion of payment records — only voiding with audit trail.

---

## 3. Module: B2B Fabric Trading

### FR-B2B-001: Pre-Order Creation
- **User Story:** As a B2B operator, I want to create pre-orders for customer fabric requests so that I can track demand before issuing purchase orders.
- **Priority:** P1 (High)
- **Source:** Pain Point #5 — no order-to-delivery tracking
- **Acceptance Criteria:**
  - GIVEN a user on the B2B Pre-Orders screen, WHEN the user creates a pre-order by selecting a customer, entering a date, and adding line items (product, quantity, unit price), THEN the system saves the pre-order with status "Draft".
  - Each pre-order contains: id, customer_id, date, status, notes, created_by, created_at.
  - Each pre-order item contains: id, pre_order_id, product_id, quantity (numeric, ≥1), unit_price (₱, ≥0.01).
  - Pre-order total = SUM(quantity × unit_price) for all line items.
  - Valid statuses: Draft, Submitted, Converted, Cancelled.

### FR-B2B-002: Pre-Order Status Transitions
- **User Story:** As a B2B operator, I want pre-orders to follow a defined workflow so that the process is consistent.
- **Priority:** P1 (High)
- **Acceptance Criteria:**
  - GIVEN a pre-order with status "Draft", WHEN the user submits it, THEN the status changes to "Submitted".
  - GIVEN a pre-order with status "Submitted", WHEN the user converts it to a Purchase Order, THEN the status changes to "Converted" and a new PO is created with the pre-order's line items.
  - GIVEN a pre-order with status "Draft" or "Submitted", WHEN the user cancels it, THEN the status changes to "Cancelled".
  - A "Converted" or "Cancelled" pre-order cannot transition to any other status.
  - Valid transitions: Draft → Submitted → Converted, Draft → Cancelled, Submitted → Converted, Submitted → Cancelled.

### FR-B2B-003: Purchase Order Creation
- **User Story:** As a B2B operator, I want to create purchase orders to suppliers so that I can procure fabric for customer orders.
- **Priority:** P1 (High)
- **Acceptance Criteria:**
  - GIVEN a user on the B2B Purchase Orders screen, WHEN the user creates a PO by selecting a supplier, entering a PO number, date, and adding line items (product, ordered quantity, unit price), THEN the system saves the PO with status "Draft".
  - A PO can be created from a converted pre-order (pre-populated items) or manually.
  - Each PO contains: id, pre_order_id (nullable), supplier_id, po_number (unique), date, status, created_by, created_at.
  - Each PO item contains: id, po_id, product_id, ordered_qty, unit_price (₱), received_qty (default 0).
  - PO total = SUM(ordered_qty × unit_price) for all line items.
  - Valid statuses: Draft, Submitted, Partially Received, Fully Received, Completed, Cancelled.

### FR-B2B-004: Purchase Order Status Transitions
- **User Story:** As a B2B operator, I want purchase orders to follow a defined workflow from submission to completion.
- **Priority:** P1 (High)
- **Acceptance Criteria:**
  - Valid transitions:
    - Draft → Submitted (user submits the PO)
    - Submitted → Partially Received (at least one but not all items received)
    - Submitted → Fully Received (all items received with zero variance)
    - Partially Received → Fully Received (all remaining items received)
    - Partially Received → Partially Received (additional receiving, still not complete)
    - Fully Received → Completed (manual transition by user after verifying receiving and confirming the payable is settled)
    - Draft → Cancelled, Submitted → Cancelled (user cancels)
  - GIVEN a PO with status "Completed" or "Cancelled", WHEN any transition is attempted, THEN the system rejects the transition.
  - The system automatically determines "Partially Received" vs "Fully Received" based on receiving records (see FR-B2B-006).

### FR-B2B-005: Receiving Record Creation
- **User Story:** As a B2B operator, I want to record received quantities against a purchase order so that I can track what actually arrived.
- **Priority:** P1 (High)
- **Source:** Pain Point #5 — ordered vs received quantities not tracked
- **Acceptance Criteria:**
  - GIVEN a PO with status "Submitted" or "Partially Received", WHEN the user creates a receiving record, THEN the system prompts for each PO item: received quantity and optional variance reason.
  - Each receiving record contains: id, po_id, receiving_date, received_by (user_id), created_at.
  - Each receiving item contains: id, receiving_id, po_item_id, received_qty, variance_qty, variance_reason.
  - `variance_qty = received_qty - ordered_qty` (per item, per receiving event; cumulative across multiple receiving events for the same PO item).
  - The receiving date defaults to today but is editable.

### FR-B2B-006: Ordered vs Received Quantity Tracking
- **User Story:** As a B2B operator, I want to see ordered vs received quantities side by side so that I can identify shortages and excesses immediately.
- **Priority:** P1 (High)
- **Source:** Pain Point #5 — no order-to-delivery tracking
- **Acceptance Criteria:**
  - GIVEN a PO with receiving records, WHEN the user views the PO detail, THEN the system displays for each item: ordered quantity, total received quantity, variance (received − ordered), and variance reason.
  - Example: Ordered 1,000 yards → Received 997 yards → Variance: −3 yards → Reason: "Short received".
  - Variance is calculated as: `variance = cumulative_received_qty - ordered_qty`.
  - Negative variance indicates shortage; positive variance indicates excess; zero indicates exact match.
  - The PO-level summary shows: total items, items with shortage, items with excess, items fully received.

### FR-B2B-007: Automatic Shortage/Excess Calculation
- **User Story:** As a B2B operator, I want the system to automatically calculate shortages and excesses so that I don't need to compute them manually.
- **Priority:** P1 (High)
- **Source:** Pain Point #2 — manual calculations
- **Acceptance Criteria:**
  - GIVEN a receiving record is saved, WHEN the received quantity differs from the ordered quantity, THEN the system automatically calculates and displays the variance.
  - The calculation is: `variance = received_qty - ordered_qty`.
  - If variance < 0: display as "Shortage: |variance| [unit]" in red.
  - If variance > 0: display as "Excess: +variance [unit]" in blue.
  - If variance = 0: display as "Exact" in green.
  - The calculation is performed per PO item and aggregated at the PO level.

### FR-B2B-008: Manual Variance/Reason Entry
- **User Story:** As a B2B operator, I want to enter a reason for any quantity variance so that discrepancies are documented.
- **Priority:** P1 (High)
- **Acceptance Criteria:**
  - GIVEN a receiving record where variance ≠ 0 for any item, WHEN the user saves the record, THEN the system requires a variance reason text field for each item with non-zero variance.
  - GIVEN a receiving record where variance = 0 for all items, WHEN the user saves, THEN the variance reason field is optional.
  - Variance reason is a free-text field (max 500 characters).
  - The variance reason is stored per receiving item and displayed in the PO detail view and receiving record view.

### FR-B2B-009: Fulfillment Record Creation
- **User Story:** As a B2B operator, I want to create fulfillment records when delivering fabric to customers so that I can track what was delivered.
- **Priority:** P1 (High)
- **Acceptance Criteria:**
  - GIVEN a user on the B2B Fulfillments screen, WHEN the user creates a fulfillment by selecting a customer, entering a date, and adding line items (product, quantity, unit price), THEN the system saves the fulfillment with status "Pending".
  - Each fulfillment contains: id, customer_id, fulfillment_date, status, notes, created_by, created_at.
  - Each fulfillment item contains: id, fulfillment_id, product_id, quantity, unit_price (₱).
  - Fulfillment total = SUM(quantity × unit_price).
  - Valid statuses: Pending, In Progress, Completed, Cancelled.
  - Valid transitions: Pending → In Progress → Completed, Pending → Cancelled, In Progress → Completed, In Progress → Cancelled.
  - When a fulfillment is marked "Completed", the system creates a receivable in Finance (per FR-FIN-001) with the fulfillment total as the amount.
  - If a completed fulfillment is cancelled and an unpaid receivable exists (status Outstanding or Partially Paid), the receivable status changes to "Voided". If payments already exist against the receivable, the fulfillment cannot be cancelled — void payments first per FR-FIN-010.

### FR-B2B-010: B2B Customer Transaction History
- **User Story:** As a B2B operator, I want to see the complete transaction history for a B2B customer so that I can review all their orders, fulfillments, and payments.
- **Priority:** P1 (High)
- **Acceptance Criteria:**
  - GIVEN a B2B customer's detail page, WHEN the user views the transaction history tab, THEN the system displays all pre-orders, fulfillments, receivables, and payments for that customer in reverse chronological order.
  - Each entry shows: date, document type (Pre-Order/Fulfillment/Payment), document number, amount (₱), and status.
  - The transaction history is read-only and paginated (20 per page).

---

## 4. Module: B2C Printing

### FR-B2C-001: Printing Order Creation
- **User Story:** As a B2C operator, I want to create printing orders for customers so that I can track printing jobs from order to payment.
- **Priority:** P1 (High)
- **Acceptance Criteria:**
  - GIVEN a user on the B2C Printing Orders screen, WHEN the user creates an order by selecting a customer, entering an order date, and adding line items (description, quantity, unit price), THEN the system saves the order with status "Pending".
  - Each printing order contains: id, customer_id, order_date, status, total_amount, notes, created_by, created_at.
  - Each order item contains: id, order_id, description, quantity (≥1), unit_price (₱, ≥0.01), total (quantity × unit_price).
  - Order total = SUM(all item totals).
  - Valid statuses: Pending, In Production, Completed, Released, Paid, Cancelled.

### FR-B2C-002: Printing Order Status Transitions
- **User Story:** As a B2C operator, I want printing orders to follow a defined workflow from order to payment.
- **Priority:** P1 (High)
- **Acceptance Criteria:**
  - Valid transitions:
    - Pending → In Production (production starts)
    - In Production → Completed (production finished)
    - Completed → Released (order released/picked up by customer)
    - Released → Paid (payment received)
    - Pending → Cancelled, In Production → Cancelled (order cancelled)
  - GIVEN an order with status "Paid" or "Cancelled", WHEN any transition is attempted, THEN the system rejects the transition.
  - When status changes to "Released", the system creates a receivable in Finance (per FR-FIN-001) with the order total as the amount. Payment is recorded separately via FR-B2C-004 (the order transitions from Released → Paid when fully paid).
  - If a printing order with status "Released" or later is cancelled and an unpaid receivable exists (status Outstanding or Partially Paid), the receivable status changes to "Voided". If payments already exist against the receivable, the order cannot be cancelled — void payments first per FR-FIN-010.

### FR-B2C-003: Production Status Tracking
- **User Story:** As a B2C operator, I want to track the production status of each printing order so that I know where each job is in the process.
- **Priority:** P1 (High)
- **Acceptance Criteria:**
  - GIVEN a printing order with status "In Production", WHEN the user views the order detail, THEN the system displays the current production status and any production notes.
  - Production notes is a free-text field (max 1000 characters) that can be updated while the order is "In Production".
  - The system tracks the timestamp of each status change (pending_at, in_production_at, completed_at, released_at, paid_at).

### FR-B2C-004: B2C Payment Recording
- **User Story:** As a B2C operator, I want to record payments for printing orders so that I can track which orders are paid.
- **Priority:** P1 (High)
- **Acceptance Criteria:**
  - GIVEN a printing order with status "Released", WHEN the user records a payment (amount, date, method, reference), THEN the system creates a payment record linked to the order's receivable.
  - GIVEN a payment equal to the order total, WHEN saved, THEN the order status changes to "Paid".
  - GIVEN a partial payment, WHEN saved, THEN the order remains "Released" and the receivable status updates per FR-FIN-003.
  - Payment recording for B2C orders follows the same Finance payment flow (FR-FIN-003).

### FR-B2C-005: B2C Customer Transaction History
- **User Story:** As a B2C operator, I want to see the complete transaction history for a B2C customer so that I can review all their printing orders and payments.
- **Priority:** P1 (High)
- **Acceptance Criteria:**
  - GIVEN a B2C customer's detail page, WHEN the user views the transaction history tab, THEN the system displays all printing orders and payments for that customer in reverse chronological order.
  - Each entry shows: date, document type (Printing Order/Payment), document number, amount (₱), and status.
  - The transaction history is read-only and paginated (20 per page).

---

## 5. Module: Historical Debts

### FR-DEBT-001: Record Customer Historical Debts
- **User Story:** As a business operator, I want to record old customer debts in the system so that they are tracked alongside current receivables.
- **Priority:** P1 (High)
- **Source:** Pain Point #6 — historical debt opacity
- **Acceptance Criteria:**
  - GIVEN a user on the Historical Debts screen, WHEN the user creates a customer debt record with: customer, amount (₱), date, source/reference, and description, THEN the system saves the record with verification status "Pending".
  - The date field accepts any past date (no future dates allowed).
  - Source/reference is a free-text field (max 255 characters) describing where the debt information came from.
  - Description is a free-text field (max 500 characters) providing details about the debt.

### FR-DEBT-002: Record Supplier Historical Debts
- **User Story:** As a business operator, I want to record old supplier debts in the system so that I can track what I owe from before the system was implemented.
- **Priority:** P1 (High)
- **Source:** Pain Point #6 — historical debt opacity
- **Acceptance Criteria:**
  - GIVEN a user on the Historical Debts screen, WHEN the user creates a supplier debt record with: supplier, amount (₱), date, source/reference, and description, THEN the system saves the record with verification status "Pending".
  - The same field constraints as FR-DEBT-001 apply.

### FR-DEBT-003: Verification Status Management
- **User Story:** As a business operator, I want to update the verification status of historical debts so that I can distinguish confirmed debts from unverified records.
- **Priority:** P1 (High)
- **Source:** Pain Point #6 — historical debt opacity
- **Acceptance Criteria:**
  - Valid verification statuses: Pending, Verified, Disputed, Adjusted, Written Off.
  - Valid transitions:
    - Pending → Verified (debt confirmed)
    - Pending → Disputed (debt contested by entity)
    - Disputed → Adjusted (amount modified after dispute)
    - Disputed → Written Off (debt abandoned)
    - Verified → Adjusted (amount modified after verification)
    - Verified → Written Off (debt written off)
    - Adjusted → Written Off (adjusted debt written off)
  - GIVEN a status transition to "Adjusted", WHEN the user saves, THEN the system requires a new amount and adjustment reason.
  - GIVEN a status transition to "Written Off", WHEN the user saves, THEN the system requires a write-off reason.
  - Adjusted and Written Off debts are excluded from active outstanding balance calculations.
  - Each status change is logged with: previous_status, new_status, changed_by, changed_at, reason.

### FR-DEBT-004: Historical Debt Listing and Filtering
- **User Story:** As a business operator, I want to list and filter historical debts so that I can find specific records.
- **Priority:** P2 (Medium)
- **Acceptance Criteria:**
  - GIVEN the Historical Debts list view, WHEN the user views it, THEN the system displays all debts with: entity name, entity type (Customer/Supplier), amount (₱), date, source, verification status.
  - The list is filterable by: entity type (Customer/Supplier/All), verification status, and date range.
  - The list is sortable by: date, amount, entity name, verification status.
  - Results are paginated (20 per page).

---

## 6. Module: Inventory Management

### FR-INV-001: Product/Fabric Records
- **User Story:** As an operator, I want to maintain a catalog of fabrics and products so that they can be referenced across all modules.
- **Priority:** P1 (High)
- **Acceptance Criteria:**
  - GIVEN a user on the Products screen, WHEN the user creates a product with: name, description (optional), unit of measurement (yards, meters, pieces, reams, etc.), and category (optional), THEN the system saves the product record.
  - Each product contains: id, name (unique), description, unit, category, is_active (default true), created_at.
  - GIVEN a product that is referenced by existing orders or inventory records, WHEN the user attempts to delete it, THEN the system prevents deletion and displays "Product is in use. Deactivate instead."
  - Products can be deactivated (is_active = false) but not deleted if referenced.

### FR-INV-002: Stock Received Tracking
- **User Story:** As an operator, I want stock received from purchase orders to automatically update inventory so that current quantities are always accurate.
- **Priority:** P1 (High)
- **Acceptance Criteria:**
  - GIVEN a B2B receiving record is saved, WHEN the received items are processed, THEN the system automatically creates inventory history entries (movement_type: "received") for each product.
  - The stock_received quantity for each product is incremented by the received quantity.
  - The current quantity is recalculated as: `current_qty = stock_received - stock_released + adjustment_total`.

### FR-INV-003: Stock Released Tracking
- **User Story:** As an operator, I want stock released for fulfillments to automatically update inventory so that current quantities reflect what's available.
- **Priority:** P1 (High)
- **Acceptance Criteria:**
  - GIVEN a B2B fulfillment is marked "Completed", WHEN the fulfillment items are processed, THEN the system automatically creates inventory history entries (movement_type: "released") for each product.
  - The stock_released quantity for each product is incremented by the fulfillment quantity.
  - GIVEN a stock release that would make current_qty negative, WHEN the system processes it, THEN the system displays a warning "This release will result in negative stock for [product name]. Continue?" and requires explicit confirmation.

### FR-INV-004: Current Quantity Calculation
- **User Story:** As an operator, I want to see the current quantity of each product so that I know what's available.
- **Priority:** P1 (High)
- **Acceptance Criteria:**
  - GIVEN any product, WHEN the user views its inventory detail, THEN the system displays:
    - Total Stock Received (₱/unit)
    - Total Stock Released (unit)
    - Total Adjustments (unit)
    - Current Quantity = Stock Received − Stock Released + Adjustments
  - The current quantity is always computed, never stored as a mutable field.
  - Current quantity is displayed alongside the product unit (e.g., "1,250 yards").

### FR-INV-005: Inventory Adjustments
- **User Story:** As an operator, I want to manually adjust inventory quantities so that I can correct discrepancies from physical counts or damages.
- **Priority:** P1 (High)
- **Acceptance Criteria:**
  - GIVEN a user on the Inventory Adjustments screen, WHEN the user selects a product, enters an adjustment quantity (positive for increase, negative for decrease), and provides a reason, THEN the system saves the adjustment.
  - Each adjustment contains: id, product_id, adjustment_qty (non-zero integer/decimal), reason (required, max 500 characters), adjusted_by (user_id), adjustment_date, created_at.
  - Adjustment reason is mandatory for all adjustments.
  - The system creates a corresponding inventory history entry (movement_type: "adjustment").

### FR-INV-006: Inventory History Log
- **User Story:** As an operator, I want to see the complete history of inventory movements for each product so that I can trace all changes.
- **Priority:** P2 (Medium)
- **Acceptance Criteria:**
  - GIVEN a product's inventory detail page, WHEN the user views the history tab, THEN the system displays all inventory movements in reverse chronological order.
  - Each entry shows: date, movement type (Received/Released/Adjustment), quantity (+/−), reference document (PO number, fulfillment number, or adjustment ID), and the user who created it.
  - Results are paginated (20 per page) and filterable by movement type and date range.

---

## 7. Module: Customers & Suppliers (Centralized)

### FR-CS-001: Centralized Customer Records
- **User Story:** As an operator, I want a single customer record that is shared across B2B and B2C modules so that I don't enter the same customer information multiple times.
- **Priority:** P0 (Critical)
- **Source:** Pain Point #4 — duplicate data entry
- **Acceptance Criteria:**
  - GIVEN a user on the Customers screen, WHEN the user creates a customer with: name, contact person, phone, email, address, and type (B2B, B2C, or Both), THEN the system saves the customer record.
  - Each customer contains: id, name (unique), contact_person, phone, email, address, type, is_active (default true), created_at, updated_at.
  - The same customer record is referenced by B2B pre-orders, B2C printing orders, finance receivables, and historical debts.
  - Customers can be deactivated but not deleted if referenced by existing records.

### FR-CS-002: Centralized Supplier Records
- **User Story:** As an operator, I want a single supplier record that is shared across B2B and Finance modules so that I don't enter the same supplier information multiple times.
- **Priority:** P0 (Critical)
- **Source:** Pain Point #4 — duplicate data entry
- **Acceptance Criteria:**
  - GIVEN a user on the Suppliers screen, WHEN the user creates a supplier with: name, contact person, phone, email, and address, THEN the system saves the supplier record.
  - Each supplier contains: id, name (unique), contact_person, phone, email, address, is_active (default true), created_at, updated_at.
  - The same supplier record is referenced by B2B purchase orders, finance payables, and historical debts.
  - Suppliers can be deactivated but not deleted if referenced by existing records.

### FR-CS-003: Customer/Supplier Detail View
- **User Story:** As an operator, I want to see a complete view of each customer or supplier including contact info, outstanding balances, and transaction history.
- **Priority:** P1 (High)
- **Acceptance Criteria:**
  - GIVEN a customer or supplier detail page, WHEN the user views it, THEN the system displays:
    - Contact information (name, contact person, phone, email, address)
    - Outstanding balance (₱) — computed as: `customer_outstanding = SUM(receivable outstanding balances from Finance) + SUM(historical debt amounts where status IN ('Pending', 'Verified', 'Disputed'))`. For suppliers: `supplier_outstanding = SUM(payable outstanding balances from Finance) + SUM(historical debt amounts where status IN ('Pending', 'Verified', 'Disputed'))`.
    - Total transactions count
    - Recent transactions (last 5)
  - The outstanding balance is computed in real-time from linked finance records and historical debt records.

### FR-CS-004: Customer/Supplier Search
- **User Story:** As an operator, I want to search for customers and suppliers by name or contact info so that I can find them quickly.
- **Priority:** P1 (High)
- **Acceptance Criteria:**
  - GIVEN the Customers or Suppliers list view, WHEN the user enters a search term, THEN the system filters the list by matching name, contact person, phone, or email (case-insensitive partial match).
  - Search results are paginated (20 per page).
  - The list is sortable by name, phone, outstanding balance, and creation date.

---

## 8. Module: Reports

### FR-RPT-001: Sales Report
- **User Story:** As a business operator, I want a sales report showing revenue from B2B and B2C so that I can track business performance.
- **Priority:** P2 (Medium)
- **Acceptance Criteria:**
  - GIVEN the Reports screen, WHEN the user generates a Sales Report with a date range, THEN the system displays:
    - Total B2B sales (₱) — sum of all completed fulfillments within the date range
    - Total B2C sales (₱) — sum of all paid printing orders within the date range
    - Grand total (₱)
    - Breakdown by customer (top 10 by amount)
  - The report can be viewed on-screen and exported as PDF or CSV.

### FR-RPT-002: Inventory Report
- **User Story:** As an operator, I want an inventory report showing current stock levels so that I can monitor product availability.
- **Priority:** P2 (Medium)
- **Acceptance Criteria:**
  - GIVEN the Reports screen, WHEN the user generates an Inventory Report, THEN the system displays for each active product:
    - Product name, unit, category
    - Total received, total released, total adjustments
    - Current quantity
    - Products with current quantity ≤ 0 highlighted as "Out of Stock"
  - The report can be filtered by category and exported as PDF or CSV.

### FR-RPT-003: Receivables Report
- **User Story:** As a business operator, I want a receivables report showing all outstanding customer balances so that I can prioritize collections.
- **Priority:** P1 (High)
- **Acceptance Criteria:**
  - GIVEN the Reports screen, WHEN the user generates a Receivables Report, THEN the system displays for each customer with outstanding receivables:
    - Customer name, total receivable amount (₱), total paid (₱), outstanding balance (₱), oldest unpaid date, number of overdue items
  - The report is sorted by outstanding balance (descending) by default.
  - The report can be exported as PDF or CSV.

### FR-RPT-004: Payables Report
- **User Story:** As a business operator, I want a payables report showing all outstanding supplier balances so that I can plan payments.
- **Priority:** P1 (High)
- **Acceptance Criteria:**
  - GIVEN the Reports screen, WHEN the user generates a Payables Report, THEN the system displays for each supplier with outstanding payables:
    - Supplier name, total payable amount (₱), total paid (₱), outstanding balance (₱), oldest unpaid date, number of overdue items
  - The report is sorted by outstanding balance (descending) by default.
  - The report can be exported as PDF or CSV.

### FR-RPT-005: Payments Report
- **User Story:** As a business operator, I want a payments report showing all payments received and made within a period.
- **Priority:** P2 (Medium)
- **Acceptance Criteria:**
  - GIVEN the Reports screen, WHEN the user generates a Payments Report with a date range, THEN the system displays:
    - Total received (₱) — sum of all receivable payments in the period
    - Total paid out (₱) — sum of all payable payments in the period
    - Net position (₱) = Total received − Total paid out
    - Line items: date, type (Received/Paid), entity name, amount (₱), method, reference
  - The report can be filtered by payment method and exported as PDF or CSV.

### FR-RPT-006: Customer Transaction Report
- **User Story:** As an operator, I want a detailed transaction report for a specific customer.
- **Priority:** P2 (Medium)
- **Acceptance Criteria:**
  - GIVEN the Reports screen, WHEN the user selects a customer and generates a Customer Transaction Report with a date range, THEN the system displays all transactions (orders, fulfillments, payments, historical debts) for that customer within the period.
  - Each entry shows: date, type, document number, amount (₱), running balance (₱).
  - The report can be exported as PDF or CSV.

### FR-RPT-007: Supplier Transaction Report
- **User Story:** As an operator, I want a detailed transaction report for a specific supplier.
- **Priority:** P2 (Medium)
- **Acceptance Criteria:**
  - GIVEN the Reports screen, WHEN the user selects a supplier and generates a Supplier Transaction Report with a date range, THEN the system displays all transactions (POs, receiving records, payments, historical debts) for that supplier within the period.
  - Each entry shows: date, type, document number, amount (₱), running balance (₱).
  - The report can be exported as PDF or CSV.

### FR-RPT-008: Simple Dashboard
- **User Story:** As a business operator, I want a simple dashboard showing key business metrics so that I have an at-a-glance view of operations.
- **Priority:** P2 (Medium)
- **Acceptance Criteria:**
  - GIVEN the user is on the dashboard after login, WHEN the page loads, THEN the system displays:
    - Total outstanding receivables (₱) with overdue count
    - Total outstanding payables (₱) with overdue count
    - Recent transactions (last 10 across all modules)
    - Low stock alerts (products with current_qty ≤ threshold, threshold configurable per product, default 0)
  - The dashboard does NOT include charts, graphs, or advanced analytics.
  - All data is real-time (computed on page load).

---

## 9. Module: Digital Transaction & Document Records

### FR-DOC-001: View Transaction Documents
- **User Story:** As an operator, I want to view all transaction documents (POs, invoices, receipts, etc.) in a unified view so that I can find any document quickly.
- **Priority:** P1 (High)
- **Source:** Pain Point #1 — physical receipts difficult to search
- **Acceptance Criteria:**
  - GIVEN the Documents screen, WHEN the user views it, THEN the system displays a list of all documents with: document type, document number, date, entity (customer/supplier), amount (₱), and status.
  - Document types include: Pre-Order, Purchase Order, Receiving Record, Fulfillment, Printing Order, Payment/Receipt, Receivable (generated from B2B fulfillments or B2C orders), Historical Debt Record, Inventory Adjustment. Note: "Receivable" documents serve as invoices — they represent amounts owed by customers.
  - The list is filterable by: document type, date range, entity name.
  - The list is searchable by: document number, entity name.
  - Results are paginated (20 per page) and sortable by date.

### FR-DOC-002: Print Documents
- **User Story:** As an operator, I want to print any transaction document so that I can produce physical copies when needed.
- **Priority:** P1 (High)
- **Acceptance Criteria:**
  - GIVEN any document detail view, WHEN the user clicks "Print", THEN the system opens a print-optimized view of the document in a new browser window/tab.
  - The print view includes: document header (type, number, date), entity details, line items with quantities and amounts, totals, and payment status.
  - The print view uses a clean layout suitable for A4 paper.
  - All amounts are displayed in Philippine Peso (₱).

### FR-DOC-003: Export Documents
- **User Story:** As an operator, I want to export documents as PDF or CSV so that I can share or archive them.
- **Priority:** P2 (Medium)
- **Acceptance Criteria:**
  - GIVEN any document or list view, WHEN the user clicks "Export", THEN the system offers export options: PDF (single document) or CSV (list views).
  - PDF export generates a formatted document identical to the print view.
  - CSV export includes all visible columns in the current list view.
  - Exported files include the document number or report name in the filename (e.g., "PO-2026-001.pdf", "receivables-report-2026-08.csv").

### FR-DOC-004: Customer/Supplier Statements
- **User Story:** As an operator, I want to generate a statement for a customer or supplier so that I can share their transaction summary.
- **Priority:** P2 (Medium)
- **Acceptance Criteria:**
  - GIVEN a customer or supplier detail page, WHEN the user clicks "Generate Statement", THEN the system prompts for a date range and generates a statement containing:
    - Entity contact details
    - All transactions within the date range (orders, payments, adjustments)
    - Running balance after each transaction
    - Final outstanding balance
  - The statement can be printed or exported as PDF.

---

## 10. Non-Functional Requirements

### NFR-001: Performance
- **Requirement:** All page loads complete within 3 seconds on a standard broadband connection (10 Mbps).
- **Validation:** Measure time from navigation start to full render; 95th percentile must be ≤ 3 seconds.
- **Requirement:** Search queries return results within 2 seconds for datasets up to 100,000 records.
- **Validation:** Load test with 100K records; measure query response time.
- **Requirement:** Balance calculations complete within 500ms for any single receivable/payable.
- **Validation:** Measure computation time for records with up to 1,000 linked payments.

### NFR-002: Security
- **Requirement:** All data in transit is encrypted via TLS 1.2+ (enforced by Cloudflare and Supabase).
- **Validation:** Verify HTTPS-only access; no HTTP endpoints.
- **Requirement:** All passwords are hashed using bcrypt (via Supabase Auth) with minimum cost factor 10.
- **Validation:** Confirm Supabase Auth configuration; no plaintext passwords in database.
- **Requirement:** Row Level Security (RLS) policies are applied to all database tables.
- **Validation:** Query `pg_policies` to verify every table has at least one RLS policy.
- **Requirement:** API keys and sensitive credentials are never exposed in client-side code.
- **Validation:** Scan built JavaScript bundle for Supabase service_role key; confirm only anon key is present.

### NFR-003: Usability
- **Requirement:** All forms provide inline validation with clear error messages.
- **Validation:** Test each form with invalid inputs; verify error messages appear adjacent to the invalid field.
- **Requirement:** All monetary inputs accept only numeric values with up to 2 decimal places.
- **Validation:** Attempt to enter letters, special characters, and 3+ decimal places; verify rejection.
- **Requirement:** The application is usable on screen resolutions from 1024×768 to 1920×1080.
- **Validation:** Test on each resolution; verify no horizontal scrolling and all content is accessible.

### NFR-004: Data Integrity
- **Requirement:** All financial calculations use exact decimal arithmetic (no floating-point rounding errors).
- **Validation:** Test calculations with values that produce floating-point errors (e.g., 0.1 + 0.2); verify result is 0.30, not 0.30000000000000004.
- **Requirement:** Database uses `NUMERIC(15,2)` for all monetary fields.
- **Validation:** Inspect database schema; verify column types.
- **Requirement:** No financial record can be hard-deleted; only soft-delete or void with audit trail.
- **Validation:** Attempt to DELETE from finance tables; verify RLS or triggers prevent hard deletion.

### NFR-005: Availability
- **Requirement:** The system is available 99.5% of the time during business hours (6 AM – 10 PM PHT, Monday–Saturday).
- **Validation:** Monitor uptime via external service; calculate monthly availability percentage.
- **Requirement:** Supabase and Cloudflare Pages free tier limits are not exceeded under normal operation.
- **Validation:** Monitor Supabase dashboard for database size (limit: 500 MB) and Cloudflare for function invocations.

### NFR-006: Browser Compatibility
- **Requirement:** The application functions correctly on the latest 2 versions of Chrome, Edge, and Firefox.
- **Validation:** Test all core workflows on each browser version; verify identical behavior.

### NFR-007: Concurrent Access
- **Requirement:** The system relies on PostgreSQL transaction isolation (Supabase default: Read Committed) to handle concurrent edits to the same record. All financial mutations (payments, balance updates) occur within database transactions.
- **Validation:** Simulate two concurrent payment recordings against the same receivable; verify both are applied correctly without lost updates.
- **Requirement:** The UI uses optimistic updates with automatic refetch on conflict. If a concurrent write conflict occurs at the database level, the UI displays "This record was updated by another user. Please refresh and try again."
- **Validation:** Open the same receivable in two browser tabs, record payments in both simultaneously; verify no data corruption.

---

## 11. Traceability Matrix

| Requirement | Pain Point | Module | Priority |
|---|---|---|---|
| FR-AUTH-001 | Secure access | Auth | P0 |
| FR-AUTH-002 | Secure access | Auth | P0 |
| FR-AUTH-003 | Basic user management | Auth | P1 |
| FR-AUTH-004 | Secure access | Auth | P1 |
| FR-FIN-001 | PP#1, PP#3 | Finance | P0 |
| FR-FIN-002 | PP#2, PP#3 | Finance | P0 |
| FR-FIN-003 | PP#1, PP#2 | Finance | P0 |
| FR-FIN-004 | PP#2 | Finance | P0 |
| FR-FIN-005 | PP#3 | Finance | P0 |
| FR-FIN-006 | PP#1 | Finance | P0 |
| FR-FIN-007 | PP#1, PP#3 | Finance | P0 |
| FR-FIN-008 | PP#3 | Finance | P0 |
| FR-FIN-009 | PP#3 | Finance | P0 |
| FR-FIN-010 | Error correction | Finance | P1 |
| FR-B2B-001 | PP#5 | B2B | P1 |
| FR-B2B-002 | PP#5 | B2B | P1 |
| FR-B2B-003 | PP#5 | B2B | P1 |
| FR-B2B-004 | PP#5 | B2B | P1 |
| FR-B2B-005 | PP#5 | B2B | P1 |
| FR-B2B-006 | PP#5 | B2B | P1 |
| FR-B2B-007 | PP#2, PP#5 | B2B | P1 |
| FR-B2B-008 | PP#5 | B2B | P1 |
| FR-B2B-009 | PP#5 | B2B | P1 |
| FR-B2B-010 | PP#5 | B2B | P1 |
| FR-B2C-001 | B2C workflow | B2C | P1 |
| FR-B2C-002 | B2C workflow | B2C | P1 |
| FR-B2C-003 | B2C workflow | B2C | P1 |
| FR-B2C-004 | B2C workflow | B2C | P1 |
| FR-B2C-005 | B2C workflow | B2C | P1 |
| FR-DEBT-001 | PP#6 | Historical Debts | P1 |
| FR-DEBT-002 | PP#6 | Historical Debts | P1 |
| FR-DEBT-003 | PP#6 | Historical Debts | P1 |
| FR-DEBT-004 | PP#6 | Historical Debts | P2 |
| FR-INV-001 | Inventory | Inventory | P1 |
| FR-INV-002 | PP#5 | Inventory | P1 |
| FR-INV-003 | PP#5 | Inventory | P1 |
| FR-INV-004 | PP#5 | Inventory | P1 |
| FR-INV-005 | Inventory | Inventory | P1 |
| FR-INV-006 | Inventory | Inventory | P2 |
| FR-CS-001 | PP#4 | Customers/Suppliers | P0 |
| FR-CS-002 | PP#4 | Customers/Suppliers | P0 |
| FR-CS-003 | PP#4 | Customers/Suppliers | P1 |
| FR-CS-004 | PP#4 | Customers/Suppliers | P1 |
| FR-RPT-001 | Reports | Reports | P2 |
| FR-RPT-002 | Reports | Reports | P2 |
| FR-RPT-003 | PP#3 | Reports | P1 |
| FR-RPT-004 | PP#3 | Reports | P1 |
| FR-RPT-005 | Reports | Reports | P2 |
| FR-RPT-006 | Reports | Reports | P2 |
| FR-RPT-007 | Reports | Reports | P2 |
| FR-RPT-008 | PP#3 | Reports | P2 |
| FR-DOC-001 | PP#1 | Documents | P1 |
| FR-DOC-002 | PP#1 | Documents | P1 |
| FR-DOC-003 | PP#1 | Documents | P2 |
| FR-DOC-004 | PP#1 | Documents | P2 |
