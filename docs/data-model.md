# Data Model — UBMS

> **Version:** 1.0 | **Date:** 2026-08-26 | **Status:** Approved for Build
> **Currency:** Philippine Peso (₱) — `NUMERIC(15,2)` throughout
> **Primary Keys:** UUID v4 throughout

---

## 1. Entity-Relationship Diagram (Text-Based)

```
┌──────────────────────┐         ┌──────────────────────┐
│      profiles        │         │       products        │
│──────────────────────│         │──────────────────────│
│ id (FK→auth.users)  │         │ id                   │
│ email                │         │ name (UNIQUE)         │
│ full_name            │         │ description           │
│ role (admin/staff)   │         │ unit                  │
│ is_active            │         │ category              │
│ last_login_at        │         │ is_active             │
│ created_at/updated_at│         │ created_at/updated_at │
└──────────────────────┘         └──────────┬───────────┘
                                            │ referenced by
┌──────────────────────┐                    │
│     customers        │                    │
│──────────────────────│                    │
│ id                   │◄─────┐             │
│ name (UNIQUE)        │      │             │
│ contact_person       │      │             │
│ phone, email         │      │             │
│ address              │      │             │
│ type (B2B/B2C/Both)  │      │             │
│ is_active            │      │             │
│ created_at/updated_at│      │             │
└──────┬───────────────┘      │             │
       │                      │             │
       ├──► b2b_pre_orders ───┤             │
       │    │                 │             │
       │    └──► b2b_pre_order_items ───────┤
       │                  │                 │
       ├──► b2b_fulfillments                │
       │    │                 │             │
       │    └──► b2b_fulfillment_items ─────┤
       │                                    │
       ├──► b2c_printing_orders             │
       │    │                               │
       │    └──► b2c_order_items (free text │
       │         description, no product FK)│
       │                                    │
       ├──► receivables (source: B2B/B2C)   │
       │    │                               │
       │    └──► payments (via source_id)   │
       │                                    │
       └──► historical_debts (entity_type)  │

┌──────────────────────┐         ┌──────────────────────┐
│     suppliers        │         │  inventory_movements  │
│──────────────────────│         │──────────────────────│
│ id                   │         │ id                   │
│ name (UNIQUE)        │         │ product_id (FK)      │
│ contact_person       │         │ movement_type        │
│ phone, email         │         │ quantity              │
│ address              │         │ reference_type        │
│ is_active            │         │ reference_id          │
│ created_at/updated_at│         │ created_by (FK)       │
└──────┬───────────────┘         │ movement_date         │
       │                         │ created_at            │
       ├──► b2b_purchase_orders   └──────────────────────┘
       │    │                              ▲
       │    └──► b2b_po_items ─────────────┤ auto-triggered
       │                                   │
       ├──► payables (source: B2B)         │
       │    │                              │
       │    └──► payments (via source_id)  │
       │                                   │
       └──► historical_debts ──────────────┘
              (entity_type = supplier)

┌──────────────────────────────┐
│  b2b_receiving_records       │
│──────────────────────────────│
│ id                           │
│ po_id (FK→b2b_purchase_orders)
│ receiving_date               │
│ received_by (FK→profiles)    │
│ created_at                   │
│     │                        │
│     └──► b2b_receiving_items │
│          po_item_id (FK)     │
│          received_qty        │
│          variance_qty        │
│          variance_reason     │
└──────────────────────────────┘

┌──────────────────────────────────┐
│  historical_debt_status_logs     │
│──────────────────────────────────│
│ id                               │
│ debt_id (FK→historical_debts)    │
│ previous_status, new_status      │
│ changed_by (FK→profiles)         │
│ changed_at, reason               │
└──────────────────────────────────┘
```

---

## 2. Complete Table Definitions

### 2.1 `profiles` — User Profiles (extends auth.users)

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, FK→auth.users(id) ON DELETE CASCADE | Supabase Auth user ID |
| `email` | TEXT | NOT NULL | User email |
| `full_name` | TEXT | NOT NULL | Display name |
| `role` | TEXT | NOT NULL, CHECK (role IN ('admin','staff')), DEFAULT 'staff' | User role |
| `is_active` | BOOLEAN | NOT NULL DEFAULT true | Account active flag |
| `last_login_at` | TIMESTAMPTZ | | Last successful login |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Record creation |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Last update |

**Indexes:** `idx_profiles_role(role)`, `idx_profiles_is_active(is_active)`

---

### 2.2 `customers` — Centralized Customer Records

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Unique ID |
| `name` | TEXT | NOT NULL, UNIQUE | Customer name |
| `contact_person` | TEXT | | Primary contact name |
| `phone` | TEXT | | Phone number |
| `email` | TEXT | | Email address |
| `address` | TEXT | | Physical address |
| `type` | TEXT | NOT NULL, CHECK (type IN ('B2B','B2C','Both')), DEFAULT 'Both' | Business line type |
| `is_active` | BOOLEAN | NOT NULL DEFAULT true | Active flag |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Record creation |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Last update |

**Indexes:** `idx_customers_name(name)`, `idx_customers_type(type)`, `idx_customers_is_active(is_active)`

---

### 2.3 `suppliers` — Centralized Supplier Records

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Unique ID |
| `name` | TEXT | NOT NULL, UNIQUE | Supplier name |
| `contact_person` | TEXT | | Primary contact name |
| `phone` | TEXT | | Phone number |
| `email` | TEXT | | Email address |
| `address` | TEXT | | Physical address |
| `is_active` | BOOLEAN | NOT NULL DEFAULT true | Active flag |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Record creation |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Last update |

