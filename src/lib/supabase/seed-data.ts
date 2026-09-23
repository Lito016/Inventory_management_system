/**
 * Seed data for the mock Supabase client (prototype mode).
 * All amounts are strings to match the Postgres numeric→text view behavior.
 */

const NOW = new Date().toISOString();
const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString();
const daysFromNow = (n: number) => new Date(Date.now() + n * 86400000).toISOString().split('T')[0];
const daysAgoDate = (n: number) => new Date(Date.now() - n * 86400000).toISOString().split('T')[0];

// ── IDs ──────────────────────────────────────────────────────
export const IDS = {
  profiles: ['a1111111-0000-0000-0000-000000000001', 'a1111111-0000-0000-0000-000000000002'],
  customers: [
    'c0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000002',
    'c0000001-0000-0000-0000-000000000003', 'c0000001-0000-0000-0000-000000000004',
    'c0000001-0000-0000-0000-000000000005', 'c0000001-0000-0000-0000-000000000006',
    'c0000001-0000-0000-0000-000000000007', 'c0000001-0000-0000-0000-000000000008',
  ],
  suppliers: [
    's0000001-0000-0000-0000-000000000001', 's0000001-0000-0000-0000-000000000002',
    's0000001-0000-0000-0000-000000000003', 's0000001-0000-0000-0000-000000000004',
    's0000001-0000-0000-0000-000000000005',
  ],
  products: [
    'p0000001-0000-0000-0000-000000000001', 'p0000001-0000-0000-0000-000000000002',
    'p0000001-0000-0000-0000-000000000003', 'p0000001-0000-0000-0000-000000000004',
    'p0000001-0000-0000-0000-000000000005', 'p0000001-0000-0000-0000-000000000006',
    'p0000001-0000-0000-0000-000000000007', 'p0000001-0000-0000-0000-000000000008',
    'p0000001-0000-0000-0000-000000000009', 'p0000001-0000-0000-0000-000000000010',
  ],
};

// ── Profiles ─────────────────────────────────────────────────
export const profiles = [
  { id: IDS.profiles[0], email: 'admin@ims.local', full_name: 'Maria Santos', role: 'admin' as const, is_active: true, last_login_at: daysAgo(1), created_at: daysAgo(90), updated_at: NOW },
  { id: IDS.profiles[1], email: 'staff@ims.local', full_name: 'Juan Cruz', role: 'staff' as const, is_active: true, last_login_at: daysAgo(3), created_at: daysAgo(60), updated_at: NOW },
];

// ── Customers ────────────────────────────────────────────────
export const customers = [
  { id: IDS.customers[0], name: 'Reyes Garments Corp.', contact_person: 'Ana Reyes', phone: '0917-111-0001', email: 'ana@reyesgarments.ph', address: '123 Quezon Ave, Manila', type: 'B2B' as const, is_active: true, created_at: daysAgo(80), updated_at: NOW },
  { id: IDS.customers[1], name: 'Manila Fashion Hub', contact_person: 'Carlo Lim', phone: '0917-111-0002', email: 'carlo@manilafashion.com', address: '45 Ong St, Binondo', type: 'B2B' as const, is_active: true, created_at: daysAgo(75), updated_at: NOW },
  { id: IDS.customers[2], name: 'Batangas Textiles Inc.', contact_person: 'Rita Gonzales', phone: '0918-222-0003', email: 'rita@batangastext.ph', address: '78 Lipa City, Batangas', type: 'B2B' as const, is_active: true, created_at: daysAgo(70), updated_at: NOW },
  { id: IDS.customers[3], name: 'Cebu Wearables Ltd.', contact_person: 'Mark Tan', phone: '0919-333-0004', email: 'mark@cebuwearables.com', address: '12 Osmeña Blvd, Cebu', type: 'B2B' as const, is_active: true, created_at: daysAgo(65), updated_at: NOW },
  { id: IDS.customers[4], name: 'Davao Cloth Trading', contact_person: 'Lina Park', phone: '0920-444-0005', email: 'lina@davaocloth.ph', address: '55 Claveria St, Davao', type: 'Both' as const, is_active: true, created_at: daysAgo(60), updated_at: NOW },
  { id: IDS.customers[5], name: 'Rosalie Boutique', contact_person: 'Rosalie Dimaculangan', phone: '0921-555-0006', email: 'rosalie@boutique.ph', address: '9 GF Rockwell, Makati', type: 'B2C' as const, is_active: true, created_at: daysAgo(50), updated_at: NOW },
  { id: IDS.customers[6], name: 'Jenny Custom Orders', contact_person: 'Jenny Ferrer', phone: '0922-666-0007', email: 'jenny.f@gmail.com', address: '34 Antipolo City', type: 'B2C' as const, is_active: true, created_at: daysAgo(40), updated_at: NOW },
  { id: IDS.customers[7], name: 'Iloilo Fabric World', contact_person: 'Grace Yu', phone: '0923-777-0008', email: 'grace@iloilofabric.com', address: '88 Jaro, Iloilo City', type: 'B2B' as const, is_active: false, created_at: daysAgo(30), updated_at: NOW },
];

// ── Suppliers ────────────────────────────────────────────────
export const suppliers = [
  { id: IDS.suppliers[0], name: 'PhilFabric Mills', contact_person: 'Ben Tan', phone: '0917-800-0001', email: 'ben@philfabric.com', address: 'Km 14 Cainta, Rizal', is_active: true, created_at: daysAgo(90), updated_at: NOW },
  { id: IDS.suppliers[1], name: 'Golden Thread Imports', contact_person: 'Susan Lee', phone: '0918-800-0002', email: 'susan@goldenthread.ph', address: '22 Arranque, Quiapo, Manila', is_active: true, created_at: daysAgo(85), updated_at: NOW },
  { id: IDS.suppliers[2], name: 'Asia Textile Supply', contact_person: 'David Co', phone: '0919-800-0003', email: 'david@asiatextile.com', address: '155 Solis St, Manila', is_active: true, created_at: daysAgo(80), updated_at: NOW },
  { id: IDS.suppliers[3], name: 'Batangas Weaving Co.', contact_person: 'Elena Cruz', phone: '0920-800-0004', email: 'elena@batweaving.ph', address: '42 Bauan, Batangas', is_active: true, created_at: daysAgo(70), updated_at: NOW },
  { id: IDS.suppliers[4], name: 'Manila Dye House', contact_person: 'Tony Lim', phone: '0921-800-0005', email: 'tony@maniladye.com', address: '77 Marikina', is_active: false, created_at: daysAgo(55), updated_at: NOW },
];

