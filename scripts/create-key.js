import 'dotenv/config';
import { createApiKey } from '../src/services/apikey.service.js';
import { pool } from '../src/db.js';
import { PLANS } from '../src/config/plans.js';

const email = process.argv[2];
const plan  = process.argv[3] || 'free';

if (!email) {
  console.error('Usage: node scripts/create-key.js <email> [plan]');
  console.error(`Available plans: ${Object.keys(PLANS).join(', ')}`);
  process.exit(1);
}

if (!(plan in PLANS)) {
  console.error(`Unknown plan "${plan}". Available plans: ${Object.keys(PLANS).join(', ')}`);
  process.exit(1);
}

const { limit, price } = PLANS[plan];

const key = await createApiKey({
  ownerEmail: email,
  plan,
  monthlyLimit: limit,
});

console.log(`Created key for ${email}`);
console.log(`Plan: ${plan} | Limit: ${limit}/mo | Price: $${price}`);
console.log('API Key (save it, shown only once):');
console.log(key);

await pool.end();
process.exit(0);