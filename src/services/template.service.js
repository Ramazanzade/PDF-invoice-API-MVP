import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Handlebars from 'handlebars';
import { getTranslations, isRTL } from './i18n.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const templateSource = readFileSync(
  join(__dirname, '..', 'templates', 'invoice.hbs'),
  'utf-8'
);

const template = Handlebars.compile(templateSource);

const STANDARD_KEYS = new Set([
  'invoice', 'invoice_number', 'date', 'due_date',
  'from', 'bill_to', 'description', 'quantity',
  'unit_price', 'amount', 'subtotal', 'tax',
  'total', 'notes', 'thank_you', 'page', 'of'
]);

export function renderInvoiceHtml(data) {
  const lang = data.language || 'en';
  const standardTranslations = getTranslations(lang);
  const customLabels = data.labels || {};

  const t = {
    ...standardTranslations,
    ...customLabels,
  };

  const extraLabels = Object.entries(customLabels)
    .filter(([key]) => !STANDARD_KEYS.has(key))
    .map(([key, value]) => ({ key, value }));

  const context = {
    ...data,
    t,
    language: lang,
    isRTL: isRTL(lang),
    extraLabels, 
  };

  return template(context);
}