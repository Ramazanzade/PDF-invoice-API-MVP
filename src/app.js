import Fastify from 'fastify';
import cors from '@fastify/cors';
import invoiceRoutes from './routes/invoices.route.js';
import { getTranslations, getSupportedLanguages, isRTL } from './services/i18n.service.js';
import healthRoutes from './routes/health.js';

const app = Fastify({
  logger: true,
});

await app.register(cors, {
  origin: true,
});

// Routes
await app.register(invoiceRoutes);
await app.register(healthRoutes);   
app.get('/', async () => {
  return {
    message: 'PDF Invoice Generator API',
    version: '1.0.0',
  };
});

// Languages
app.get('/v1/languages', async () => {
  return {
    supported: getSupportedLanguages(),
    rtl: ['ar'],
  };
});

app.get('/v1/translations/:lang', async (request) => {
  const { lang } = request.params;
  return {
    language: lang,
    isRTL: isRTL(lang),
    translations: getTranslations(lang),
  };
});

export default app;