**Indexes:** `idx_suppliers_name(name)`, `idx_suppliers_is_active(is_active)`

---

### 2.4 `products` — Product/Fabric Catalog

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Unique ID |
| `name` | TEXT | NOT NULL, UNIQUE | Product name |
| `description` | TEXT | | Product description |
| `unit` | TEXT | NOT NULL | Unit of measurement (yards, meters, pieces, reams) |
| `category` | TEXT | | Product category |
| `is_active` | BOOLEAN | NOT NULL DEFAULT true | Active flag |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Record creation |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Last update |

**Indexes:** `idx_products_name(name)`, `idx_products_category(category)`, `idx_products_is_active(is_active)`

---

### 2.5 `receivables` — Customer Receivables (Finance)

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Unique ID |
| `customer_id` | UUID | NOT NULL, FK→customers(id) | Customer who owes |
| `source_type` | TEXT | NOT NULL, CHECK (source_type IN ('B2B','B2C')) | Origin business line |
| `source_id` | UUID | NOT NULL | FK to b2b_fulfillments or b2c_printing_orders |
| `amount` | NUMERIC(15,2) | NOT NULL, CHECK (amount > 0) | Original receivable amount |
| `due_date` | DATE | NOT NULL | Payment due date |
| `status` | TEXT | NOT NULL, CHECK (status IN ('Outstanding','Partially Paid','Fully Paid','Voided')), DEFAULT 'Outstanding' | Current status |
| `notes` | TEXT | | Optional notes |
| `created_by` | UUID | FK→profiles(id) | User who created |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Record creation |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Last update |

**Indexes:** `idx_receivables_customer_id(customer_id)`, `idx_receivables_status(status)`, `idx_receivables_due_date(due_date)`, `idx_receivables_source(source_type, source_id)`, `idx_receivables_overdue(status, due_date)`

---

### 2.6 `payables` — Supplier Payables (Finance)

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Unique ID |
| `supplier_id` | UUID | NOT NULL, FK→suppliers(id) | Supplier owed to |
| `source_type` | TEXT | NOT NULL, DEFAULT 'B2B' | Origin (always B2B) |
| `source_id` | UUID | NOT NULL | FK to b2b_purchase_orders |
| `amount` | NUMERIC(15,2) | NOT NULL, CHECK (amount > 0) | Original payable amount |
| `due_date` | DATE | NOT NULL | Payment due date |
| `status` | TEXT | NOT NULL, CHECK (status IN ('Outstanding','Partially Paid','Fully Paid','Voided')), DEFAULT 'Outstanding' | Current status |
| `notes` | TEXT | | Optional notes |
| `created_by` | UUID | FK→profiles(id) | User who created |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Record creation |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Last update |

**Indexes:** `idx_payables_supplier_id(supplier_id)`, `idx_payables_status(status)`, `idx_payables_due_date(due_date)`, `idx_payables_source(source_type, source_id)`

---

### 2.7 `payments` — Payment Records (Finance)

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Unique ID |
| `payment_type` | TEXT | NOT NULL, CHECK (payment_type IN ('receivable','payable')) | Type of payment |
| `source_id` | UUID | NOT NULL | FK to receivables.id or payables.id |
| `amount` | NUMERIC(15,2) | NOT NULL, CHECK (amount > 0) | Payment amount |
| `payment_date` | DATE | NOT NULL | Date payment was made |
| `payment_method` | TEXT | NOT NULL, CHECK (payment_method IN ('Cash','Bank Transfer','Check')) | Payment method |
| `reference_number` | TEXT | | Optional reference/check number |
| `is_voided` | BOOLEAN | NOT NULL DEFAULT false | Void flag |
| `void_reason` | TEXT | | Reason for voiding |
| `voided_by` | UUID | FK→profiles(id) | Admin who voided |
| `voided_at` | TIMESTAMPTZ | | When voided |
| `recorded_by` | UUID | NOT NULL, FK→profiles(id) | User who recorded |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Record creation |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Last update |

**Indexes:** `idx_payments_source(payment_type, source_id)`, `idx_payments_payment_date(payment_date)`, `idx_payments_payment_method(payment_method)`, `idx_payments_recorded_by(recorded_by)`, `idx_payments_is_voided(is_voided)`

**Notes:** Payments are NEVER hard-deleted (RLS blocks DELETE). Voided payments excluded from balance calculations.

---

### 2.8 `b2b_pre_orders` — B2B Pre-Orders

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Unique ID |
| `customer_id` | UUID | NOT NULL, FK→customers(id) | Customer |
| `order_date` | DATE | NOT NULL | Order date |
| `status` | TEXT | NOT NULL, CHECK (status IN ('Draft','Submitted','Converted','Cancelled')), DEFAULT 'Draft' | Workflow status |
| `notes` | TEXT | | Optional notes |
| `created_by` | UUID | NOT NULL, FK→profiles(id) | Created by |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Record creation |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Last update |

**Indexes:** `idx_b2b_pre_orders_customer_id(customer_id)`, `idx_b2b_pre_orders_status(status)`, `idx_b2b_pre_orders_order_date(order_date)`

---

