import { createInvoice } from '../controllers/invoice.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

export default async function invoiceRoutes(fastify) {
  fastify.post(
    '/v1/invoices',
    {
      config: {
        rateLimit: {
          max: 10,
          timeWindow: '1 minute',
        },
      },
      preHandler: authMiddleware,
    },
    createInvoice
  );
}