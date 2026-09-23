-- Migration 004: B2B Tables (8 tables)
-- Inventory Management System
-- Date: 2026-08-26

-- ============================================================
-- 8. b2b_pre_orders — B2B Pre-Orders
-- ============================================================
CREATE TABLE b2b_pre_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    order_date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Draft', 'Submitted', 'Converted', 'Cancelled')) DEFAULT 'Draft',
    notes TEXT,
    created_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_b2b_pre_orders_customer_id ON b2b_pre_orders(customer_id);
CREATE INDEX idx_b2b_pre_orders_status ON b2b_pre_orders(status);
CREATE INDEX idx_b2b_pre_orders_order_date ON b2b_pre_orders(order_date);

CREATE TRIGGER trg_b2b_pre_orders_updated_at
    BEFORE UPDATE ON b2b_pre_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 9. b2b_pre_order_items — Pre-Order Line Items
-- ============================================================
CREATE TABLE b2b_pre_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pre_order_id UUID NOT NULL REFERENCES b2b_pre_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity NUMERIC(15,2) NOT NULL CHECK (quantity >= 1),
    unit_price NUMERIC(15,2) NOT NULL CHECK (unit_price >= 0.01),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_b2b_pre_order_items_pre_order_id ON b2b_pre_order_items(pre_order_id);

CREATE TRIGGER trg_b2b_pre_order_items_updated_at
    BEFORE UPDATE ON b2b_pre_order_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 10. b2b_purchase_orders — B2B Purchase Orders
-- ============================================================
CREATE TABLE b2b_purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pre_order_id UUID REFERENCES b2b_pre_orders(id) ON DELETE SET NULL,
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
    po_number TEXT NOT NULL UNIQUE,
    order_date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Draft', 'Submitted', 'Partially Received', 'Fully Received', 'Completed', 'Cancelled')) DEFAULT 'Draft',
    notes TEXT,
    created_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_b2b_purchase_orders_supplier_id ON b2b_purchase_orders(supplier_id);
CREATE INDEX idx_b2b_purchase_orders_status ON b2b_purchase_orders(status);
CREATE INDEX idx_b2b_purchase_orders_po_number ON b2b_purchase_orders(po_number);
CREATE INDEX idx_b2b_purchase_orders_order_date ON b2b_purchase_orders(order_date);
CREATE INDEX idx_b2b_purchase_orders_pre_order_id ON b2b_purchase_orders(pre_order_id);

CREATE TRIGGER trg_b2b_purchase_orders_updated_at
    BEFORE UPDATE ON b2b_purchase_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 11. b2b_po_items — Purchase Order Line Items
-- ============================================================
CREATE TABLE b2b_po_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_id UUID NOT NULL REFERENCES b2b_purchase_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    ordered_qty NUMERIC(15,2) NOT NULL CHECK (ordered_qty >= 1),
    unit_price NUMERIC(15,2) NOT NULL CHECK (unit_price >= 0.01),
    received_qty NUMERIC(15,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_b2b_po_items_po_id ON b2b_po_items(po_id);
CREATE INDEX idx_b2b_po_items_product_id ON b2b_po_items(product_id);

CREATE TRIGGER trg_b2b_po_items_updated_at
    BEFORE UPDATE ON b2b_po_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 12. b2b_receiving_records — Receiving Headers
-- ============================================================
CREATE TABLE b2b_receiving_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_id UUID NOT NULL REFERENCES b2b_purchase_orders(id) ON DELETE RESTRICT,
    receiving_date DATE NOT NULL,
    received_by UUID NOT NULL REFERENCES profiles(id),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_b2b_receiving_records_po_id ON b2b_receiving_records(po_id);
CREATE INDEX idx_b2b_receiving_records_receiving_date ON b2b_receiving_records(receiving_date);

CREATE TRIGGER trg_b2b_receiving_records_updated_at
    BEFORE UPDATE ON b2b_receiving_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 13. b2b_receiving_items — Receiving Line Items
-- ============================================================
CREATE TABLE b2b_receiving_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receiving_id UUID NOT NULL REFERENCES b2b_receiving_records(id) ON DELETE CASCADE,
    po_item_id UUID NOT NULL REFERENCES b2b_po_items(id) ON DELETE RESTRICT,
    received_qty NUMERIC(15,2) NOT NULL CHECK (received_qty >= 0),
    variance_qty NUMERIC(15,2) NOT NULL DEFAULT 0,
    variance_reason TEXT CHECK (LENGTH(variance_reason) <= 500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_b2b_receiving_items_receiving_id ON b2b_receiving_items(receiving_id);
CREATE INDEX idx_b2b_receiving_items_po_item_id ON b2b_receiving_items(po_item_id);

CREATE TRIGGER trg_b2b_receiving_items_updated_at
    BEFORE UPDATE ON b2b_receiving_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 14. b2b_fulfillments — B2B Fulfillments (Deliveries to Customers)
-- ============================================================
CREATE TABLE b2b_fulfillments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    fulfillment_date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Pending', 'In Progress', 'Completed', 'Cancelled')) DEFAULT 'Pending',
    notes TEXT,
    created_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_b2b_fulfillments_customer_id ON b2b_fulfillments(customer_id);
CREATE INDEX idx_b2b_fulfillments_status ON b2b_fulfillments(status);
CREATE INDEX idx_b2b_fulfillments_fulfillment_date ON b2b_fulfillments(fulfillment_date);

CREATE TRIGGER trg_b2b_fulfillments_updated_at
    BEFORE UPDATE ON b2b_fulfillments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 15. b2b_fulfillment_items — Fulfillment Line Items
-- ============================================================
CREATE TABLE b2b_fulfillment_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fulfillment_id UUID NOT NULL REFERENCES b2b_fulfillments(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity NUMERIC(15,2) NOT NULL CHECK (quantity >= 1),
    unit_price NUMERIC(15,2) NOT NULL CHECK (unit_price >= 0.01),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_b2b_fulfillment_items_fulfillment_id ON b2b_fulfillment_items(fulfillment_id);

CREATE TRIGGER trg_b2b_fulfillment_items_updated_at
    BEFORE UPDATE ON b2b_fulfillment_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