### 2.9 `b2b_pre_order_items` — Pre-Order Line Items

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Unique ID |
| `pre_order_id` | UUID | NOT NULL, FK→b2b_pre_orders(id) ON DELETE CASCADE | Parent pre-order |
| `product_id` | UUID | NOT NULL, FK→products(id) | Product |
| `quantity` | NUMERIC(15,2) | NOT NULL, CHECK (quantity >= 1) | Quantity ordered |
| `unit_price` | NUMERIC(15,2) | NOT NULL, CHECK (unit_price >= 0.01) | Price per unit |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Record creation |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Last update |

**Indexes:** `idx_b2b_pre_order_items_pre_order_id(pre_order_id)`

---

### 2.10 `b2b_purchase_orders` — B2B Purchase Orders

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Unique ID |
| `pre_order_id` | UUID | FK→b2b_pre_orders(id) | Source pre-order (nullable) |
| `supplier_id` | UUID | NOT NULL, FK→suppliers(id) | Supplier |
| `po_number` | TEXT | NOT NULL, UNIQUE | Human-readable PO number |
| `order_date` | DATE | NOT NULL | Order date |
| `status` | TEXT | NOT NULL, CHECK (status IN ('Draft','Submitted','Partially Received','Fully Received','Completed','Cancelled')), DEFAULT 'Draft' | Workflow status |
| `notes` | TEXT | | Optional notes |
| `created_by` | UUID | NOT NULL, FK→profiles(id) | Created by |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Record creation |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Last update |

**Indexes:** `idx_b2b_purchase_orders_supplier_id(supplier_id)`, `idx_b2b_purchase_orders_status(status)`, `idx_b2b_purchase_orders_po_number(po_number)`, `idx_b2b_purchase_orders_order_date(order_date)`, `idx_b2b_purchase_orders_pre_order_id(pre_order_id)`

---

### 2.11 `b2b_po_items` — Purchase Order Line Items

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Unique ID |
| `po_id` | UUID | NOT NULL, FK→b2b_purchase_orders(id) ON DELETE CASCADE | Parent PO |
| `product_id` | UUID | NOT NULL, FK→products(id) | Product |
| `ordered_qty` | NUMERIC(15,2) | NOT NULL, CHECK (ordered_qty >= 1) | Quantity ordered |
| `unit_price` | NUMERIC(15,2) | NOT NULL, CHECK (unit_price >= 0.01) | Price per unit |
| `received_qty` | NUMERIC(15,2) | NOT NULL DEFAULT 0 | Cumulative received quantity |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Record creation |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Last update |

**Indexes:** `idx_b2b_po_items_po_id(po_id)`, `idx_b2b_po_items_product_id(product_id)`

**Notes:** `received_qty` updated by triggers when receiving records are saved.

---

### 2.12 `b2b_receiving_records` — Receiving Headers

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Unique ID |
| `po_id` | UUID | NOT NULL, FK→b2b_purchase_orders(id) | Parent PO |
| `receiving_date` | DATE | NOT NULL | Date goods received |
| `received_by` | UUID | NOT NULL, FK→profiles(id) | User who recorded |
| `notes` | TEXT | | Optional notes |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Record creation |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Last update |

**Indexes:** `idx_b2b_receiving_records_po_id(po_id)`, `idx_b2b_receiving_records_receiving_date(receiving_date)`

---

### 2.13 `b2b_receiving_items` — Receiving Line Items

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Unique ID |
| `receiving_id` | UUID | NOT NULL, FK→b2b_receiving_records(id) ON DELETE CASCADE | Parent receiving record |
| `po_item_id` | UUID | NOT NULL, FK→b2b_po_items(id) | PO item being received |
| `received_qty` | NUMERIC(15,2) | NOT NULL, CHECK (received_qty >= 0) | Quantity received this event |
| `variance_qty` | NUMERIC(15,2) | NOT NULL DEFAULT 0 | Cumulative variance (received − ordered) |
| `variance_reason` | TEXT | CHECK (LENGTH(variance_reason) <= 500) | Reason for variance |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Record creation |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Last update |

**Indexes:** `idx_b2b_receiving_items_receiving_id(receiving_id)`, `idx_b2b_receiving_items_po_item_id(po_item_id)`

---

### 2.14 `b2b_fulfillments` — B2B Fulfillments (Deliveries to Customers)

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Unique ID |
| `customer_id` | UUID | NOT NULL, FK→customers(id) | Customer |
| `fulfillment_date` | DATE | NOT NULL | Delivery date |
| `status` | TEXT | NOT NULL, CHECK (status IN ('Pending','In Progress','Completed','Cancelled')), DEFAULT 'Pending' | Workflow status |
| `notes` | TEXT | | Optional notes |
| `created_by` | UUID | NOT NULL, FK→profiles(id) | Created by |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Record creation |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Last update |

**Indexes:** `idx_b2b_fulfillments_customer_id(customer_id)`, `idx_b2b_fulfillments_status(status)`, `idx_b2b_fulfillments_fulfillment_date(fulfillment_date)`

---

### 2.15 `b2b_fulfillment_items` — Fulfillment Line Items

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Unique ID |
| `fulfillment_id` | UUID | NOT NULL, FK→b2b_fulfillments(id) ON DELETE CASCADE | Parent fulfillment |
| `product_id` | UUID | NOT NULL, FK→products(id) | Product |
| `quantity` | NUMERIC(15,2) | NOT NULL, CHECK (quantity >= 1) | Quantity delivered |
| `unit_price` | NUMERIC(15,2) | NOT NULL, CHECK (unit_price >= 0.01) | Price per unit |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Record creation |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Last update |

