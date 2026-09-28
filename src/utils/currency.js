
export function formatCurrency(amount, currency = 'USD', language = 'en') {
  try {
    return new Intl.NumberFormat(language, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (err) {
    // Fallback
    return `${currency} ${Number(amount).toFixed(2)}`;
  }
}


export function calculateItems(items = [], currency = 'USD', language = 'en') {
  return items.map((item) => {
    const quantity = Number(item.quantity) || 0;
    const unitPrice = Number(item.unit_price) || 0;
    const amount = quantity * unitPrice;

    return {
      ...item,
      quantity,
      unit_price: unitPrice,
      amount,
      unit_price_formatted: formatCurrency(unitPrice, currency, language),
      amount_formatted: formatCurrency(amount, currency, language),
    };
  });
}


export function calculateTotals(items = [], taxRate = 0, currency = 'USD', language = 'en') {
  const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
  const taxAmount = subtotal * (Number(taxRate) / 100);
  const total = subtotal + taxAmount;

  return {
    subtotal,
    tax_rate: Number(taxRate) || 0,
    tax_amount: taxAmount,
    total,
    subtotal_formatted: formatCurrency(subtotal, currency, language),
    tax_amount_formatted: formatCurrency(taxAmount, currency, language),
    total_formatted: formatCurrency(total, currency, language),
  };
}