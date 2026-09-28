import { config } from '../config/index.js';

export async function authMiddleware(request, reply) {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({
      success: false,
      error: 'Unauthorized',
      message: 'Missing or invalid Authorization header. Use: Bearer YOUR_API_KEY',
    });
  }

  const apiKey = authHeader.slice(7); 

  if (apiKey !== config.apiKey) {
    return reply.status(403).send({
      success: false,
      error: 'Forbidden',
      message: 'Invalid API key',
    });
  }

}