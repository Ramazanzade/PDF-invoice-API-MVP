export default async function healthRoutes(app) {
  app.get('/v1/health', async () => ({ status: 'ok' }));
}