// ── Products ─────────────────────────────────────────────────
export const products = [
  { id: IDS.products[0], name: 'Cotton Poplin', description: 'Lightweight plain weave', unit: 'yard', category: 'Cotton', is_active: true, created_at: daysAgo(90), updated_at: NOW },
  { id: IDS.products[1], name: 'Polyester Chiffon', description: 'Sheer lightweight fabric', unit: 'yard', category: 'Polyester', is_active: true, created_at: daysAgo(90), updated_at: NOW },
  { id: IDS.products[2], name: 'Silk Satin', description: 'Smooth glossy finish', unit: 'yard', category: 'Silk', is_active: true, created_at: daysAgo(90), updated_at: NOW },
  { id: IDS.products[3], name: 'Denim 12oz', description: 'Medium weight denim', unit: 'yard', category: 'Denim', is_active: true, created_at: daysAgo(90), updated_at: NOW },
  { id: IDS.products[4], name: 'Linen Blend', description: 'Breathable linen-cotton mix', unit: 'yard', category: 'Linen', is_active: true, created_at: daysAgo(90), updated_at: NOW },
  { id: IDS.products[5], name: 'Organza', description: 'Stiff sheer fabric', unit: 'yard', category: 'Specialty', is_active: true, created_at: daysAgo(90), updated_at: NOW },
  { id: IDS.products[6], name: 'Twill Weave', description: 'Diagonal pattern fabric', unit: 'yard', category: 'Cotton', is_active: true, created_at: daysAgo(90), updated_at: NOW },
  { id: IDS.products[7], name: 'Jersey Knit', description: 'Stretchy knit fabric', unit: 'yard', category: 'Knit', is_active: true, created_at: daysAgo(90), updated_at: NOW },
  { id: IDS.products[8], name: 'Taffeta', description: 'Crisp smooth fabric', unit: 'yard', category: 'Silk', is_active: true, created_at: daysAgo(90), updated_at: NOW },
  { id: IDS.products[9], name: 'Voile', description: 'Soft sheer cotton', unit: 'yard', category: 'Cotton', is_active: true, created_at: daysAgo(90), updated_at: NOW },
];

// ── B2B Pre-Orders ───────────────────────────────────────────
export const b2b_pre_orders = [
  { id: 'po-a001-0000-0000-000000000001', customer_id: IDS.customers[0], order_date: daysAgoDate(30), status: 'Converted' as const, notes: 'Urgent delivery', created_by: IDS.profiles[0], created_at: daysAgo(30), updated_at: daysAgo(25) },
  { id: 'po-a001-0000-0000-000000000002', customer_id: IDS.customers[1], order_date: daysAgoDate(20), status: 'Submitted' as const, notes: null, created_by: IDS.profiles[0], created_at: daysAgo(20), updated_at: daysAgo(18) },
  { id: 'po-a001-0000-0000-000000000003', customer_id: IDS.customers[2], order_date: daysAgoDate(15), status: 'Draft' as const, notes: 'Awaiting confirmation', created_by: IDS.profiles[1], created_at: daysAgo(15), updated_at: daysAgo(15) },
  { id: 'po-a001-0000-0000-000000000004', customer_id: IDS.customers[3], order_date: daysAgoDate(10), status: 'Submitted' as const, notes: null, created_by: IDS.profiles[0], created_at: daysAgo(10), updated_at: daysAgo(8) },
  { id: 'po-a001-0000-0000-000000000005', customer_id: IDS.customers[0], order_date: daysAgoDate(5), status: 'Draft' as const, notes: null, created_by: IDS.profiles[1], created_at: daysAgo(5), updated_at: daysAgo(5) },
  { id: 'po-a001-0000-0000-000000000006', customer_id: IDS.customers[4], order_date: daysAgoDate(45), status: 'Cancelled' as const, notes: 'Customer cancelled', created_by: IDS.profiles[0], created_at: daysAgo(45), updated_at: daysAgo(40) },
];

// ── B2B Pre-Order Items ──────────────────────────────────────
export const b2b_pre_order_items = [
  { id: 'poi-b001-0000-0000-000000000001', pre_order_id: 'po-a001-0000-0000-000000000001', product_id: IDS.products[0], quantity: '100', unit_price: '85.00', created_at: daysAgo(30), updated_at: daysAgo(30) },
  { id: 'poi-b001-0000-0000-000000000002', pre_order_id: 'po-a001-0000-0000-000000000001', product_id: IDS.products[2], quantity: '50', unit_price: '320.00', created_at: daysAgo(30), updated_at: daysAgo(30) },
  { id: 'poi-b001-0000-0000-000000000003', pre_order_id: 'po-a001-0000-0000-000000000002', product_id: IDS.products[1], quantity: '200', unit_price: '55.00', created_at: daysAgo(20), updated_at: daysAgo(20) },
  { id: 'poi-b001-0000-0000-000000000004', pre_order_id: 'po-a001-0000-0000-000000000002', product_id: IDS.products[3], quantity: '80', unit_price: '150.00', created_at: daysAgo(20), updated_at: daysAgo(20) },
  { id: 'poi-b001-0000-0000-000000000005', pre_order_id: 'po-a001-0000-0000-000000000003', product_id: IDS.products[4], quantity: '60', unit_price: '120.00', created_at: daysAgo(15), updated_at: daysAgo(15) },
  { id: 'poi-b001-0000-0000-000000000006', pre_order_id: 'po-a001-0000-0000-000000000004', product_id: IDS.products[6], quantity: '150', unit_price: '95.00', created_at: daysAgo(10), updated_at: daysAgo(10) },
  { id: 'poi-b001-0000-0000-000000000007', pre_order_id: 'po-a001-0000-0000-000000000005', product_id: IDS.products[7], quantity: '90', unit_price: '110.00', created_at: daysAgo(5), updated_at: daysAgo(5) },
];

