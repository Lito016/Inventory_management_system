import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { demoFlagOn } from '../src/lib/demo.ts';

describe('demoFlagOn', () => {
  test('true only for the exact "true" value', () => {
    assert.equal(demoFlagOn('true'), true);
  });

  test('false for missing, empty, or other values', () => {
    assert.equal(demoFlagOn(undefined), false);
    assert.equal(demoFlagOn(''), false);
    assert.equal(demoFlagOn('false'), false);
    assert.equal(demoFlagOn('1'), false);
    assert.equal(demoFlagOn('TRUE'), false);
  });
});
