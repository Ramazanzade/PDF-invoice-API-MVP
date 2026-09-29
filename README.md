# PDF Invoice Generator API

Multi-language, RTL-aware PDF invoice generation as a hosted API. Send invoice data as JSON, get back a ready-to-send PDF.

**Base URL:** `https://pdf-invoice-api-mvp.onrender.com`

---

## Features

- 5 languages out of the box: English (`en`), Azerbaijani (`az`), Turkish (`tr`), Russian (`ru`), Arabic (`ar`)
- Full RTL support for Arabic (text direction, layout mirroring)
- Custom label overrides for any language, including ones not built in
- Optional logo embedding (base64, no external URLs — no server-side rendering delays)
- Clean, professional invoice layout out of the box

---

## Authentication

Every request requires an API key in the `Authorization` header:

```
Authorization: Bearer YOUR_API_KEY
```

Requests without a valid key return `401` (missing/malformed header) or `403` (invalid key).

Each key has a monthly quota. Once exceeded, requests return `429` until the quota resets the following month.

**Don't have a key yet?** Contact [your email/contact here] to get one.

---

## Endpoints

### `POST /v1/invoices`

Generates a PDF invoice and returns it as binary data (`Content-Type: application/pdf`).

#### Request body

| Field | Type | Required | Notes |
|---|---|---|---|
| `language` | string | No (default `en`) | One of `en`, `az`, `tr`, `ru`, `ar` |
| `currency` | string | No (default `USD`) | 3-letter ISO code, e.g. `USD`, `EUR`, `AZN` |
| `invoice_number` | string | Yes | |
| `issue_date` | string | Yes | |
| `due_date` | string | No | |
| `seller` | object | Yes | See Party object below |
| `buyer` | object | Yes | See Party object below |
| `items` | array | Yes | At least 1 item, max 100. See Item object below |
| `tax_rate` | number | No (default `0`) | 0–100 |
| `notes` | string | No | Max 2000 characters |
| `logo_base64` | string | No | Data URI, PNG or JPEG only, max ~150KB. Format: `data:image/png;base64,...` |
| `labels` | object | No | Override or add translation labels. Max 30 keys |

**Party object** (`seller` / `buyer`):

| Field | Type | Required |
|---|---|---|
| `name` | string | Yes |
| `address` | string | No |
| `email` | string | No |
| `phone` | string | No |
| `tax_id` | string | No |

**Item object:**

| Field | Type | Required |
|---|---|---|
| `description` | string | Yes |
| `quantity` | number | Yes | must be positive |
| `unit_price` | number | Yes | cannot be negative |
| `tax_rate` | number | No | 0–100, overrides the invoice-level `tax_rate` for this item |

#### Example request

```bash
curl -X POST https://pdf-invoice-api-mvp.onrender.com/v1/invoices \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "language": "en",
    "currency": "USD",
    "invoice_number": "INV-2026-001",
    "issue_date": "2026-09-28",
    "due_date": "2026-10-05",
    "seller": {
      "name": "Acme LLC",
      "address": "123 Main St, Baku",
      "email": "info@acme.com",
      "tax_id": "1234567891"
    },
    "buyer": {
      "name": "Client Co",
      "address": "45 Second St, Baku",
      "email": "billing@client.com"
    },
    "items": [
      { "description": "Website development", "quantity": 1, "unit_price": 1200 },
      { "description": "Hosting (1 year)", "quantity": 1, "unit_price": 150 }
    ],
    "tax_rate": 18,
    "notes": "Payment due within 7 business days."
  }' \
  --output invoice.pdf
```

#### Example: Node.js

```javascript
const response = await fetch("https://pdf-invoice-api-mvp.onrender.com/v1/invoices", {
  method: "POST",
  headers: {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    language: "en",
    currency: "USD",
    invoice_number: "INV-2026-001",
    issue_date: "2026-09-28",
    seller: { name: "Acme LLC", email: "info@acme.com" },
    buyer: { name: "Client Co" },
    items: [
      { description: "Website development", quantity: 1, unit_price: 1200 },
    ],
    tax_rate: 18,
  }),
});

if (!response.ok) {
  const error = await response.json();
  throw new Error(error.message);
}

const pdfBuffer = Buffer.from(await response.arrayBuffer());
require("fs").writeFileSync("invoice.pdf", pdfBuffer);
```

#### Example: Python

```python
import requests

response = requests.post(
    "https://pdf-invoice-api-mvp.onrender.com/v1/invoices",
    headers={"Authorization": "Bearer YOUR_API_KEY"},
    json={
        "language": "en",
        "currency": "USD",
        "invoice_number": "INV-2026-001",
        "issue_date": "2026-09-28",
        "seller": {"name": "Acme LLC", "email": "info@acme.com"},
        "buyer": {"name": "Client Co"},
        "items": [
            {"description": "Website development", "quantity": 1, "unit_price": 1200}
        ],
        "tax_rate": 18,
    },
)

if response.status_code == 200:
    with open("invoice.pdf", "wb") as f:
        f.write(response.content)
else:
    print(response.json())
```

#### Adding a logo

```json
{
  "logo_base64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

Only PNG and JPEG data URIs are accepted. External `logo_url` links are **not** supported — the server blocks outbound network requests during PDF rendering for security reasons.

#### Custom labels (any language, or overriding defaults)

```json
{
  "language": "en",
  "labels": {
    "invoice": "Facture",
    "from": "Vendeur",
    "bill_to": "Acheteur",
    "thank_you": "Merci pour votre collaboration!"
  }
}
```

Any key not part of the standard set is rendered as an extra "additional info" line at the bottom of the invoice.

---

### `GET /v1/languages`

Returns supported languages and which ones use RTL layout.

```bash
curl https://pdf-invoice-api-mvp.onrender.com/v1/languages
```

```json
{ "supported": ["en", "az", "tr", "ru", "ar"], "rtl": ["ar"] }
```

### `GET /v1/health`

Health check, no authentication required.

```bash
curl https://pdf-invoice-api-mvp.onrender.com/v1/health
```

```json
{ "status": "ok" }
```

---

## Errors

All errors return JSON with this shape:

```json
{ "success": false, "error": "ErrorType", "message": "Human-readable description" }
```

| Status | Meaning |
|---|---|
| `400` | Invalid request body (see `message` for the specific field/rule that failed) |
| `401` | Missing or malformed `Authorization` header |
| `403` | API key is invalid or inactive |
| `429` | Rate limit or monthly quota exceeded |
| `500` | Unexpected server error |
| `503` | Server is at capacity, retry shortly |

---

## Rate limits

- **Per-minute:** 10 requests per IP on `/v1/invoices` (returns `429` with a `Retry-After` header)
- **Monthly quota:** set per API key (default: 50 invoices/month on the free tier). Exceeding it returns `429`.

---

## Pricing

| Plan     | Monthly limit | Price     |
|----------|---------------|-----------|
| Free     | 50 invoices   | $0        |
| Starter  | 500 invoices  | $5 / month |
| Growth   | 1 000 invoices| $15 / month |
| Pro      | 5 000 invoices| $25 / month |


### How to upgrade

1. Contact us and tell which plan you want.
2. Pay via **Payoneer** or **Wise** (details will be sent in the reply).
3. After payment is confirmed, your plan is upgraded within a few hours and the new limit becomes active immediately.

There is currently no automatic payment gateway. All upgrades are handled manually.
---

## Support

Questions or issues: [your ramazanov570633@gmail.com]