// ── B2B Purchase Orders ──────────────────────────────────────
export const b2b_purchase_orders = [
  { id: 'purch-0001-0000-0000-000000000001', pre_order_id: null, supplier_id: IDS.suppliers[0], po_number: 'PO-2026-001', order_date: daysAgoDate(28), status: 'Completed' as const, notes: null, created_by: IDS.profiles[0], created_at: daysAgo(28), updated_at: daysAgo(10) },
  { id: 'purch-0001-0000-0000-000000000002', pre_order_id: null, supplier_id: IDS.suppliers[1], po_number: 'PO-2026-002', order_date: daysAgoDate(22), status: 'Fully Received' as const, notes: 'Express shipping', created_by: IDS.profiles[0], created_at: daysAgo(22), updated_at: daysAgo(8) },
  { id: 'purch-0001-0000-0000-000000000003', pre_order_id: null, supplier_id: IDS.suppliers[2], po_number: 'PO-2026-003', order_date: daysAgoDate(14), status: 'Partially Received' as const, notes: null, created_by: IDS.profiles[1], created_at: daysAgo(14), updated_at: daysAgo(3) },
  { id: 'purch-0001-0000-0000-000000000004', pre_order_id: null, supplier_id: IDS.suppliers[0], po_number: 'PO-2026-004', order_date: daysAgoDate(7), status: 'Submitted' as const, notes: null, created_by: IDS.profiles[0], created_at: daysAgo(7), updated_at: daysAgo(6) },
  { id: 'purch-0001-0000-0000-000000000005', pre_order_id: null, supplier_id: IDS.suppliers[3], po_number: 'PO-2026-005', order_date: daysAgoDate(3), status: 'Draft' as const, notes: 'Pending approval', created_by: IDS.profiles[1], created_at: daysAgo(3), updated_at: daysAgo(3) },
  { id: 'purch-0001-0000-0000-000000000006', pre_order_id: null, supplier_id: IDS.suppliers[1], po_number: 'PO-2026-006', order_date: daysAgoDate(40), status: 'Completed' as const, notes: null, created_by: IDS.profiles[0], created_at: daysAgo(40), updated_at: daysAgo(20) },
  { id: 'purch-0001-0000-0000-000000000007', pre_order_id: null, supplier_id: IDS.suppliers[2], po_number: 'PO-2026-007', order_date: daysAgoDate(50), status: 'Completed' as const, notes: null, created_by: IDS.profiles[0], created_at: daysAgo(50), updated_at: daysAgo(30) },
  { id: 'purch-0001-0000-0000-000000000008', pre_order_id: null, supplier_id: IDS.suppliers[4], po_number: 'PO-2026-008', order_date: daysAgoDate(65), status: 'Cancelled' as const, notes: 'Supplier inactive', created_by: IDS.profiles[0], created_at: daysAgo(65), updated_at: daysAgo(55) },
];

// ── B2B PO Items ─────────────────────────────────────────────
export const b2b_po_items = [
  { id: 'poitem-0001-0000-000000000001', po_id: 'purch-0001-0000-0000-000000000001', product_id: IDS.products[0], ordered_qty: '200', unit_price: '75.00', received_qty: '200', created_at: daysAgo(28), updated_at: daysAgo(10) },
  { id: 'poitem-0001-0000-000000000002', po_id: 'purch-0001-0000-0000-000000000001', product_id: IDS.products[1], ordered_qty: '150', unit_price: '45.00', received_qty: '150', created_at: daysAgo(28), updated_at: daysAgo(10) },
  { id: 'poitem-0001-0000-000000000003', po_id: 'purch-0001-0000-0000-000000000002', product_id: IDS.products[2], ordered_qty: '80', unit_price: '290.00', received_qty: '80', created_at: daysAgo(22), updated_at: daysAgo(8) },
  { id: 'poitem-0001-0000-000000000004', po_id: 'purch-0001-0000-0000-000000000003', product_id: IDS.products[3], ordered_qty: '120', unit_price: '135.00', received_qty: '80', created_at: daysAgo(14), updated_at: daysAgo(3) },
  { id: 'poitem-0001-0000-000000000005', po_id: 'purch-0001-0000-0000-000000000003', product_id: IDS.products[4], ordered_qty: '60', unit_price: '105.00', received_qty: '60', created_at: daysAgo(14), updated_at: daysAgo(3) },
  { id: 'poitem-0001-0000-000000000006', po_id: 'purch-0001-0000-0000-000000000004', product_id: IDS.products[5], ordered_qty: '40', unit_price: '180.00', received_qty: '0', created_at: daysAgo(7), updated_at: daysAgo(7) },
];

// ── B2B Receiving Records ────────────────────────────────────
export const b2b_receiving_records = [
  { id: 'recv-0001-0000-0000-000000000001', po_id: 'purch-0001-0000-0000-000000000001', receiving_date: daysAgoDate(10), received_by: IDS.profiles[0], notes: 'All items OK', created_at: daysAgo(10), updated_at: daysAgo(10) },
  { id: 'recv-0001-0000-0000-000000000002', po_id: 'purch-0001-0000-0000-000000000002', receiving_date: daysAgoDate(8), received_by: IDS.profiles[1], notes: null, created_at: daysAgo(8), updated_at: daysAgo(8) },
  { id: 'recv-0001-0000-0000-000000000003', po_id: 'purch-0001-0000-0000-000000000003', receiving_date: daysAgoDate(3), received_by: IDS.profiles[0], notes: 'Partial — 40 yards short on denim', created_at: daysAgo(3), updated_at: daysAgo(3) },
];

