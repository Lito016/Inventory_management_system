/**
 * Mock Supabase client for prototype mode.
 * Provides an in-memory data store with a chainable query builder
 * that mimics the Supabase JS client API.
 */
import * as seed from './seed-data';

// ── In-memory data store ─────────────────────────────────────
const store: Record<string, Record<string, unknown>[]> = {
  profiles: [...seed.profiles],
  customers: [...seed.customers],
  suppliers: [...seed.suppliers],
  products: [...seed.products],
  b2b_pre_orders: [...seed.b2b_pre_orders],
  b2b_pre_order_items: [...seed.b2b_pre_order_items],
  b2b_purchase_orders: [...seed.b2b_purchase_orders],
  b2b_po_items: [...seed.b2b_po_items],
  b2b_receiving_records: [...seed.b2b_receiving_records],
  b2b_receiving_items: [...seed.b2b_receiving_items],
  b2b_fulfillments: [...seed.b2b_fulfillments],
  b2b_fulfillment_items: [...seed.b2b_fulfillment_items],
  b2c_printing_orders: [...seed.b2c_printing_orders],
  b2c_order_items: [...seed.b2c_order_items],
  receivables: [...seed.receivables],
  payables: [...seed.payables],
  payments: [...seed.payments],
  historical_debts: [...seed.historical_debts],
  inventory_movements: [...seed.inventory_movements],
  v_receivables: [...seed.v_receivables],
  v_payables: [...seed.v_payables],
  v_inventory_summary: [...seed.v_inventory_summary],
  v_customer_outstanding: [...seed.v_customer_outstanding],
  v_supplier_outstanding: [...seed.v_supplier_outstanding],
};

// ── Auth state ───────────────────────────────────────────────
let currentUser: { id: string; email: string } | null = null;
let currentSession: { user: { id: string; email: string } | null; access_token: string } | null = null;
const authListeners: Array<(event: string, session: typeof currentSession) => void> = [];

// Auto-login as admin on init
currentUser = { id: seed.IDS.profiles[0], email: 'admin@ubms.local' };
currentSession = { user: currentUser, access_token: 'mock-token' };

// ── Helpers ──────────────────────────────────────────────────
function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

function getTable(name: string): Record<string, unknown>[] {
  return store[name] ?? [];
}

// ── Filter logic ─────────────────────────────────────────────
function matchEq(row: Record<string, unknown>, col: string, val: unknown): boolean {
  return String(row[col]) === String(val);
}

function matchIn(row: Record<string, unknown>, col: string, vals: unknown[]): boolean {
  return vals.map(String).includes(String(row[col]));
}

function matchOr(row: Record<string, unknown>, orStr: string): boolean {
  // Split on commas that separate conditions (not inside values)
  const conditions = orStr.split(',');
  return conditions.some(cond => {
    const m = cond.trim().match(/^(.+?)\.(eq|ilike|gte|lte|neq)\.(.+)$/);
    if (!m) return false;
    const [, field, op, rawVal] = m;
    const rowVal = String(row[field] ?? '');

    if (op === 'eq') return rowVal === rawVal;
    if (op === 'neq') return rowVal !== rawVal;
    if (op === 'ilike') {
      const pattern = rawVal.replace(/%/g, '').toLowerCase();
      return rowVal.toLowerCase().includes(pattern);
    }
    if (op === 'gte') return rowVal >= rawVal;
    if (op === 'lte') return rowVal <= rawVal;
    return false;
  });
}

function matchGte(row: Record<string, unknown>, col: string, val: unknown): boolean {
  return String(row[col] ?? '') >= String(val);
}

function matchLte(row: Record<string, unknown>, col: string, val: unknown): boolean {
  return String(row[col] ?? '') <= String(val);
}

