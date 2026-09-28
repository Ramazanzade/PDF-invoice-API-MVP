import app from './app.js';
import { config } from './config/index.js';
import { closeBrowser } from './services/pdf.service.js';

const start = async () => {
  try {
    await app.listen({ port: Number(process.env.PORT) || 3000, host: '0.0.0.0'  });
    console.log(`🚀 Invoice API running on http://localhost:${config.port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down...');
  await closeBrowser();
  process.exit(0);
});

for (const sig of ['SIGTERM', 'SIGINT']) {
  process.on(sig, async () => {
    await app.close();
    await closeBrowser();
    process.exit(0);
  });
}

start();