**Indexes:** `idx_b2b_fulfillment_items_fulfillment_id(fulfillment_id)`

---

### 2.16 `b2c_printing_orders` — B2C Printing Orders

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Unique ID |
| `customer_id` | UUID | NOT NULL, FK→customers(id) | Customer |
| `order_date` | DATE | NOT NULL | Order date |
| `status` | TEXT | NOT NULL, CHECK (status IN ('Pending','In Production','Completed','Released','Paid','Cancelled')), DEFAULT 'Pending' | Workflow status |
| `total_amount` | NUMERIC(15,2) | NOT NULL DEFAULT 0 | Computed order total |
| `notes` | TEXT | | General notes |
| `production_notes` | TEXT | CHECK (LENGTH(production_notes) <= 1000) | Production tracking notes |
| `pending_at` | TIMESTAMPTZ | | Timestamp of Pending status |
| `in_production_at` | TIMESTAMPTZ | | Timestamp of In Production |
| `completed_at` | TIMESTAMPTZ | | Timestamp of Completed |
| `released_at` | TIMESTAMPTZ | | Timestamp of Released |
| `paid_at` | TIMESTAMPTZ | | Timestamp of Paid |
| `cancelled_at` | TIMESTAMPTZ | | Timestamp of Cancelled |
| `created_by` | UUID | NOT NULL, FK→profiles(id) | Created by |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Record creation |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Last update |

**Indexes:** `idx_b2c_printing_orders_customer_id(customer_id)`, `idx_b2c_printing_orders_status(status)`, `idx_b2c_printing_orders_order_date(order_date)`

---

### 2.17 `b2c_order_items` — Printing Order Line Items

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Unique ID |
| `order_id` | UUID | NOT NULL, FK→b2c_printing_orders(id) ON DELETE CASCADE | Parent order |
| `description` | TEXT | NOT NULL | Item description (free text for printing) |
| `quantity` | NUMERIC(15,2) | NOT NULL, CHECK (quantity >= 1) | Quantity |
| `unit_price` | NUMERIC(15,2) | NOT NULL, CHECK (unit_price >= 0.01) | Price per unit |
| `total` | NUMERIC(15,2) | NOT NULL | quantity × unit_price |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Record creation |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Last update |

**Indexes:** `idx_b2c_order_items_order_id(order_id)`

**Notes:** No `product_id` FK — B2C items are free-form descriptions.

---

### 2.18 `historical_debts` — Historical Debt Records

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Unique ID |
| `entity_type` | TEXT | NOT NULL, CHECK (entity_type IN ('customer','supplier')) | Entity type |
| `entity_id` | UUID | NOT NULL | FK to customers or suppliers |
| `amount` | NUMERIC(15,2) | NOT NULL, CHECK (amount > 0) | Original debt amount |
| `debt_date` | DATE | NOT NULL, CHECK (debt_date <= CURRENT_DATE) | Date of debt (past only) |
| `source` | TEXT | CHECK (LENGTH(source) <= 255) | Source/reference |
| `description` | TEXT | CHECK (LENGTH(description) <= 500) | Details about the debt |
| `verification_status` | TEXT | NOT NULL, CHECK (verification_status IN ('Pending','Verified','Disputed','Adjusted','Written Off')), DEFAULT 'Pending' | Verification lifecycle |
| `adjusted_amount` | NUMERIC(15,2) | | New amount after adjustment |
| `adjustment_reason` | TEXT | | Reason for adjustment |
| `write_off_reason` | TEXT | | Reason for write-off |
| `created_by` | UUID | NOT NULL, FK→profiles(id) | Created by |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Record creation |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Last update |

**Indexes:** `idx_historical_debts_entity(entity_type, entity_id)`, `idx_historical_debts_status(verification_status)`, `idx_historical_debts_debt_date(debt_date)`

---

