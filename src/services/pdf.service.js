import { chromium } from 'playwright';
import { renderInvoiceHtml } from './template.service.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let browser = null;

async function getBrowser() {
  if (!browser) {
    browser = await chromium.launch({
      channel: 'msedge',
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
      // Windows-da bəzən lazım olur
      ignoreDefaultArgs: ['--disable-extensions'],
    });
  }
  return browser;
}

export async function generateInvoicePdf(data) {
  const html = renderInvoiceHtml(data);

  const browserInstance = await getBrowser();
  const page = await browserInstance.newPage();

  try {
    await page.setContent(html, {
      waitUntil: 'networkidle',
    });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm',
      },
    });

    return pdfBuffer;
  } finally {
    await page.close();
  }
}

export async function closeBrowser() {
  if (browser) {
    await browser.close();
    browser = null;
  }
}