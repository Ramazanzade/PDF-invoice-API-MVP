import { verifyApiKey } from '../services/apikey.service.js';
import { PLANS } from '../config/plans.js';

export async function authMiddleware(request, reply) {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({
      success: false,
      error: 'Unauthorized',
      message: 'Missing or invalid Authorization header. Use: Bearer YOUR_API_KEY',
    });
  }

  const apiKey = authHeader.slice(7).trim();
  const result = await verifyApiKey(apiKey);

  if (!result) {
    return reply.status(403).send({
      success: false,
      error: 'Forbidden',
      message: 'Invalid API key',
    });
  }

  if (result.exceeded) {
 const nextPlanEntry = Object.entries(PLANS).find(
      ([, p]) => p.limit > result.limit
    );
    const nextPlan = nextPlanEntry?.[0];
    const contact = '[ramazanov570633@gmail.com]';  

    const message = nextPlan
      ? `Monthly limit reached for the "${result.plan}" plan (${result.limit} invoices). Upgrade to "${nextPlan}" ($${PLANS[nextPlan].price}/mo) — contact ${contact}`
      : `Monthly limit reached for the "${result.plan}" plan (${result.limit} invoices). Contact ${contact} for a custom plan.`;

    return reply.status(429).send({
      success: false,
      error: 'Quota exceeded',
      message,
    });
  }

  request.apiKeyPlan = result.plan;
}