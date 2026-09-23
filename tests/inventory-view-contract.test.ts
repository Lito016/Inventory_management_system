import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { inventory_movements, products, v_inventory_summary } from '../src/lib/supabase/seed-data.ts';

// Guards the data-consistency contract (R1/R5): pages must consume exactly the
// columns exposed by v_inventory_summary (migration 20260826000008_views.sql)
// and the reference implementation in seed-data.ts.

const VIEW_COLUMNS = [
  'product_id', 'name', 'unit', 'category', 'is_active',
  'total_received', 'total_released', 'total_adjustments', 'current_quantity',
] as const;

describe('v_inventory_summary view contract', () => {
  test('rows expose exactly the columns from migration 008', () => {
    assert.ok(v_inventory_summary.length > 0);
    for (const row of v_inventory_summary) {
      assert.deepEqual(Object.keys(row).sort(), [...VIEW_COLUMNS].sort(), `row ${row.product_id}`);
    }
  });

  test('one row per product', () => {
    assert.equal(v_inventory_summary.length, products.length);
    const ids = new Set(v_inventory_summary.map(r => r.product_id));
    assert.equal(ids.size, products.length);
  });
});

describe('current_quantity derivation', () => {
  test('equals received - released + adjustments for every product', () => {
    for (const row of v_inventory_summary) {
      const expected = Number.parseFloat(row.total_received)
        - Number.parseFloat(row.total_released)
        + Number.parseFloat(row.total_adjustments);
      assert.ok(
        Math.abs(Number.parseFloat(row.current_quantity) - expected) < 1e-9,
        `${row.name}: ${row.current_quantity} != ${expected}`
      );
    }
  });

  test('adjustment movements are stored signed and sum linearly into the view', () => {
    const adjustments = inventory_movements.filter(m => m.movement_type === 'adjustment');
    assert.ok(adjustments.length > 0, 'seed data must contain adjustments');
    assert.ok(adjustments.some(m => Number.parseFloat(m.quantity) < 0), 'seed data must contain a decrease');
    for (const row of v_inventory_summary) {
      const sum = inventory_movements
        .filter(m => m.product_id === row.product_id && m.movement_type === 'adjustment')
        .reduce((s, m) => s + Number.parseFloat(m.quantity), 0);
      assert.ok(Math.abs(Number.parseFloat(row.total_adjustments) - sum) < 1e-9, row.name);
    }
  });

  test('released movements stored positive are subtracted', () => {
    for (const row of v_inventory_summary) {
      const released = inventory_movements
        .filter(m => m.product_id === row.product_id && m.movement_type === 'released')
        .reduce((s, m) => s + Number.parseFloat(m.quantity), 0);
      assert.ok(Math.abs(Number.parseFloat(row.total_released) - released) < 1e-9, row.name);
      assert.ok(released >= 0);
    }
  });
});
