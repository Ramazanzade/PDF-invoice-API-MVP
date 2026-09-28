import { chromium } from 'playwright';
import { renderInvoiceHtml } from './template.service.js';

const MAX_CONCURRENT = Number(process.env.PDF_CONCURRENCY) || 2;
const MAX_QUEUE = Number(process.env.PDF_MAX_QUEUE) || 20;
const PAGE_TIMEOUT_MS = 15000;

let browserPromise = null;

function getBrowser() {
  if (!browserPromise) {
    browserPromise = chromium
      .launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ],
      })
      .then((b) => {
        b.on('disconnected', () => {
          browserPromise = null;
        });
        return b;
      })
      .catch((err) => {
        browserPromise = null;
        throw err;
      });
  }
  return browserPromise;
}

let active = 0;
const queue = [];

function acquire() {
  return new Promise((resolve, reject) => {
    if (active < MAX_CONCURRENT) {
      active++;
      return resolve();
    }
    if (queue.length >= MAX_QUEUE) {
      const err = new Error('Server is busy, try again later');
      err.statusCode = 503;
      return reject(err);
    }
    queue.push(resolve);
  });
}

function release() {
  const next = queue.shift();
  if (next) next();
  else active--;
}

export async function generateInvoicePdf(data) {
  const html = renderInvoiceHtml(data);

  await acquire();
  let context;
  try {
    const browser = await getBrowser();

    context = await browser.newContext({ javaScriptEnabled: false });
    context.setDefaultTimeout(PAGE_TIMEOUT_MS);

    await context.route('**/*', (route) => {
      const url = route.request().url();
      return url.startsWith('data:') ? route.continue() : route.abort();
    });

    const page = await context.newPage();
    await page.setContent(html, { waitUntil: 'load' });

    return await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
    });
  } finally {
    if (context) await context.close().catch(() => {});
    release();
  }
}

export async function closeBrowser() {
  if (browserPromise) {
    const b = await browserPromise.catch(() => null);
    browserPromise = null;
    if (b) await b.close();
  }
}