### 2.19 `historical_debt_status_logs` — Audit Trail for Debt Status Changes

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Unique ID |
| `debt_id` | UUID | NOT NULL, FK→historical_debts(id) ON DELETE CASCADE | Parent debt |
| `previous_status` | TEXT | NOT NULL | Status before change |
| `new_status` | TEXT | NOT NULL | Status after change |
| `reason` | TEXT | | Reason for change |
| `changed_by` | UUID | NOT NULL, FK→profiles(id) | User who made change |
| `changed_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | When change occurred |

**Indexes:** `idx_debt_status_logs_debt_id(debt_id)`

---

### 2.20 `inventory_movements` — Inventory Movement Log

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Unique ID |
| `product_id` | UUID | NOT NULL, FK→products(id) | Product |
| `movement_type` | TEXT | NOT NULL, CHECK (movement_type IN ('received','released','adjustment')) | Type of movement |
| `quantity` | NUMERIC(15,2) | NOT NULL | Quantity (positive=received/up, negative=released/down) |
| `reference_type` | TEXT | CHECK (reference_type IN ('receiving','fulfillment','adjustment')) | Source document type |
| `reference_id` | UUID | | FK to receiving_record, fulfillment, or adjustment |
| `notes` | TEXT | | Additional notes |
| `created_by` | UUID | NOT NULL, FK→profiles(id) | User who created |
| `movement_date` | DATE | NOT NULL | Date of movement |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Record creation |

**Indexes:** `idx_inventory_movements_product_id(product_id)`, `idx_inventory_movements_type(movement_type)`, `idx_inventory_movements_date(movement_date)`, `idx_inventory_movements_ref(reference_type, reference_id)`

---

## 3. Foreign Key Relationships Summary

| From Table | Column | To Table | On Delete |
|---|---|---|---|
| profiles.id | → | auth.users.id | CASCADE |
| b2b_pre_orders.customer_id | → | customers.id | RESTRICT |
| b2b_pre_order_items.pre_order_id | → | b2b_pre_orders.id | CASCADE |
| b2b_pre_order_items.product_id | → | products.id | RESTRICT |
| b2b_purchase_orders.pre_order_id | → | b2b_pre_orders.id | SET NULL |
| b2b_purchase_orders.supplier_id | → | suppliers.id | RESTRICT |
| b2b_po_items.po_id | → | b2b_purchase_orders.id | CASCADE |
| b2b_po_items.product_id | → | products.id | RESTRICT |
| b2b_receiving_records.po_id | → | b2b_purchase_orders.id | RESTRICT |
| b2b_receiving_items.receiving_id | → | b2b_receiving_records.id | CASCADE |
| b2b_receiving_items.po_item_id | → | b2b_po_items.id | RESTRICT |
| b2b_fulfillments.customer_id | → | customers.id | RESTRICT |
| b2b_fulfillment_items.fulfillment_id | → | b2b_fulfillments.id | CASCADE |
| b2b_fulfillment_items.product_id | → | products.id | RESTRICT |
| b2c_printing_orders.customer_id | → | customers.id | RESTRICT |
| b2c_order_items.order_id | → | b2c_printing_orders.id | CASCADE |
| receivables.customer_id | → | customers.id | RESTRICT |
| payables.supplier_id | → | suppliers.id | RESTRICT |
| payments.source_id | → | receivables/payables.id | RESTRICT |
| historical_debts.entity_id | → | customers/suppliers.id | RESTRICT |
| historical_debt_status_logs.debt_id | → | historical_debts.id | CASCADE |
| inventory_movements.product_id | → | products.id | RESTRICT |

---

## 4. Computed Views

### 4.1 `v_receivables` — Balance + Overdue Flag

```sql
CREATE OR REPLACE VIEW v_receivables AS
SELECT
    r.id, r.customer_id, c.name AS customer_name,
    r.source_type, r.source_id, r.amount, r.due_date,
    r.status, r.notes, r.created_by, r.created_at, r.updated_at,
    r.amount - COALESCE(
        (SELECT SUM(p.amount) FROM payments p
         WHERE p.source_id = r.id AND p.payment_type = 'receivable' AND p.is_voided = false), 0
    ) AS outstanding_balance,
    (r.status IN ('Outstanding', 'Partially Paid') AND r.due_date < CURRENT_DATE) AS is_overdue
FROM receivables r
JOIN customers c ON c.id = r.customer_id;
```

### 4.2 `v_payables` — Balance + Overdue Flag

```sql
CREATE OR REPLACE VIEW v_payables AS
SELECT
    p.id, p.supplier_id, s.name AS supplier_name,
    p.source_type, p.source_id, p.amount, p.due_date,
    p.status, p.notes, p.created_by, p.created_at, p.updated_at,
    p.amount - COALESCE(
        (SELECT SUM(pay.amount) FROM payments pay
         WHERE pay.source_id = p.id AND pay.payment_type = 'payable' AND pay.is_voided = false), 0
    ) AS outstanding_balance,
    (p.status IN ('Outstanding', 'Partially Paid') AND p.due_date < CURRENT_DATE) AS is_overdue
FROM payables p
JOIN suppliers s ON s.id = p.supplier_id;
```

### 4.3 `v_inventory_summary` — Current Stock Levels

```sql
CREATE OR REPLACE VIEW v_inventory_summary AS
SELECT
    p.id AS product_id, p.name, p.unit, p.category, p.is_active,
    COALESCE(SUM(CASE WHEN im.movement_type='received' THEN im.quantity ELSE 0 END), 0) AS total_received,
    COALESCE(SUM(CASE WHEN im.movement_type='released' THEN im.quantity ELSE 0 END), 0) AS total_released,
    COALESCE(SUM(CASE WHEN im.movement_type='adjustment' THEN im.quantity ELSE 0 END), 0) AS total_adjustments,
    COALESCE(SUM(CASE WHEN im.movement_type='received' THEN im.quantity ELSE 0 END), 0)
    - COALESCE(SUM(CASE WHEN im.movement_type='released' THEN im.quantity ELSE 0 END), 0)
    + COALESCE(SUM(CASE WHEN im.movement_type='adjustment' THEN im.quantity ELSE 0 END), 0)
    AS current_quantity