// ── Join resolution ──────────────────────────────────────────
function resolveJoins(
  rows: Record<string, unknown>[],
  joinDefs: Array<{ alias: string; table: string; cols: string; fkHint?: string }>
): Record<string, unknown>[] {
  if (!joinDefs.length) return rows;
  return rows.map(row => {
    const enriched = { ...row };
    for (const j of joinDefs) {
      const fkField = j.fkHint ?? `${j.table.replace(/s$/, '')}_id`;
      // Try common FK patterns
      let fk = fkField;
      if (!(fk in row)) {
        // Try singularized table name + _id
        const singular = j.table.endsWith('ies')
          ? j.table.slice(0, -3) + 'y'
          : j.table.endsWith('ses') || j.table.endsWith('xs')
            ? j.table.slice(0, -2)
            : j.table.endsWith('s') ? j.table.slice(0, -1) : j.table;
        fk = `${singular}_id`;
      }
      const fkVal = row[fk];
      const relatedTable = getTable(j.table);
      const match = relatedTable.find(r => r.id === fkVal);
      if (match && j.cols) {
        const picked: Record<string, unknown> = {};
        for (const c of j.cols.split(',')) {
          picked[c.trim()] = match[c.trim()];
        }
        enriched[j.alias] = picked;
      } else {
        enriched[j.alias] = null;
      }
    }
    return enriched;
  });
}

// ── Query Builder ────────────────────────────────────────────
class MockQueryBuilder {
  private _table: string;
  private _columns = '*';

  private _filters: Array<(row: Record<string, unknown>) => boolean> = [];
  private _orderCol: string | null = null;
  private _orderAsc = true;
  private _rangeFrom: number | null = null;
  private _rangeTo: number | null = null;
  private _single = false;
  private _joins: Array<{ alias: string; table: string; cols: string; fkHint?: string }> = [];
  private _mutatedData: Record<string, unknown>[] | null = null;

  constructor(table: string) {
    this._table = table;
  }

