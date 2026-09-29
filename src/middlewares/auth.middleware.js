import { verifyApiKey } from '../services/apikey.service.js';

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
    return reply.status(429).send({
      success: false,
      error: 'Quota exceeded',
      message: 'Monthly invoice quota exceeded for this API key',
    });
  }

  request.apiKeyPlan = result.plan;
}