FROM products p
LEFT JOIN inventory_movements im ON im.product_id = p.id
GROUP BY p.id, p.name, p.unit, p.category, p.is_active;
```

### 4.4 `v_customer_outstanding` — Total Customer Outstanding

```sql
CREATE OR REPLACE VIEW v_customer_outstanding AS
SELECT
    c.id AS customer_id, c.name AS customer_name,
    COALESCE((SELECT SUM(vr.outstanding_balance) FROM v_receivables vr
         WHERE vr.customer_id = c.id AND vr.status IN ('Outstanding','Partially Paid')), 0)
    AS receivable_outstanding,
    COALESCE((SELECT SUM(CASE WHEN hd.verification_status='Adjusted' THEN hd.adjusted_amount ELSE hd.amount END)
         FROM historical_debts hd WHERE hd.entity_type='customer' AND hd.entity_id=c.id
           AND hd.verification_status IN ('Pending','Verified','Disputed')), 0)
    AS historical_debt_outstanding,
    COALESCE((SELECT SUM(vr.outstanding_balance) FROM v_receivables vr
         WHERE vr.customer_id = c.id AND vr.status IN ('Outstanding','Partially Paid')), 0)
    + COALESCE((SELECT SUM(CASE WHEN hd.verification_status='Adjusted' THEN hd.adjusted_amount ELSE hd.amount END)
         FROM historical_debts hd WHERE hd.entity_type='customer' AND hd.entity_id=c.id
           AND hd.verification_status IN ('Pending','Verified','Disputed')), 0)
    AS total_outstanding
FROM customers c;
```

### 4.5 `v_supplier_outstanding` — Total Supplier Outstanding

```sql
CREATE OR REPLACE VIEW v_supplier_outstanding AS
SELECT
    s.id AS supplier_id, s.name AS supplier_name,
    COALESCE((SELECT SUM(vp.outstanding_balance) FROM v_payables vp
         WHERE vp.supplier_id = s.id AND vp.status IN ('Outstanding','Partially Paid')), 0)
    AS payable_outstanding,
    COALESCE((SELECT SUM(CASE WHEN hd.verification_status='Adjusted' THEN hd.adjusted_amount ELSE hd.amount END)
         FROM historical_debts hd WHERE hd.entity_type='supplier' AND hd.entity_id=s.id
           AND hd.verification_status IN ('Pending','Verified','Disputed')), 0)
    AS historical_debt_outstanding,
    COALESCE((SELECT SUM(vp.outstanding_balance) FROM v_payables vp
         WHERE vp.supplier_id = s.id AND vp.status IN ('Outstanding','Partially Paid')), 0)
    + COALESCE((SELECT SUM(CASE WHEN hd.verification_status='Adjusted' THEN hd.adjusted_amount ELSE hd.amount END)
         FROM historical_debts hd WHERE hd.entity_type='supplier' AND hd.entity_id=s.id
           AND hd.verification_status IN ('Pending','Verified','Disputed')), 0)
    AS total_outstanding
FROM suppliers s;
```

---

## 5. Database Functions & Triggers

### 5.1 Auto-Create Profile on User Signup
```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, full_name, role)
    VALUES (NEW.id, NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'staff'));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### 5.2 Auto-Create Receivable on B2B Fulfillment Completed
```sql
CREATE OR REPLACE FUNCTION create_receivable_on_fulfillment_completed()
RETURNS TRIGGER AS $$
DECLARE v_total NUMERIC(15,2);
BEGIN
    IF NEW.status = 'Completed' AND OLD.status IS DISTINCT FROM 'Completed' THEN
        SELECT SUM(quantity * unit_price) INTO v_total
        FROM b2b_fulfillment_items WHERE fulfillment_id = NEW.id;
        INSERT INTO receivables (customer_id, source_type, source_id, amount, due_date, status, created_by)
        VALUES (NEW.customer_id, 'B2B', NEW.id, v_total, NEW.fulfillment_date + INTERVAL '30 days', 'Outstanding', NEW.created_by);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_fulfillment_completed
    AFTER UPDATE ON b2b_fulfillments
    FOR EACH ROW EXECUTE FUNCTION create_receivable_on_fulfillment_completed();
```

### 5.3 Auto-Create Receivable on B2C Order Released
```sql
CREATE OR REPLACE FUNCTION create_receivable_on_order_released()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'Released' AND OLD.status IS DISTINCT FROM 'Released' THEN
        INSERT INTO receivables (customer_id, source_type, source_id, amount, due_date, status, created_by)
        VALUES (NEW.customer_id, 'B2C', NEW.id, NEW.total_amount, NEW.order_date + INTERVAL '30 days', 'Outstanding', NEW.created_by);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_b2c_order_released
    BEFORE UPDATE ON b2c_printing_orders
    FOR EACH ROW EXECUTE FUNCTION create_receivable_on_order_released();
```

### 5.4 Auto-Create Payable on PO Fully Received
```sql
CREATE OR REPLACE FUNCTION create_payable_on_po_fully_received()
RETURNS TRIGGER AS $$
DECLARE v_total NUMERIC(15,2);
BEGIN
    IF NEW.status = 'Fully Received' AND OLD.status IS DISTINCT FROM 'Fully Received' THEN
        SELECT SUM(ordered_qty * unit_price) INTO v_total
        FROM b2b_po_items WHERE po_id = NEW.id;
        INSERT INTO payables (supplier_id, source_type, source_id, amount, due_date, status, created_by)
        VALUES (NEW.supplier_id, 'B2B', NEW.id, v_total, NEW.order_date + INTERVAL '30 days', 'Outstanding', NEW.created_by);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_po_fully_received
    AFTER UPDATE ON b2b_purchase_orders
    FOR EACH ROW EXECUTE FUNCTION create_payable_on_po_fully_received();
```

