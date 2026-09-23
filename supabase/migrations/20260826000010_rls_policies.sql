-- Migration 010: Row Level Security (RLS) Policies
-- Inventory Management System
-- Date: 2026-08-26

-- ============================================================
-- Enable RLS on ALL 20 tables
-- ============================================================

-- Base tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Finance tables
ALTER TABLE receivables ENABLE ROW LEVEL SECURITY;
ALTER TABLE payables ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- B2B tables
ALTER TABLE b2b_pre_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_pre_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_po_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_receiving_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_receiving_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_fulfillments ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_fulfillment_items ENABLE ROW LEVEL SECURITY;

-- B2C tables
ALTER TABLE b2c_printing_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2c_order_items ENABLE ROW LEVEL SECURITY;

-- Historical debts tables
ALTER TABLE historical_debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE historical_debt_status_logs ENABLE ROW LEVEL SECURITY;

-- Inventory table
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Business Tables: Standard CRUD for authenticated users
-- (No DELETE policy = DELETE denied for all roles)
-- ============================================================

-- customers
CREATE POLICY "authenticated_select_customers" ON customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_insert_customers" ON customers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update_customers" ON customers FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- suppliers
CREATE POLICY "authenticated_select_suppliers" ON suppliers FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_insert_suppliers" ON suppliers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update_suppliers" ON suppliers FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- products
CREATE POLICY "authenticated_select_products" ON products FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_insert_products" ON products FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update_products" ON products FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- receivables
CREATE POLICY "authenticated_select_receivables" ON receivables FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_insert_receivables" ON receivables FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update_receivables" ON receivables FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- payables
CREATE POLICY "authenticated_select_payables" ON payables FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_insert_payables" ON payables FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update_payables" ON payables FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- payments — Void restriction: only admin can void
CREATE POLICY "authenticated_select_payments" ON payments FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_insert_payments" ON payments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update_payments" ON payments FOR UPDATE TO authenticated
    USING (true)
    WITH CHECK (
        (NEW.is_voided = OLD.is_voided)  -- non-void updates: anyone
        OR (NEW.is_voided = true AND OLD.is_voided = false AND get_user_role() = 'admin')  -- void: admin only
    );

-- b2b_pre_orders
CREATE POLICY "authenticated_select_b2b_pre_orders" ON b2b_pre_orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_insert_b2b_pre_orders" ON b2b_pre_orders FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update_b2b_pre_orders" ON b2b_pre_orders FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- b2b_pre_order_items
CREATE POLICY "authenticated_select_b2b_pre_order_items" ON b2b_pre_order_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_insert_b2b_pre_order_items" ON b2b_pre_order_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update_b2b_pre_order_items" ON b2b_pre_order_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- b2b_purchase_orders
CREATE POLICY "authenticated_select_b2b_purchase_orders" ON b2b_purchase_orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_insert_b2b_purchase_orders" ON b2b_purchase_orders FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update_b2b_purchase_orders" ON b2b_purchase_orders FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- b2b_po_items
CREATE POLICY "authenticated_select_b2b_po_items" ON b2b_po_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_insert_b2b_po_items" ON b2b_po_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update_b2b_po_items" ON b2b_po_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- b2b_receiving_records
CREATE POLICY "authenticated_select_b2b_receiving_records" ON b2b_receiving_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_insert_b2b_receiving_records" ON b2b_receiving_records FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update_b2b_receiving_records" ON b2b_receiving_records FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- b2b_receiving_items
CREATE POLICY "authenticated_select_b2b_receiving_items" ON b2b_receiving_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_insert_b2b_receiving_items" ON b2b_receiving_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update_b2b_receiving_items" ON b2b_receiving_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- b2b_fulfillments
CREATE POLICY "authenticated_select_b2b_fulfillments" ON b2b_fulfillments FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_insert_b2b_fulfillments" ON b2b_fulfillments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update_b2b_fulfillments" ON b2b_fulfillments FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- b2b_fulfillment_items
CREATE POLICY "authenticated_select_b2b_fulfillment_items" ON b2b_fulfillment_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_insert_b2b_fulfillment_items" ON b2b_fulfillment_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update_b2b_fulfillment_items" ON b2b_fulfillment_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- b2c_printing_orders
CREATE POLICY "authenticated_select_b2c_printing_orders" ON b2c_printing_orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_insert_b2c_printing_orders" ON b2c_printing_orders FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update_b2c_printing_orders" ON b2c_printing_orders FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- b2c_order_items
CREATE POLICY "authenticated_select_b2c_order_items" ON b2c_order_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_insert_b2c_order_items" ON b2c_order_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update_b2c_order_items" ON b2c_order_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- historical_debts
CREATE POLICY "authenticated_select_historical_debts" ON historical_debts FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_insert_historical_debts" ON historical_debts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update_historical_debts" ON historical_debts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- historical_debt_status_logs
CREATE POLICY "authenticated_select_debt_status_logs" ON historical_debt_status_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_insert_debt_status_logs" ON historical_debt_status_logs FOR INSERT TO authenticated WITH CHECK (true);

-- inventory_movements
CREATE POLICY "authenticated_select_inventory_movements" ON inventory_movements FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_insert_inventory_movements" ON inventory_movements FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update_inventory_movements" ON inventory_movements FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- profiles — Admin-Only User Management + Self-Read
-- ============================================================
CREATE POLICY "read_own_profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "admin_read_all_profiles" ON profiles FOR SELECT USING (get_user_role() = 'admin');
CREATE POLICY "admin_insert_profiles" ON profiles FOR INSERT TO authenticated WITH CHECK (get_user_role() = 'admin');
CREATE POLICY "admin_update_profiles" ON profiles FOR UPDATE TO authenticated USING (get_user_role() = 'admin');
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE USING (auth.uid() = id);
