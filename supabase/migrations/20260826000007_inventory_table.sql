-- Migration 007: Inventory Table
-- UBMS — Unified Business Management System
-- Date: 2026-08-26

-- ============================================================
-- 20. inventory_movements — Inventory Movement Log
-- ============================================================
CREATE TABLE inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    movement_type TEXT NOT NULL CHECK (movement_type IN ('received', 'released', 'adjustment')),
    quantity NUMERIC(15,2) NOT NULL,
    reference_type TEXT CHECK (reference_type IN ('receiving', 'fulfillment', 'adjustment')),
    reference_id UUID,
    notes TEXT,
    created_by UUID NOT NULL REFERENCES profiles(id),
    movement_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_inventory_movements_product_id ON inventory_movements(product_id);
CREATE INDEX idx_inventory_movements_type ON inventory_movements(movement_type);
CREATE INDEX idx_inventory_movements_date ON inventory_movements(movement_date);
CREATE INDEX idx_inventory_movements_ref ON inventory_movements(reference_type, reference_id);