### 5.5 Update Receivable/Payable Status on Payment Insert
```sql
CREATE OR REPLACE FUNCTION update_source_status_on_payment()
RETURNS TRIGGER AS $$
DECLARE
    v_source_amount NUMERIC(15,2);
    v_total_paid NUMERIC(15,2);
    v_table TEXT;
BEGIN
    v_table := CASE NEW.payment_type WHEN 'receivable' THEN 'receivables' ELSE 'payables' END;
    EXECUTE format('SELECT amount FROM %I WHERE id = $1', v_table) INTO v_source_amount USING NEW.source_id;
    SELECT COALESCE(SUM(amount), 0) INTO v_total_paid
    FROM payments WHERE source_id = NEW.source_id AND payment_type = NEW.payment_type AND is_voided = false;
    IF v_total_paid >= v_source_amount THEN
        EXECUTE format('UPDATE %I SET status = ''Fully Paid'', updated_at = now() WHERE id = $1', v_table) USING NEW.source_id;
    ELSIF v_total_paid > 0 THEN
        EXECUTE format('UPDATE %I SET status = ''Partially Paid'', updated_at = now() WHERE id = $1', v_table) USING NEW.source_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_payment_inserted
    AFTER INSERT ON payments
    FOR EACH ROW EXECUTE FUNCTION update_source_status_on_payment();
```

### 5.6 Recalculate Status on Payment Void
```sql
CREATE OR REPLACE FUNCTION recalculate_status_on_void()
RETURNS TRIGGER AS $$
DECLARE
    v_source_amount NUMERIC(15,2);
    v_total_paid NUMERIC(15,2);
    v_table TEXT;
BEGIN
    IF NEW.is_voided = true AND OLD.is_voided = false THEN
        v_table := CASE NEW.payment_type WHEN 'receivable' THEN 'receivables' ELSE 'payables' END;
        EXECUTE format('SELECT amount FROM %I WHERE id = $1', v_table) INTO v_source_amount USING NEW.source_id;
        SELECT COALESCE(SUM(amount), 0) INTO v_total_paid
        FROM payments WHERE source_id = NEW.source_id AND payment_type = NEW.payment_type AND is_voided = false;
        IF v_total_paid = 0 THEN
            EXECUTE format('UPDATE %I SET status = ''Outstanding'', updated_at = now() WHERE id = $1', v_table) USING NEW.source_id;
        ELSE
            EXECUTE format('UPDATE %I SET status = ''Partially Paid'', updated_at = now() WHERE id = $1', v_table) USING NEW.source_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_payment_voided
    AFTER UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION recalculate_status_on_void();
```

### 5.7 Auto-Create Inventory Movements on Receiving
```sql
CREATE OR REPLACE FUNCTION create_inventory_on_receiving()
RETURNS TRIGGER AS $$
DECLARE v_item RECORD;
BEGIN
    FOR v_item IN
        SELECT ri.received_qty, poi.product_id, poi.id as po_item_id
        FROM b2b_receiving_items ri JOIN b2b_po_items poi ON poi.id = ri.po_item_id
        WHERE ri.receiving_id = NEW.id
    LOOP
        INSERT INTO inventory_movements (product_id, movement_type, quantity, reference_type, reference_id, created_by, movement_date)
        VALUES (v_item.product_id, 'received', v_item.received_qty, 'receiving', NEW.id, NEW.received_by, NEW.receiving_date);
        UPDATE b2b_po_items SET received_qty = received_qty + v_item.received_qty, updated_at = now() WHERE id = v_item.po_item_id;
    END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_receiving_creates_inventory
    AFTER INSERT ON b2b_receiving_records
    FOR EACH ROW EXECUTE FUNCTION create_inventory_on_receiving();
```

### 5.8 Auto-Create Inventory Movements on Fulfillment Completed
```sql
CREATE OR REPLACE FUNCTION create_inventory_on_fulfillment()
RETURNS TRIGGER AS $$
DECLARE v_item RECORD;
BEGIN
    IF NEW.status = 'Completed' AND OLD.status IS DISTINCT FROM 'Completed' THEN
        FOR v_item IN SELECT * FROM b2b_fulfillment_items WHERE fulfillment_id = NEW.id LOOP
            INSERT INTO inventory_movements (product_id, movement_type, quantity, reference_type, reference_id, created_by, movement_date)
            VALUES (v_item.product_id, 'released', v_item.quantity, 'fulfillment', NEW.id, NEW.created_by, NEW.fulfillment_date);
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_fulfillment_creates_inventory
    AFTER UPDATE ON b2b_fulfillments
    FOR EACH ROW EXECUTE FUNCTION create_inventory_on_fulfillment();
```

### 5.9 Update PO Status Based on Receiving Completion
```sql
CREATE OR REPLACE FUNCTION update_po_status_on_receiving()
RETURNS TRIGGER AS $$
DECLARE v_all_received BOOLEAN; v_any_received BOOLEAN;
BEGIN
    SELECT BOOL_AND(received_qty >= ordered_qty) INTO v_all_received FROM b2b_po_items WHERE po_id = NEW.po_id;
    SELECT BOOL_OR(received_qty > 0) INTO v_any_received FROM b2b_po_items WHERE po_id = NEW.po_id;
    IF v_all_received THEN
        UPDATE b2b_purchase_orders SET status = 'Fully Received', updated_at = now()
        WHERE id = NEW.po_id AND status IN ('Submitted', 'Partially Received');
    ELSIF v_any_received THEN
        UPDATE b2b_purchase_orders SET status = 'Partially Received', updated_at = now()
        WHERE id = NEW.po_id AND status = 'Submitted';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_receiving_updates_po_status
    AFTER INSERT ON b2b_receiving_records
    FOR EACH ROW EXECUTE FUNCTION update_po_status_on_receiving();
```

