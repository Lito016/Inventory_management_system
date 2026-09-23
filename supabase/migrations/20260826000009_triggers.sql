-- Migration 009: Business Triggers (12 trigger functions + triggers)
-- Inventory Management System
-- Date: 2026-08-26

-- ============================================================
-- Trigger 1: Auto-Create Profile on User Signup
-- ============================================================
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- Trigger 2: Auto-Create Receivable on B2B Fulfillment Completed
-- ============================================================
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

DROP TRIGGER IF EXISTS trg_fulfillment_completed ON b2b_fulfillments;
CREATE TRIGGER trg_fulfillment_completed
    AFTER UPDATE ON b2b_fulfillments
    FOR EACH ROW EXECUTE FUNCTION create_receivable_on_fulfillment_completed();

-- ============================================================
-- Trigger 3: Auto-Create Receivable on B2C Order Released
-- ============================================================
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

DROP TRIGGER IF EXISTS trg_b2c_order_released ON b2c_printing_orders;
CREATE TRIGGER trg_b2c_order_released
    BEFORE UPDATE ON b2c_printing_orders
    FOR EACH ROW EXECUTE FUNCTION create_receivable_on_order_released();

-- ============================================================
-- Trigger 4: Auto-Create Payable on PO Fully Received
-- ============================================================
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

DROP TRIGGER IF EXISTS trg_po_fully_received ON b2b_purchase_orders;
CREATE TRIGGER trg_po_fully_received
    AFTER UPDATE ON b2b_purchase_orders
    FOR EACH ROW EXECUTE FUNCTION create_payable_on_po_fully_received();

-- ============================================================
-- Trigger 5: Update Receivable/Payable Status on Payment Insert
-- ============================================================
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

DROP TRIGGER IF EXISTS trg_payment_inserted ON payments;
CREATE TRIGGER trg_payment_inserted
    AFTER INSERT ON payments
    FOR EACH ROW EXECUTE FUNCTION update_source_status_on_payment();

-- ============================================================
-- Trigger 6: Recalculate Status on Payment Void
-- ============================================================
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

DROP TRIGGER IF EXISTS trg_payment_voided ON payments;
CREATE TRIGGER trg_payment_voided
    AFTER UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION recalculate_status_on_void();

-- ============================================================
-- Trigger 7: Auto-Create Inventory Movements on Receiving
-- ============================================================
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

DROP TRIGGER IF EXISTS trg_receiving_creates_inventory ON b2b_receiving_records;
CREATE TRIGGER trg_receiving_creates_inventory
    AFTER INSERT ON b2b_receiving_records
    FOR EACH ROW EXECUTE FUNCTION create_inventory_on_receiving();

-- ============================================================
-- Trigger 8: Auto-Create Inventory Movements on Fulfillment
-- ============================================================
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

DROP TRIGGER IF EXISTS trg_fulfillment_creates_inventory ON b2b_fulfillments;
CREATE TRIGGER trg_fulfillment_creates_inventory
    AFTER UPDATE ON b2b_fulfillments
    FOR EACH ROW EXECUTE FUNCTION create_inventory_on_fulfillment();

-- ============================================================
-- Trigger 9: Update PO Status Based on Receiving Completion
-- ============================================================
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

DROP TRIGGER IF EXISTS trg_receiving_updates_po_status ON b2b_receiving_records;
CREATE TRIGGER trg_receiving_updates_po_status
    AFTER INSERT ON b2b_receiving_records
    FOR EACH ROW EXECUTE FUNCTION update_po_status_on_receiving();

-- ============================================================
-- Trigger 10: Set B2C Order Status Timestamps
-- ============================================================
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

DROP TRIGGER IF EXISTS trg_b2c_status_timestamps ON b2c_printing_orders;
CREATE TRIGGER trg_b2c_status_timestamps
    BEFORE UPDATE ON b2c_printing_orders
    FOR EACH ROW EXECUTE FUNCTION set_b2c_status_timestamps();

-- ============================================================
-- Trigger 11: Log Historical Debt Status Changes
-- ============================================================
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

DROP TRIGGER IF EXISTS trg_debt_status_change ON historical_debts;
CREATE TRIGGER trg_debt_status_change
    AFTER UPDATE ON historical_debts
    FOR EACH ROW EXECUTE FUNCTION log_debt_status_change();
