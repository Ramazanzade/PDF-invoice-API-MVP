import { startVerification, completeVerification } from '../services/verification.service.js';
import { createApiKey } from '../services/apikey.service.js';
import { pool } from '../db.js';

export default async function signupRoutes(fastify) {
  fastify.post('/v1/signup', {
    config: { rateLimit: { max: 3, timeWindow: '1 hour' } },
  }, async (request, reply) => {
    const { email } = request.body || {};

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return reply.status(400).send({ success: false, message: 'Valid email required' });
    }

    const { rows } = await pool.query(`SELECT id FROM api_keys WHERE owner_email = $1`, [email]);
    if (rows.length > 0) {
      return reply.status(409).send({ success: false, message: 'An account already exists for this email' });
    }

    await startVerification(email);
    return reply.send({ success: true, message: 'Check your email to confirm and receive your API key' });
  });

  // Addım 2: linkə basanda açar yaranır
  fastify.get('/v1/verify', async (request, reply) => {
    const { token } = request.query;
    if (!token) return reply.status(400).send('Missing token');

    const email = await completeVerification(token);
    if (!email) return reply.status(400).send('Invalid or expired verification link');

    const key = await createApiKey({ ownerEmail: email, plan: 'free' });

    return reply.type('text/html').send(`
      <h2>Email confirmed!</h2>
      <p>Your API key (save it, shown only once):</p>
      <pre style="background:#eee;padding:12px;font-size:14px;">${key}</pre>
    `);
  });
}