// ── B2B Receiving Items ──────────────────────────────────────
export const b2b_receiving_items = [
  { id: 'recvitem-0001-0000-0000000001', receiving_id: 'recv-0001-0000-0000-000000000001', po_item_id: 'poitem-0001-0000-000000000001', received_qty: '200', variance_qty: '0', variance_reason: null, created_at: daysAgo(10), updated_at: daysAgo(10) },
  { id: 'recvitem-0001-0000-0000000002', receiving_id: 'recv-0001-0000-0000-000000000001', po_item_id: 'poitem-0001-0000-000000000002', received_qty: '150', variance_qty: '0', variance_reason: null, created_at: daysAgo(10), updated_at: daysAgo(10) },
  { id: 'recvitem-0001-0000-0000000003', receiving_id: 'recv-0001-0000-0000-000000000002', po_item_id: 'poitem-0001-0000-000000000003', received_qty: '80', variance_qty: '0', variance_reason: null, created_at: daysAgo(8), updated_at: daysAgo(8) },
  { id: 'recvitem-0001-0000-0000000004', receiving_id: 'recv-0001-0000-0000-000000000003', po_item_id: 'poitem-0001-0000-000000000004', received_qty: '80', variance_qty: '40', variance_reason: 'Supplier shortage', created_at: daysAgo(3), updated_at: daysAgo(3) },
  { id: 'recvitem-0001-0000-0000000005', receiving_id: 'recv-0001-0000-0000-000000000003', po_item_id: 'poitem-0001-0000-000000000005', received_qty: '60', variance_qty: '0', variance_reason: null, created_at: daysAgo(3), updated_at: daysAgo(3) },
];

// ── B2B Fulfillments ─────────────────────────────────────────
export const b2b_fulfillments = [
  { id: 'ful-0001-0000-0000-000000000001', customer_id: IDS.customers[0], fulfillment_date: daysAgoDate(20), status: 'Completed' as const, notes: null, created_by: IDS.profiles[0], created_at: daysAgo(20), updated_at: daysAgo(20) },
  { id: 'ful-0001-0000-0000-000000000002', customer_id: IDS.customers[1], fulfillment_date: daysAgoDate(12), status: 'Completed' as const, notes: 'Delivered via LBC', created_by: IDS.profiles[0], created_at: daysAgo(12), updated_at: daysAgo(12) },
  { id: 'ful-0001-0000-0000-000000000003', customer_id: IDS.customers[2], fulfillment_date: daysAgoDate(5), status: 'In Progress' as const, notes: null, created_by: IDS.profiles[1], created_at: daysAgo(5), updated_at: daysAgo(3) },
  { id: 'ful-0001-0000-0000-000000000004', customer_id: IDS.customers[3], fulfillment_date: daysAgoDate(2), status: 'Pending' as const, notes: 'Awaiting stock', created_by: IDS.profiles[0], created_at: daysAgo(2), updated_at: daysAgo(2) },
  { id: 'ful-0001-0000-0000-000000000005', customer_id: IDS.customers[4], fulfillment_date: daysAgoDate(35), status: 'Cancelled' as const, notes: 'Customer request', created_by: IDS.profiles[1], created_at: daysAgo(35), updated_at: daysAgo(30) },
];

// ── B2B Fulfillment Items ────────────────────────────────────
export const b2b_fulfillment_items = [
  { id: 'fulitem-0001-0000-0000000001', fulfillment_id: 'ful-0001-0000-0000-000000000001', product_id: IDS.products[0], quantity: '100', unit_price: '90.00', created_at: daysAgo(20), updated_at: daysAgo(20) },
  { id: 'fulitem-0001-0000-0000000002', fulfillment_id: 'ful-0001-0000-0000-000000000002', product_id: IDS.products[1], quantity: '200', unit_price: '60.00', created_at: daysAgo(12), updated_at: daysAgo(12) },
  { id: 'fulitem-0001-0000-0000000003', fulfillment_id: 'ful-0001-0000-0000-000000000003', product_id: IDS.products[3], quantity: '50', unit_price: '155.00', created_at: daysAgo(5), updated_at: daysAgo(5) },
  { id: 'fulitem-0001-0000-0000000004', fulfillment_id: 'ful-0001-0000-0000-000000000004', product_id: IDS.products[6], quantity: '75', unit_price: '100.00', created_at: daysAgo(2), updated_at: daysAgo(2) },
];

// ── B2C Printing Orders ──────────────────────────────────────
export const b2c_printing_orders = [
  { id: 'prnt-0001-0000-0000-000000000001', customer_id: IDS.customers[5], order_date: daysAgoDate(25), status: 'Paid' as const, total_amount: '4500.00', notes: 'T-shirt printing', production_notes: 'DTF method', pending_at: daysAgo(25), in_production_at: daysAgo(23), completed_at: daysAgo(20), released_at: daysAgo(19), paid_at: daysAgo(18), cancelled_at: null, created_by: IDS.profiles[0], created_at: daysAgo(25), updated_at: daysAgo(18) },
  { id: 'prnt-0001-0000-0000-000000000002', customer_id: IDS.customers[6], order_date: daysAgoDate(18), status: 'In Production' as const, total_amount: '8200.00', notes: 'Banner printing', production_notes: null, pending_at: daysAgo(18), in_production_at: daysAgo(15), completed_at: null, released_at: null, paid_at: null, cancelled_at: null, created_by: IDS.profiles[1], created_at: daysAgo(18), updated_at: daysAgo(15) },
  { id: 'prnt-0001-0000-0000-000000000003', customer_id: IDS.customers[5], order_date: daysAgoDate(10), status: 'Completed' as const, total_amount: '3000.00', notes: 'Tote bag printing', production_notes: 'Screen print', pending_at: daysAgo(10), in_production_at: daysAgo(8), completed_at: daysAgo(5), released_at: null, paid_at: null, cancelled_at: null, created_by: IDS.profiles[0], created_at: daysAgo(10), updated_at: daysAgo(5) },
  { id: 'prnt-0001-0000-0000-000000000004', customer_id: IDS.customers[6], order_date: daysAgoDate(5), status: 'Pending' as const, total_amount: '1500.00', notes: null, production_notes: null, pending_at: daysAgo(5), in_production_at: null, completed_at: null, released_at: null, paid_at: null, cancelled_at: null, created_by: IDS.profiles[1], created_at: daysAgo(5), updated_at: daysAgo(5) },
  { id: 'prnt-0001-0000-0000-000000000005', customer_id: IDS.customers[5], order_date: daysAgoDate(40), status: 'Released' as const, total_amount: '6000.00', notes: 'Uniform printing', production_notes: 'Heat press', pending_at: daysAgo(40), in_production_at: daysAgo(38), completed_at: daysAgo(35), released_at: daysAgo(33), paid_at: null, cancelled_at: null, created_by: IDS.profiles[0], created_at: daysAgo(40), updated_at: daysAgo(33) },
  { id: 'prnt-0001-0000-0000-000000000006', customer_id: IDS.customers[6], order_date: daysAgoDate(50), status: 'Cancelled' as const, total_amount: '2000.00', notes: 'Cancelled by customer', production_notes: null, pending_at: daysAgo(50), in_production_at: null, completed_at: null, released_at: null, paid_at: null, cancelled_at: daysAgo(48), created_by: IDS.profiles[1], created_at: daysAgo(50), updated_at: daysAgo(48) },
];

