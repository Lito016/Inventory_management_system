import { z } from 'zod';

// Common field schemas
export const emailSchema = z.string().email('Invalid email address');
export const phoneSchema = z.string().optional().refine(
  (val) => !val || /^[+\d\s()-]{7,20}$/.test(val),
  'Invalid phone number'
);
export const requiredString = z.string().min(1, 'This field is required');
export const optionalString = z.string().optional();

// Password policy: 8+ chars, upper, lower, number
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

// Amount validation
export const amountSchema = z
  .string()
  .min(1, 'Amount is required')
  .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, 'Amount must be greater than zero');

// Customer schema
export const customerSchema = z.object({
  name: requiredString.min(2, 'Name must be at least 2 characters'),
  contact_person: optionalString,
  phone: phoneSchema,
  email: z.string().optional().refine((val) => !val || z.string().email().safeParse(val).success, 'Invalid email'),
  address: optionalString,
  type: z.enum(['B2B', 'B2C', 'Both']),
});

// Supplier schema
export const supplierSchema = z.object({
  name: requiredString.min(2, 'Name must be at least 2 characters'),
  contact_person: optionalString,
  phone: phoneSchema,
  email: z.string().optional().refine((val) => !val || z.string().email().safeParse(val).success, 'Invalid email'),
  address: optionalString,
});

// Product schema
export const productSchema = z.object({
  name: requiredString.min(2, 'Name must be at least 2 characters'),
  description: optionalString,
  unit: requiredString,
  category: optionalString,
});

// Payment schema
export const paymentSchema = z.object({
  payment_type: z.enum(['receivable', 'payable']),
  source_id: requiredString,
  amount: amountSchema,
  payment_date: requiredString,
  payment_method: z.enum(['Cash', 'Bank Transfer', 'Check']),
  reference_number: optionalString,
});

// Login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export type CustomerFormData = z.infer<typeof customerSchema>;
export type SupplierFormData = z.infer<typeof supplierSchema>;
export type ProductFormData = z.infer<typeof productSchema>;
export type PaymentFormData = z.infer<typeof paymentSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
