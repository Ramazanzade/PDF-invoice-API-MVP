import { z } from 'zod';

const partySchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  address: z.string().max(500).optional(),
  email: z.string().email().max(200).optional().or(z.literal('')),
  phone: z.string().max(50).optional(),
  tax_id: z.string().max(50).optional(),
});

const itemSchema = z.object({
  description: z.string().min(1, 'Description is required').max(500),
  quantity: z.number().positive('Quantity must be positive'),
  unit_price: z.number().min(0, 'Unit price cannot be negative'),
  tax_rate: z.number().min(0).max(100).optional(),
});

export const invoiceSchema = z.object({
  language: z.enum(['en', 'az', 'tr', 'ru', 'ar']).default('en'),
  currency: z.string().length(3).default('USD'),
  invoice_number: z.string().min(1, 'Invoice number is required').max(100),
  issue_date: z.string().min(1, 'Issue date is required').max(50),
  due_date: z.string().max(50).optional(),
  seller: partySchema,
  buyer: partySchema,
  items: z.array(itemSchema).min(1, 'At least one item is required').max(100),
  tax_rate: z.number().min(0).max(100).default(0),
  notes: z.string().max(2000).optional(),
  logo_base64: z
    .string()
    .max(200_000)
    .regex(
      /^data:image\/(png|jpeg);base64,[A-Za-z0-9+/=]+$/,
      'Logo must be a PNG or JPEG data URI'
    )
    .optional(),
  labels: z
    .record(z.string().max(100), z.string().max(300))
    .refine((obj) => Object.keys(obj).length <= 30, 'Too many labels (max 30)')
    .optional(),
});

export function validateInvoice(data) {
  return invoiceSchema.safeParse(data);
}