### 5.10 Set B2C Order Status Timestamps
```sql
CREATE OR REPLACE FUNCTION set_b2c_status_timestamps()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status IS DISTINCT FROM OLD.status THEN
        CASE NEW.status
            WHEN 'Pending' THEN NEW.pending_at = now();
            WHEN 'In Production' THEN NEW.in_production_at = now();
            WHEN 'Completed' THEN NEW.completed_at = now();
            WHEN 'Released' THEN NEW.released_at = now();
            WHEN 'Paid' THEN NEW.paid_at = now();
            WHEN 'Cancelled' THEN NEW.cancelled_at = now();
        END CASE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_b2c_status_timestamps
    BEFORE UPDATE ON b2c_printing_orders
    FOR EACH ROW EXECUTE FUNCTION set_b2c_status_timestamps();
```

### 5.11 Log Historical Debt Status Changes
```sql
CREATE OR REPLACE FUNCTION log_debt_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.verification_status IS DISTINCT FROM OLD.verification_status THEN
        INSERT INTO historical_debt_status_logs (debt_id, previous_status, new_status, reason, changed_by)
        VALUES (NEW.id, OLD.verification_status, NEW.verification_status,
            COALESCE(NEW.adjustment_reason, NEW.write_off_reason, ''), NEW.created_by);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_debt_status_change
    AFTER UPDATE ON historical_debts
    FOR EACH ROW EXECUTE FUNCTION log_debt_status_change();
```

### 5.12 Auto-Update `updated_at` (applied to all 12+ tables with updated_at)
```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;
-- Applied via CREATE TRIGGER on each table (see migration files for full list)
```

---

## 6. Row Level Security (RLS) Policies

### 6.1 RLS Design Principles
1. **Enable RLS on ALL 20 tables** — no exceptions
2. **Both roles access all business data** — no row-level filtering by role for business tables
3. **Only admin can manage users** (profiles table)
4. **Only admin can void payments** — enforced via RLS WITH CHECK
5. **No DELETE on any business table** — RLS blocks all DELETE operations
6. **Authenticated users only** — all policies require `auth.role() = 'authenticated'`

### 6.2 Helper Function
```sql
CREATE OR REPLACE FUNCTION get_user_role() RETURNS TEXT AS $$
    SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

### 6.3 Business Tables (customers, suppliers, products, all B2B, all B2C, receivables, payables, inventory_movements, historical_debts, all item tables)
```sql
ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated_select" ON <table> FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_insert" ON <table> FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update" ON <table> FOR UPDATE TO authenticated USING (true);
-- NO DELETE policy = DELETE denied for all roles
```

### 6.4 payments — Void Restriction
```sql
CREATE POLICY "authenticated_update_payments" ON payments FOR UPDATE TO authenticated
    USING (true)
    WITH CHECK (
        (NEW.is_voided = OLD.is_voided)  -- non-void updates: anyone
        OR (NEW.is_voided = true AND OLD.is_voided = false AND get_user_role() = 'admin')  -- void: admin only
    );
```

### 6.5 profiles — Admin-Only User Management
```sql
CREATE POLICY "read_own_profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "admin_read_all_profiles" ON profiles FOR SELECT USING (get_user_role() = 'admin');
CREATE POLICY "admin_insert_profiles" ON profiles FOR INSERT TO authenticated WITH CHECK (get_user_role() = 'admin');
CREATE POLICY "admin_update_profiles" ON profiles FOR UPDATE TO authenticated USING (get_user_role() = 'admin');
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE USING (auth.uid() = id);
```

---

## 7. Migration Strategy

### 7.1 Tool & Process
- **Supabase Migrations** — SQL files in `supabase/migrations/`
- Timestamped files: `20260826000001_create_base_tables.sql`
- Applied via `supabase db push`

### 7.2 Migration Order
1. Enable extensions (`pgcrypto`)
2. Create helper functions (`get_user_role`, `update_updated_at`)
3. Create base tables: `profiles`, `customers`, `suppliers`, `products`
4. Create finance tables: `receivables`, `payables`, `payments`
5. Create B2B tables (8 tables)
6. Create B2C tables (2 tables)
7. Create historical debts tables (2 tables)
8. Create inventory table: `inventory_movements`
9. Create all views (5 views)
10. Create all triggers (12+ triggers)
11. Enable RLS and create policies on all tables
12. Create all indexes

### 7.3 Data Seeding
- Initial admin user via Supabase Auth + profile insert
- Optional seed script for test data

---

## 8. Summary

| Category | Tables | Views | Triggers |
|---|---|---|---|
| Auth/Users | 1 | 0 | 1 |
| Master Data | 3 | 0 | 3 (updated_at) |
| Finance | 3 | 2 | 4 |
| B2B | 8 | 0 | 5 |
| B2C | 2 | 0 | 1 |
| Historical Debts | 2 | 0 | 1 |
| Inventory | 1 | 1 | 0 |
| Cross-cutting | 0 | 2 | 1 (updated_at) |
| **Total** | **20** | **5** | **16** |
