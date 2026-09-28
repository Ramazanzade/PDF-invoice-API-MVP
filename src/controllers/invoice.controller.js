import { generateInvoicePdf } from '../services/pdf.service.js';
import { calculateItems, calculateTotals } from '../utils/currency.js';
import { formatDate } from '../utils/date.js';
import { validateInvoice } from '../utils/validate.js';

export async function createInvoice(request, reply) {
  const validation = validateInvoice(request.body);

  if (!validation.success) {
    return reply.status(400).send({
      success: false,
      error: 'Validation failed',
      details: validation.error.flatten().fieldErrors,
    });
  }

  const data = validation.data;
  const lang = data.language;
  const currency = data.currency;

  try {
    const calculatedItems = calculateItems(data.items, currency, lang);

    const totals = calculateTotals(
      calculatedItems,
      data.tax_rate,
      currency,
      lang
    );

    const formattedData = {
      ...data,
      items: calculatedItems,
      ...totals,
      issue_date: formatDate(data.issue_date, lang),
      due_date: data.due_date ? formatDate(data.due_date, lang) : null,
    };

    const pdfBuffer = await generateInvoicePdf(formattedData);

    const format = request.query.format;

    if (format === 'base64') {
      return reply.send({
        success: true,
        filename: `invoice-${data.invoice_number}.pdf`,
        pdf_base64: pdfBuffer.toString('base64'),
      });
    }

    return reply
      .header('Content-Type', 'application/pdf')
      .header(
        'Content-Disposition',
        `attachment; filename="invoice-${data.invoice_number}.pdf"`
      )
      .send(pdfBuffer);
  } catch (err) {
    request.log.error(err);
    return reply.status(500).send({
      success: false,
      error: 'Failed to generate PDF',
      message: err.message,
    });
  }
}