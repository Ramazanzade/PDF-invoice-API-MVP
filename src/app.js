import Fastify from 'fastify';
import cors from '@fastify/cors';
import invoiceRoutes from './routes/invoices.route.js';
import { getTranslations, getSupportedLanguages, isRTL } from './services/i18n.service.js';
import healthRoutes from './routes/health.js';
import rateLimit from '@fastify/rate-limit';
//import signupRoutes from './routes/signup.route.js';

const app = Fastify({
  logger: true,
   trustProxy: true, 
  bodyLimit: 512 * 1024, 
});
//await app.register(signupRoutes);
await app.register(cors, {
  origin: true,
});
await app.register(rateLimit, {
  global: true,
  max: 60, 
  timeWindow: '1 minute',
});

await app.register(invoiceRoutes);
await app.register(healthRoutes);   
app.get('/', async () => {
  return {
    message: 'PDF Invoice Generator API',
    version: '1.0.0',
  };
});

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