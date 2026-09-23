-- Migration 006: Historical Debts Tables (2 tables)
-- Inventory Management System
-- Date: 2026-08-26

-- ============================================================
-- 18. historical_debts — Historical Debt Records
-- ============================================================
CREATE TABLE historical_debts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('customer', 'supplier')),
    entity_id UUID NOT NULL,
    amount NUMERIC(15,2) NOT NULL CHECK (amount > 0),
    debt_date DATE NOT NULL CHECK (debt_date <= CURRENT_DATE),
    source TEXT CHECK (LENGTH(source) <= 255),
    description TEXT CHECK (LENGTH(description) <= 500),
    verification_status TEXT NOT NULL CHECK (verification_status IN ('Pending', 'Verified', 'Disputed', 'Adjusted', 'Written Off')) DEFAULT 'Pending',
    adjusted_amount NUMERIC(15,2),
    adjustment_reason TEXT,
    write_off_reason TEXT,
    created_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Composite index for entity lookups
CREATE INDEX idx_historical_debts_entity ON historical_debts(entity_type, entity_id);
CREATE INDEX idx_historical_debts_status ON historical_debts(verification_status);
CREATE INDEX idx_historical_debts_debt_date ON historical_debts(debt_date);

CREATE TRIGGER trg_historical_debts_updated_at
    BEFORE UPDATE ON historical_debts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 19. historical_debt_status_logs — Audit Trail for Status Changes
-- ============================================================
CREATE TABLE historical_debt_status_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    debt_id UUID NOT NULL REFERENCES historical_debts(id) ON DELETE CASCADE,
    previous_status TEXT NOT NULL,
    new_status TEXT NOT NULL,
    reason TEXT,
    changed_by UUID NOT NULL REFERENCES profiles(id),
    changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_debt_status_logs_debt_id ON historical_debt_status_logs(debt_id);
