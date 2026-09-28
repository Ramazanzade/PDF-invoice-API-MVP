import { z } from 'zod';

const partySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  address: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  tax_id: z.string().optional(),
});

const itemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().positive('Quantity must be positive'),
  unit_price: z.number().min(0, 'Unit price cannot be negative'),
  tax_rate: z.number().min(0).max(100).optional(),
});

export const invoiceSchema = z.object({
  language: z.enum(['en', 'az', 'tr', 'ru', 'ar']).default('en'),
  currency: z.string().length(3).default('USD'),
  invoice_number: z.string().min(1, 'Invoice number is required'),
  issue_date: z.string().min(1, 'Issue date is required'),
  due_date: z.string().optional(),
  seller: partySchema,
  buyer: partySchema,
  items: z.array(itemSchema).min(1, 'At least one item is required'),
  tax_rate: z.number().min(0).max(100).default(0),
  notes: z.string().optional(),
  logo_url: z.string().url().optional().or(z.literal('')),
  labels: z.record(z.string()).optional(),
});

export function validateInvoice(data) {
  return invoiceSchema.safeParse(data);
}