// ── B2C Order Items ──────────────────────────────────────────
export const b2c_order_items = [
  { id: 'oitm-0001-0000-0000-000000000001', order_id: 'prnt-0001-0000-0000-000000000001', description: 'T-shirt DTF Print', quantity: '50', unit_price: '60.00', total: '3000.00', created_at: daysAgo(25), updated_at: daysAgo(25) },
  { id: 'oitm-0001-0000-0000-000000000002', order_id: 'prnt-0001-0000-0000-000000000001', description: 'T-shirt Design Fee', quantity: '1', unit_price: '1500.00', total: '1500.00', created_at: daysAgo(25), updated_at: daysAgo(25) },
  { id: 'oitm-0001-0000-0000-000000000003', order_id: 'prnt-0001-0000-0000-000000000002', description: 'Vinyl Banner 4x8', quantity: '10', unit_price: '820.00', total: '8200.00', created_at: daysAgo(18), updated_at: daysAgo(18) },
  { id: 'oitm-0001-0000-0000-000000000004', order_id: 'prnt-0001-0000-0000-000000000003', description: 'Canvas Tote Bag', quantity: '30', unit_price: '100.00', total: '3000.00', created_at: daysAgo(10), updated_at: daysAgo(10) },
  { id: 'oitm-0001-0000-0000-000000000005', order_id: 'prnt-0001-0000-0000-000000000004', description: 'ID Lace Printing', quantity: '100', unit_price: '15.00', total: '1500.00', created_at: daysAgo(5), updated_at: daysAgo(5) },
];

// ── Receivables ──────────────────────────────────────────────
export const receivables = [
  { id: 'rec-0001-0000-0000-000000000001', customer_id: IDS.customers[0], source_type: 'B2B' as const, source_id: 'ful-0001-0000-0000-000000000001', amount: '9000.00', due_date: daysFromNow(-10), status: 'Outstanding' as const, notes: 'Reyes Gmt - fulfill 001', created_by: IDS.profiles[0], created_at: daysAgo(20), updated_at: daysAgo(20) },
  { id: 'rec-0001-0000-0000-000000000002', customer_id: IDS.customers[1], source_type: 'B2B' as const, source_id: 'ful-0001-0000-0000-000000000002', amount: '12000.00', due_date: daysFromNow(-5), status: 'Outstanding' as const, notes: 'Manila Fashion - fulfill 002', created_by: IDS.profiles[0], created_at: daysAgo(12), updated_at: daysAgo(12) },
  { id: 'rec-0001-0000-0000-000000000003', customer_id: IDS.customers[2], source_type: 'B2B' as const, source_id: 'ful-0001-0000-0000-000000000003', amount: '7750.00', due_date: daysFromNow(10), status: 'Outstanding' as const, notes: 'Batangas Text - fulfill 003', created_by: IDS.profiles[1], created_at: daysAgo(5), updated_at: daysAgo(5) },
  { id: 'rec-0001-0000-0000-000000000004', customer_id: IDS.customers[0], source_type: 'B2B' as const, source_id: 'ful-0001-0000-0000-000000000005', amount: '6800.00', due_date: daysFromNow(-12), status: 'Partially Paid' as const, notes: 'Reyes Gmt - fulfill 005', created_by: IDS.profiles[0], created_at: daysAgo(25), updated_at: daysAgo(5) },
  { id: 'rec-0001-0000-0000-000000000005', customer_id: IDS.customers[3], source_type: 'B2B' as const, source_id: 'ful-0001-0000-0000-000000000004', amount: '7500.00', due_date: daysFromNow(20), status: 'Outstanding' as const, notes: null, created_by: IDS.profiles[0], created_at: daysAgo(2), updated_at: daysAgo(2) },
  { id: 'rec-0001-0000-0000-000000000006', customer_id: IDS.customers[5], source_type: 'B2C' as const, source_id: 'prnt-0001-0000-0000-000000000001', amount: '4500.00', due_date: daysFromNow(-15), status: 'Fully Paid' as const, notes: 'Printing order paid', created_by: IDS.profiles[0], created_at: daysAgo(25), updated_at: daysAgo(18) },
  { id: 'rec-0001-0000-0000-000000000007', customer_id: IDS.customers[6], source_type: 'B2C' as const, source_id: 'prnt-0001-0000-0000-000000000002', amount: '8200.00', due_date: daysFromNow(5), status: 'Outstanding' as const, notes: null, created_by: IDS.profiles[1], created_at: daysAgo(18), updated_at: daysAgo(18) },
  { id: 'rec-0001-0000-0000-000000000008', customer_id: IDS.customers[5], source_type: 'B2C' as const, source_id: 'prnt-0001-0000-0000-000000000003', amount: '3000.00', due_date: daysFromNow(-3), status: 'Partially Paid' as const, notes: 'Partial payment 1500', created_by: IDS.profiles[0], created_at: daysAgo(10), updated_at: daysAgo(4) },
  { id: 'rec-0001-0000-0000-000000000009', customer_id: IDS.customers[4], source_type: 'B2B' as const, source_id: 'ful-0001-0000-0000-000000000004', amount: '15000.00', due_date: daysFromNow(-20), status: 'Outstanding' as const, notes: 'Davao Cloth - fulfill 004', created_by: IDS.profiles[0], created_at: daysAgo(35), updated_at: daysAgo(35) },
  { id: 'rec-0001-0000-0000-000000000010', customer_id: IDS.customers[0], source_type: 'B2C' as const, source_id: 'prnt-0001-0000-0000-000000000005', amount: '5500.00', due_date: daysFromNow(15), status: 'Fully Paid' as const, notes: 'Reyes - printing 005', created_by: IDS.profiles[1], created_at: daysAgo(40), updated_at: daysAgo(10) },
  { id: 'rec-0001-0000-0000-000000000011', customer_id: IDS.customers[1], source_type: 'B2C' as const, source_id: 'prnt-0001-0000-0000-000000000006', amount: '3200.00', due_date: daysFromNow(-8), status: 'Voided' as const, notes: 'Manila Fashion - printing 006 voided', created_by: IDS.profiles[0], created_at: daysAgo(30), updated_at: daysAgo(25) },
  { id: 'rec-0001-0000-0000-000000000012', customer_id: IDS.customers[2], source_type: 'B2B' as const, source_id: 'ful-0001-0000-0000-000000000003', amount: '18500.00', due_date: daysFromNow(-2), status: 'Partially Paid' as const, notes: 'Batangas Text - fulfill 003 extra', created_by: IDS.profiles[0], created_at: daysAgo(45), updated_at: daysAgo(7) },
];

