export default async function healthRoutes(app) {
  app.get(
    '/v1/health',
    { config: { rateLimit: false } },
    async () => ({ status: 'ok' })
  );
}