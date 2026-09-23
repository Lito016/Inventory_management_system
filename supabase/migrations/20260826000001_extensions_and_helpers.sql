-- Migration 001: Extensions & Helper Functions
-- Inventory Management System
-- Date: 2026-08-26

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- Helper Function: get_user_role()
-- Returns the role of the currently authenticated user
-- ============================================================
CREATE OR REPLACE FUNCTION get_user_role() RETURNS TEXT AS $$
    SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- Helper Function: update_updated_at()
-- Generic trigger function to auto-update updated_at column
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