// ── Payables ─────────────────────────────────────────────────
export const payables = [
  { id: 'pay-0001-0000-0000-000000000001', supplier_id: IDS.suppliers[0], source_type: 'B2B' as const, source_id: 'purch-0001-0000-0000-000000000001', amount: '21750.00', due_date: daysFromNow(-7), status: 'Outstanding' as const, notes: 'PhilFabric PO-001', created_by: IDS.profiles[0], created_at: daysAgo(28), updated_at: daysAgo(28) },
  { id: 'pay-0001-0000-0000-000000000002', supplier_id: IDS.suppliers[1], source_type: 'B2B' as const, source_id: 'purch-0001-0000-0000-000000000002', amount: '23200.00', due_date: daysFromNow(-3), status: 'Partially Paid' as const, notes: 'Golden Thread PO-002', created_by: IDS.profiles[0], created_at: daysAgo(22), updated_at: daysAgo(5) },
  { id: 'pay-0001-0000-0000-000000000003', supplier_id: IDS.suppliers[2], source_type: 'B2B' as const, source_id: 'purch-0001-0000-0000-000000000003', amount: '14700.00', due_date: daysFromNow(10), status: 'Outstanding' as const, notes: 'Asia Textile PO-003', created_by: IDS.profiles[1], created_at: daysAgo(14), updated_at: daysAgo(14) },
  { id: 'pay-0001-0000-0000-000000000004', supplier_id: IDS.suppliers[0], source_type: 'B2B' as const, source_id: 'purch-0001-0000-0000-000000000004', amount: '7200.00', due_date: daysFromNow(20), status: 'Outstanding' as const, notes: null, created_by: IDS.profiles[0], created_at: daysAgo(7), updated_at: daysAgo(7) },
  { id: 'pay-0001-0000-0000-000000000005', supplier_id: IDS.suppliers[3], source_type: 'B2B' as const, source_id: 'purch-0001-0000-0000-000000000005', amount: '8000.00', due_date: daysFromNow(-15), status: 'Fully Paid' as const, notes: 'Batangas Weaving PO-005', created_by: IDS.profiles[0], created_at: daysAgo(50), updated_at: daysAgo(15) },
  { id: 'pay-0001-0000-0000-000000000006', supplier_id: IDS.suppliers[1], source_type: 'B2B' as const, source_id: 'purch-0001-0000-0000-000000000006', amount: '5500.00', due_date: daysFromNow(-1), status: 'Outstanding' as const, notes: 'Golden Thread PO-006', created_by: IDS.profiles[1], created_at: daysAgo(30), updated_at: daysAgo(30) },
  { id: 'pay-0001-0000-0000-000000000007', supplier_id: IDS.suppliers[2], source_type: 'B2B' as const, source_id: 'purch-0001-0000-0000-000000000007', amount: '11000.00', due_date: daysFromNow(5), status: 'Partially Paid' as const, notes: 'Asia Textile PO-007', created_by: IDS.profiles[0], created_at: daysAgo(35), updated_at: daysAgo(10) },
  { id: 'pay-0001-0000-0000-000000000008', supplier_id: IDS.suppliers[4], source_type: 'B2B' as const, source_id: 'purch-0001-0000-0000-000000000008', amount: '4200.00', due_date: daysFromNow(-25), status: 'Voided' as const, notes: 'Manila Dye PO-008 — supplier inactive', created_by: IDS.profiles[0], created_at: daysAgo(60), updated_at: daysAgo(25) },
];

