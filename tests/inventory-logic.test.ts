import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import {
  LOW_STOCK_THRESHOLD,
  movementQuantityDisplay,
  parseAdjustmentQuantity,
  projectedQuantityAfterAdjustment,
  sanitizeSearchTerm,
  stockStatus,
} from '../src/lib/inventory.ts';

describe('stockStatus', () => {
  test('zero and negative are Out of Stock', () => {
    assert.equal(stockStatus(0), 'Out of Stock');
    assert.equal(stockStatus(-3.5), 'Out of Stock');
  });
  test('non-finite input is Out of Stock, never falsely healthy', () => {
    assert.equal(stockStatus(Number.NaN), 'Out of Stock');
    assert.equal(stockStatus(Number.POSITIVE_INFINITY), 'Out of Stock');
  });
  test('positive below threshold is Low Stock', () => {
    assert.equal(stockStatus(0.01), 'Low Stock');
    assert.equal(stockStatus(LOW_STOCK_THRESHOLD - 0.01), 'Low Stock');
  });
  test('at or above threshold is In Stock', () => {
    assert.equal(stockStatus(LOW_STOCK_THRESHOLD), 'In Stock');
    assert.equal(stockStatus(9999), 'In Stock');
  });
});

describe('sanitizeSearchTerm', () => {
  test('strips PostgREST reserved characters that would break or() filters', () => {
    assert.equal(sanitizeSearchTerm('Dye, Blue (50g)'), 'Dye  Blue  50g');
  });
  test('plain terms pass through trimmed', () => {
    assert.equal(sanitizeSearchTerm('  cotton  '), 'cotton');
  });
  test('a stripped-to-empty term yields empty string', () => {
    assert.equal(sanitizeSearchTerm(',()'), '');
  });
  test('ILIKE wildcards are stripped so terms match literally', () => {
    assert.equal(sanitizeSearchTerm('50% cotton_fiber'), '50  cotton fiber');
  });
});

describe('parseAdjustmentQuantity', () => {
  test('accepts positive and negative decimals', () => {
    assert.equal(parseAdjustmentQuantity('7.5'), 7.5);
    assert.equal(parseAdjustmentQuantity('-2.25'), -2.25);
  });
  test('rejects zero, empty, garbage, and infinities', () => {
    assert.equal(parseAdjustmentQuantity('0'), null);
    assert.equal(parseAdjustmentQuantity(''), null);
    assert.equal(parseAdjustmentQuantity('abc'), null);
    assert.equal(parseAdjustmentQuantity('1e999'), null);
  });
  test('rounds to NUMERIC(15,2) scale', () => {
    assert.equal(parseAdjustmentQuantity('1.23456'), 1.23);
    assert.equal(parseAdjustmentQuantity('-1.23456'), -1.23);
  });
  test('sub-scale values that round to zero are rejected', () => {
    assert.equal(parseAdjustmentQuantity('0.0001'), null);
    assert.equal(parseAdjustmentQuantity('-0.0001'), null);
  });
});

describe('projectedQuantityAfterAdjustment', () => {
  test('adds signed adjustment to view string quantity', () => {
    assert.equal(projectedQuantityAfterAdjustment('12.00', -2.5), 9.5);
  });
  test('decrease beyond stock projects negative', () => {
    assert.ok(projectedQuantityAfterAdjustment('3', -5) < 0);
  });
  test('non-numeric current falls back to zero base', () => {
    assert.equal(projectedQuantityAfterAdjustment('n/a', 2), 2);
  });
});

describe('movementQuantityDisplay', () => {
  test('received shows plus, released shows minus regardless of stored sign', () => {
    assert.equal(movementQuantityDisplay('received', '8'), '+8');
    assert.equal(movementQuantityDisplay('released', '8'), '-8');
  });
  test('adjustment preserves stored sign, adds plus for positive', () => {
    assert.equal(movementQuantityDisplay('adjustment', '-5'), '-5');
    assert.equal(movementQuantityDisplay('adjustment', '10'), '+10');
  });
});