  select(columns?: string, opts?: { count?: string; head?: boolean }) {
    if (this._mutatedData !== null) {
      // After mutation — just tag which columns to return
      if (columns && columns !== '*') this._columns = columns;
      return this;
    }
    if (columns) {
      this._columns = columns;
      // Parse join patterns: alias:table(cols) or alias:table!fk(cols)
      const joinRe = /(\w+):(\w+)(?:!(\w+))?\(([^)]*)\)/g;
      let m: RegExpExecArray | null;
      while ((m = joinRe.exec(columns)) !== null) {
        this._joins.push({ alias: m[1], table: m[2], cols: m[4], fkHint: m[3] });
      }
    }
    if (opts?.head) this._columns = '__head__';
    return this;
  }

  eq(col: string, val: unknown) {
    if (this._mutatedData !== null) {
      // Filter the mutated data (for update().eq() pattern)
      this._filters.push(r => matchEq(r, col, val));
      return this;
    }
    this._filters.push(r => matchEq(r, col, val));
    return this;
  }

  in(col: string, vals: unknown[]) {
    this._filters.push(r => matchIn(r, col, vals));
    return this;
  }

  or(filterStr: string) {
    this._filters.push(r => matchOr(r, filterStr));
    return this;
  }

  gte(col: string, val: unknown) {
    this._filters.push(r => matchGte(r, col, val));
    return this;
  }

  lte(col: string, val: unknown) {
    this._filters.push(r => matchLte(r, col, val));
    return this;
  }

  order(col: string, opts?: { ascending?: boolean }) {
    this._orderCol = col;
    this._orderAsc = opts?.ascending ?? true;
    return this;
  }

  range(from: number, to: number) {
    this._rangeFrom = from;
    this._rangeTo = to;
    return this;
  }

  single() {
    this._single = true;
    return this;
  }

  async insert(data: Record<string, unknown> | Record<string, unknown>[]) {
    const rows = Array.isArray(data) ? data : [data];
    const now = new Date().toISOString();
    const table = getTable(this._table);
    const inserted = rows.map(row => ({
      id: uuid(),
      created_at: now,
      updated_at: now,
      ...row,
    }));
    table.push(...inserted);
    this._mutatedData = inserted;
    return this;
  }

  async update(data: Record<string, unknown>) {
    const table = getTable(this._table);
    const updated: Record<string, unknown>[] = [];
    for (const row of table) {
      if (this._filters.every(f => f(row))) {
        Object.assign(row, data);
        updated.push({ ...row });
      }
    }
    this._mutatedData = updated;
    return this;
  }

  private _execute(): { data: Record<string, unknown>[] | null; error: null; count?: number } {
    let data: Record<string, unknown>[];

    if (this._mutatedData !== null) {
      // Return mutated data (apply any remaining filters from .eq() after update)
      data = this._mutatedData.filter(row => this._filters.every(f => f(row)));
    } else {
      data = deepClone(getTable(this._table));
      // Apply filters
      data = data.filter(row => this._filters.every(f => f(row)));
    }

    const totalCount = data.length;

    // Resolve joins
    data = resolveJoins(data, this._joins);

    // Apply ordering
    if (this._orderCol) {
      const col = this._orderCol;
      const asc = this._orderAsc;
      data.sort((a, b) => {
        const va = a[col] ?? '';
        const vb = b[col] ?? '';
        const numA = parseFloat(String(va));
        const numB = parseFloat(String(vb));
        if (!isNaN(numA) && !isNaN(numB)) {
          return asc ? numA - numB : numB - numA;
        }
        return asc ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
      });
    }

    // Apply pagination
    if (this._rangeFrom !== null && this._rangeTo !== null) {
      data = data.slice(this._rangeFrom, this._rangeTo + 1);
    }

    // Handle head request
    if (this._columns === '__head__') {
      return { data: null, error: null, count: totalCount };
    }

    // Handle single
    if (this._single) {
      return { data: (data.length > 0 ? data[0] : null) as unknown as Record<string, unknown>[], error: null };
    }

    return { data, error: null, count: totalCount };
  }

  // Make the builder thenable so it can be awaited
  then<TResult1 = { data: unknown; error: unknown; count?: number }, TResult2 = never>(
    onfulfilled?: ((value: { data: unknown; error: unknown; count?: number }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    try {
      const result = this._execute();
      return Promise.resolve(result).then(onfulfilled, onrejected);
    } catch (err) {
      return Promise.reject(err).then(onfulfilled, onrejected);
    }
  }
}

// ── Mock Auth ────────────────────────────────────────────────
const mockAuth = {
  async getSession() {
    return { data: { session: currentSession } };
  },

  onAuthStateChange(callback: (event: string, session: typeof currentSession) => void) {
    authListeners.push(callback);
    // Fire immediately with current state
    setTimeout(() => callback('INITIAL_SESSION', currentSession), 0);
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            const idx = authListeners.indexOf(callback);
            if (idx >= 0) authListeners.splice(idx, 1);
          },
        },
      },
    };
  },

  async signInWithPassword({ email, password: _password }: { email: string; password: string }) {
    // Accept any password in prototype mode
    const profile = store.profiles.find(p => p.email === email);
    if (!profile) {
      return { data: { user: null, session: null }, error: { message: 'Invalid login credentials', code: '' } };
    }
    currentUser = { id: profile.id as string, email: profile.email as string };
    currentSession = { user: currentUser, access_token: 'mock-token' };
    authListeners.forEach(cb => cb('SIGNED_IN', currentSession));
    return { data: { user: currentUser, session: currentSession }, error: null };
  },

  async signUp({ email, password: _password, options }: { email: string; password: string; options?: { data?: Record<string, unknown> } }) {
    const id = uuid();
    const newProfile = {
      id,
      email,
      full_name: (options?.data?.full_name as string) ?? email,
      role: (options?.data?.role as string) ?? 'staff',
      is_active: true,
      last_login_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    store.profiles.push(newProfile);
    return { data: { user: { id, email }, session: null }, error: null };
  },

  async signOut() {
    currentUser = null;
    currentSession = null;
    authListeners.forEach(cb => cb('SIGNED_OUT', null));
  },
};

// ── Mock Client ──────────────────────────────────────────────
export const mockSupabase = {
  auth: mockAuth,

  from(table: string): MockQueryBuilder {
    return new MockQueryBuilder(table);
  },
};