// ── Payments ─────────────────────────────────────────────────
export const payments = [
  { id: 'pmt-0001-0000-0000-000000000001', payment_type: 'receivable' as const, source_id: 'rec-0001-0000-0000-000000000006', amount: '4500.00', payment_date: daysAgoDate(18), payment_method: 'Bank Transfer' as const, reference_number: 'TXN-20260101', is_voided: false, void_reason: null, voided_by: null, voided_at: null, recorded_by: IDS.profiles[0], created_at: daysAgo(18), updated_at: daysAgo(18) },
  { id: 'pmt-0001-0000-0000-000000000002', payment_type: 'receivable' as const, source_id: 'rec-0001-0000-0000-000000000004', amount: '5000.00', payment_date: daysAgoDate(5), payment_method: 'Cash' as const, reference_number: 'RCPT-0201', is_voided: false, void_reason: null, voided_by: null, voided_at: null, recorded_by: IDS.profiles[0], created_at: daysAgo(5), updated_at: daysAgo(5) },
  { id: 'pmt-0001-0000-0000-000000000003', payment_type: 'receivable' as const, source_id: 'rec-0001-0000-0000-000000000010', amount: '5500.00', payment_date: daysAgoDate(10), payment_method: 'Check' as const, reference_number: 'CHK-0045', is_voided: false, void_reason: null, voided_by: null, voided_at: null, recorded_by: IDS.profiles[1], created_at: daysAgo(10), updated_at: daysAgo(10) },
  { id: 'pmt-0001-0000-0000-000000000004', payment_type: 'receivable' as const, source_id: 'rec-0001-0000-0000-000000000008', amount: '1500.00', payment_date: daysAgoDate(4), payment_method: 'Cash' as const, reference_number: 'RCPT-0202', is_voided: false, void_reason: null, voided_by: null, voided_at: null, recorded_by: IDS.profiles[0], created_at: daysAgo(4), updated_at: daysAgo(4) },
  { id: 'pmt-0001-0000-0000-000000000005', payment_type: 'payable' as const, source_id: 'pay-0001-0000-0000-000000000005', amount: '8000.00', payment_date: daysAgoDate(15), payment_method: 'Bank Transfer' as const, reference_number: 'TXN-20260201', is_voided: false, void_reason: null, voided_by: null, voided_at: null, recorded_by: IDS.profiles[0], created_at: daysAgo(15), updated_at: daysAgo(15) },
  { id: 'pmt-0001-0000-0000-000000000006', payment_type: 'payable' as const, source_id: 'pay-0001-0000-0000-000000000002', amount: '10000.00', payment_date: daysAgoDate(5), payment_method: 'Bank Transfer' as const, reference_number: 'TXN-20260301', is_voided: false, void_reason: null, voided_by: null, voided_at: null, recorded_by: IDS.profiles[0], created_at: daysAgo(5), updated_at: daysAgo(5) },
  { id: 'pmt-0001-0000-0000-000000000007', payment_type: 'payable' as const, source_id: 'pay-0001-0000-0000-000000000007', amount: '5000.00', payment_date: daysAgoDate(10), payment_method: 'Check' as const, reference_number: 'CHK-0046', is_voided: false, void_reason: null, voided_by: null, voided_at: null, recorded_by: IDS.profiles[1], created_at: daysAgo(10), updated_at: daysAgo(10) },
  { id: 'pmt-0001-0000-0000-000000000008', payment_type: 'receivable' as const, source_id: 'rec-0001-0000-0000-000000000012', amount: '10000.00', payment_date: daysAgoDate(7), payment_method: 'Bank Transfer' as const, reference_number: 'TXN-20260401', is_voided: false, void_reason: null, voided_by: null, voided_at: null, recorded_by: IDS.profiles[0], created_at: daysAgo(7), updated_at: daysAgo(7) },
  { id: 'pmt-0001-0000-0000-000000000009', payment_type: 'receivable' as const, source_id: 'rec-0001-0000-0000-000000000001', amount: '2000.00', payment_date: daysAgoDate(12), payment_method: 'Cash' as const, reference_number: null, is_voided: true, void_reason: 'Wrong entry', voided_by: IDS.profiles[0], voided_at: daysAgo(11), recorded_by: IDS.profiles[0], created_at: daysAgo(12), updated_at: daysAgo(11) },
  { id: 'pmt-0001-0000-0000-000000000010', payment_type: 'payable' as const, source_id: 'pay-0001-0000-0000-000000000001', amount: '5000.00', payment_date: daysAgoDate(2), payment_method: 'Cash' as const, reference_number: 'RCPT-0301', is_voided: false, void_reason: null, voided_by: null, voided_at: null, recorded_by: IDS.profiles[1], created_at: daysAgo(2), updated_at: daysAgo(2) },
];

// ── Historical Debts ─────────────────────────────────────────
export const historical_debts = [
  { id: 'hdeb-0001-0000-0000-000000000001', entity_type: 'customer' as const, entity_id: IDS.customers[0], amount: '25000.00', debt_date: '2024-06-15', source: 'Legacy system migration', description: 'Outstanding balance from old accounting', verification_status: 'Verified' as const, adjusted_amount: null, adjustment_reason: null, write_off_reason: null, created_by: IDS.profiles[0], created_at: daysAgo(200), updated_at: daysAgo(180) },
  { id: 'hdeb-0001-0000-0000-000000000002', entity_type: 'supplier' as const, entity_id: IDS.suppliers[4], amount: '8500.00', debt_date: '2024-03-10', source: 'Manual record', description: 'Unpaid invoice from 2024', verification_status: 'Pending' as const, adjusted_amount: null, adjustment_reason: null, write_off_reason: null, created_by: IDS.profiles[0], created_at: daysAgo(300), updated_at: daysAgo(300) },
  { id: 'hdeb-0001-0000-0000-000000000003', entity_type: 'customer' as const, entity_id: IDS.customers[7], amount: '12000.00', debt_date: '2025-01-20', source: 'Audit finding', description: 'Disputed amount', verification_status: 'Disputed' as const, adjusted_amount: '10000.00', adjustment_reason: 'Partial verification', write_off_reason: null, created_by: IDS.profiles[1], created_at: daysAgo(120), updated_at: daysAgo(90) },
];

