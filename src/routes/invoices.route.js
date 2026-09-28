import { createInvoice } from '../controllers/invoice.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
export default async function invoiceRoutes(fastify) {
  fastify.post('/v1/invoices', {
    preHandler: authMiddleware,
  }, createInvoice);
}