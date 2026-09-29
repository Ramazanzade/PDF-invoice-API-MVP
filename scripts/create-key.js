import 'dotenv/config';
import { createApiKey } from '../src/services/apikey.service.js';
import { pool } from '../src/db.js';
import { PLANS } from '../src/config/plans.js';

const PLANS = {
  free: 50,
  starter: 500,
  growth: 1000,
  pro: 5000,
};

const email = process.argv[2];
const plan = process.argv[3] || 'free';

if (!email) {
  console.error('Usage: node scripts/create-key.js email@example.com [plan]');
  console.error(`Available plans: ${Object.keys(PLANS).join(', ')}`);
  process.exit(1);
}

if (!(plan in PLANS)) {
  console.error(`Unknown plan "${plan}". Available plans: ${Object.keys(PLANS).join(', ')}`);
  process.exit(1);
}

const key = await createApiKey({ ownerEmail: email, plan, monthlyLimit: PLANS[plan].limit });
console.log(`Plan: ${plan}, monthly limit: ${PLANS[plan].limit}, price: $${PLANS[plan].price}/mo`);
console.log('New API key (shown once, save it):');
console.log(key);
console.log(`Plan: ${plan}, monthly limit: ${PLANS[plan]}`);

await pool.end();
process.exit(0);