// ── Inventory Movements ──────────────────────────────────────
export const inventory_movements = [
  { id: 'mov-0001-0000-0000-000000000001', product_id: IDS.products[0], movement_type: 'received' as const, quantity: '200', reference_type: 'receiving' as const, reference_id: 'recv-0001-0000-0000-000000000001', notes: null, created_by: IDS.profiles[0], movement_date: daysAgoDate(10), created_at: daysAgo(10) },
  { id: 'mov-0001-0000-0000-000000000002', product_id: IDS.products[1], movement_type: 'received' as const, quantity: '150', reference_type: 'receiving' as const, reference_id: 'recv-0001-0000-0000-000000000001', notes: null, created_by: IDS.profiles[0], movement_date: daysAgoDate(10), created_at: daysAgo(10) },
  { id: 'mov-0001-0000-0000-000000000003', product_id: IDS.products[2], movement_type: 'received' as const, quantity: '80', reference_type: 'receiving' as const, reference_id: 'recv-0001-0000-0000-000000000002', notes: null, created_by: IDS.profiles[1], movement_date: daysAgoDate(8), created_at: daysAgo(8) },
  { id: 'mov-0001-0000-0000-000000000004', product_id: IDS.products[0], movement_type: 'released' as const, quantity: '100', reference_type: 'fulfillment' as const, reference_id: 'ful-0001-0000-0000-000000000001', notes: null, created_by: IDS.profiles[0], movement_date: daysAgoDate(20), created_at: daysAgo(20) },
  { id: 'mov-0001-0000-0000-000000000005', product_id: IDS.products[1], movement_type: 'released' as const, quantity: '200', reference_type: 'fulfillment' as const, reference_id: 'ful-0001-0000-0000-000000000002', notes: null, created_by: IDS.profiles[0], movement_date: daysAgoDate(12), created_at: daysAgo(12) },
  { id: 'mov-0001-0000-0000-000000000006', product_id: IDS.products[3], movement_type: 'received' as const, quantity: '80', reference_type: 'receiving' as const, reference_id: 'recv-0001-0000-0000-000000000003', notes: 'Partial receiving', created_by: IDS.profiles[0], movement_date: daysAgoDate(3), created_at: daysAgo(3) },
  { id: 'mov-0001-0000-0000-000000000007', product_id: IDS.products[4], movement_type: 'received' as const, quantity: '60', reference_type: 'receiving' as const, reference_id: 'recv-0001-0000-0000-000000000003', notes: null, created_by: IDS.profiles[0], movement_date: daysAgoDate(3), created_at: daysAgo(3) },
  { id: 'mov-0001-0000-0000-000000000008', product_id: IDS.products[3], movement_type: 'released' as const, quantity: '50', reference_type: 'fulfillment' as const, reference_id: 'ful-0001-0000-0000-000000000003', notes: null, created_by: IDS.profiles[1], movement_date: daysAgoDate(5), created_at: daysAgo(5) },
  { id: 'mov-0001-0000-0000-000000000009', product_id: IDS.products[7], movement_type: 'adjustment' as const, quantity: '-5', reference_type: 'adjustment' as const, reference_id: null, notes: 'Damaged goods write-off', created_by: IDS.profiles[0], movement_date: daysAgoDate(1), created_at: daysAgo(1) },
  { id: 'mov-0001-0000-0000-000000000010', product_id: IDS.products[5], movement_type: 'adjustment' as const, quantity: '10', reference_type: 'adjustment' as const, reference_id: null, notes: 'Inventory count correction', created_by: IDS.profiles[0], movement_date: daysAgoDate(2), created_at: daysAgo(2) },
];

// ── Computed Views ───────────────────────────────────────────

const customerMap = Object.fromEntries(customers.map(c => [c.id, c.name]));
const supplierMap = Object.fromEntries(suppliers.map(s => [s.id, s.name]));

function isOverdue(dueDate: string, status: string) {
  if (!['Outstanding', 'Partially Paid'].includes(status)) return false;
  return new Date(dueDate) < new Date(new Date().toISOString().split('T')[0]);
}

function paidAmount(sourceId: string, type: 'receivable' | 'payable') {
  return payments
    .filter(p => p.source_id === sourceId && p.payment_type === type && !p.is_voided)
    .reduce((sum, p) => sum + parseFloat(p.amount), 0);
}

export const v_receivables = receivables.map(r => {
  const paid = paidAmount(r.id, 'receivable');
  const outstanding = Math.max(0, parseFloat(r.amount) - paid);
  return {
    ...r,
    customer_name: customerMap[r.customer_id] ?? 'Unknown',
    outstanding_balance: outstanding.toFixed(2),
    is_overdue: isOverdue(r.due_date, r.status),
  };
});

export const v_payables = payables.map(p => {
  const paid = paidAmount(p.id, 'payable');
  const outstanding = Math.max(0, parseFloat(p.amount) - paid);
  return {
    ...p,
    supplier_name: supplierMap[p.supplier_id] ?? 'Unknown',
    outstanding_balance: outstanding.toFixed(2),
    is_overdue: isOverdue(p.due_date, p.status),
  };
});

export const v_inventory_summary = products.map(prod => {
  const movs = inventory_movements.filter(m => m.product_id === prod.id);
  const received = movs.filter(m => m.movement_type === 'received').reduce((s, m) => s + parseFloat(m.quantity), 0);
  const released = movs.filter(m => m.movement_type === 'released').reduce((s, m) => s + parseFloat(m.quantity), 0);
  const adjustments = movs.filter(m => m.movement_type === 'adjustment').reduce((s, m) => s + parseFloat(m.quantity), 0);
  return {
    product_id: prod.id,
    name: prod.name,
    unit: prod.unit,
    category: prod.category,
    is_active: prod.is_active,
    total_received: received.toString(),
    total_released: released.toString(),
    total_adjustments: adjustments.toString(),
    current_quantity: (received - released + adjustments).toString(),
  };
});

export const v_customer_outstanding = customers.map(c => {
  const recOutstanding = v_receivables
    .filter(r => r.customer_id === c.id && ['Outstanding', 'Partially Paid'].includes(r.status))
    .reduce((s, r) => s + parseFloat(r.outstanding_balance), 0);
  const histOutstanding = historical_debts
    .filter(d => d.entity_type === 'customer' && d.entity_id === c.id && (d.verification_status as string) !== 'Written Off')
    .reduce((s, d) => s + parseFloat(d.adjusted_amount ?? d.amount), 0);
  return {
    customer_id: c.id,
    customer_name: c.name,
    receivable_outstanding: recOutstanding.toFixed(2),
    historical_debt_outstanding: histOutstanding.toFixed(2),
    total_outstanding: (recOutstanding + histOutstanding).toFixed(2),
  };
});

export const v_supplier_outstanding = suppliers.map(s => {
  const payOutstanding = v_payables
    .filter(p => p.supplier_id === s.id && ['Outstanding', 'Partially Paid'].includes(p.status))
    .reduce((sum, p) => sum + parseFloat(p.outstanding_balance), 0);
  const histOutstanding = historical_debts
    .filter(d => d.entity_type === 'supplier' && d.entity_id === s.id && (d.verification_status as string) !== 'Written Off')
    .reduce((sum, d) => sum + parseFloat(d.adjusted_amount ?? d.amount), 0);
  return {
    supplier_id: s.id,
    supplier_name: s.name,
    payable_outstanding: payOutstanding.toFixed(2),
    historical_debt_outstanding: histOutstanding.toFixed(2),
    total_outstanding: (payOutstanding + histOutstanding).toFixed(2),
  };
});
