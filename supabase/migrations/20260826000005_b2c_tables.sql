-- Migration 005: B2C Tables (2 tables)
-- UBMS — Unified Business Management System
-- Date: 2026-08-26

-- ============================================================
-- 16. b2c_printing_orders — B2C Printing Orders
-- ============================================================
CREATE TABLE b2c_printing_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    order_date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Pending', 'In Production', 'Completed', 'Released', 'Paid', 'Cancelled')) DEFAULT 'Pending',
    total_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
    notes TEXT,
    production_notes TEXT CHECK (LENGTH(production_notes) <= 1000),
    pending_at TIMESTAMPTZ,
    in_production_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    released_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    created_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_b2c_printing_orders_customer_id ON b2c_printing_orders(customer_id);
CREATE INDEX idx_b2c_printing_orders_status ON b2c_printing_orders(status);
CREATE INDEX idx_b2c_printing_orders_order_date ON b2c_printing_orders(order_date);

CREATE TRIGGER trg_b2c_printing_orders_updated_at
    BEFORE UPDATE ON b2c_printing_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 17. b2c_order_items — Printing Order Line Items (free text)
-- ============================================================
CREATE TABLE b2c_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES b2c_printing_orders(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity NUMERIC(15,2) NOT NULL CHECK (quantity >= 1),
    unit_price NUMERIC(15,2) NOT NULL CHECK (unit_price >= 0.01),
    total NUMERIC(15,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_b2c_order_items_order_id ON b2c_order_items(order_id);

CREATE TRIGGER trg_b2c_order_items_updated_at
    BEFORE UPDATE ON b2c_order_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
