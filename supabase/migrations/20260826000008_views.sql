-- Migration 008: Computed Views (5 views)
-- Inventory Management System
-- Date: 2026-08-26

-- ============================================================
-- View 1: v_receivables — Balance + Overdue Flag
-- ============================================================
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

-- ============================================================
-- View 2: v_payables — Balance + Overdue Flag
-- ============================================================
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

-- ============================================================
-- View 3: v_inventory_summary — Current Stock Levels
-- ============================================================
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

-- ============================================================
-- View 4: v_customer_outstanding — Total Customer Outstanding
-- ============================================================
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

-- ============================================================
-- View 5: v_supplier_outstanding — Total Supplier Outstanding
-- ============================================================
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
