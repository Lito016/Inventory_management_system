-- Migration 003: Finance Tables (receivables, payables, payments)
-- Inventory Management System
-- Date: 2026-08-26

-- ============================================================
-- 5. receivables — Customer Receivables
-- ============================================================
CREATE TABLE receivables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    source_type TEXT NOT NULL CHECK (source_type IN ('B2B', 'B2C')),
    source_id UUID NOT NULL,
    amount NUMERIC(15,2) NOT NULL CHECK (amount > 0),
    due_date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Outstanding', 'Partially Paid', 'Fully Paid', 'Voided')) DEFAULT 'Outstanding',
    notes TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_receivables_customer_id ON receivables(customer_id);
CREATE INDEX idx_receivables_status ON receivables(status);
CREATE INDEX idx_receivables_due_date ON receivables(due_date);
CREATE INDEX idx_receivables_source ON receivables(source_type, source_id);
-- Composite index for overdue queries (status + due_date)
CREATE INDEX idx_receivables_overdue ON receivables(status, due_date);

CREATE TRIGGER trg_receivables_updated_at
    BEFORE UPDATE ON receivables
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 6. payables — Supplier Payables
-- ============================================================
CREATE TABLE payables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
    source_type TEXT NOT NULL DEFAULT 'B2B',
    source_id UUID NOT NULL,
    amount NUMERIC(15,2) NOT NULL CHECK (amount > 0),
    due_date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Outstanding', 'Partially Paid', 'Fully Paid', 'Voided')) DEFAULT 'Outstanding',
    notes TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payables_supplier_id ON payables(supplier_id);
CREATE INDEX idx_payables_status ON payables(status);
CREATE INDEX idx_payables_due_date ON payables(due_date);
CREATE INDEX idx_payables_source ON payables(source_type, source_id);

CREATE TRIGGER trg_payables_updated_at
    BEFORE UPDATE ON payables
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 7. payments — Payment Records
-- ============================================================
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_type TEXT NOT NULL CHECK (payment_type IN ('receivable', 'payable')),
    source_id UUID NOT NULL,
    amount NUMERIC(15,2) NOT NULL CHECK (amount > 0),
    payment_date DATE NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('Cash', 'Bank Transfer', 'Check')),
    reference_number TEXT,
    is_voided BOOLEAN NOT NULL DEFAULT false,
    void_reason TEXT,
    voided_by UUID REFERENCES profiles(id),
    voided_at TIMESTAMPTZ,
    recorded_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Composite indexes for payment queries (Phase 3 quality review fix)
CREATE INDEX idx_payments_source ON payments(payment_type, source_id);
CREATE INDEX idx_payments_payment_date ON payments(payment_date);
CREATE INDEX idx_payments_payment_method ON payments(payment_method);
CREATE INDEX idx_payments_recorded_by ON payments(recorded_by);
CREATE INDEX idx_payments_is_voided ON payments(is_voided);
-- Composite for balance calculation queries
CREATE INDEX idx_payments_balance_calc ON payments(payment_type, source_id, is_voided) INCLUDE (amount);

CREATE TRIGGER trg_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
