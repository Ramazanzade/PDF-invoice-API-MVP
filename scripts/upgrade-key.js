import 'dotenv/config';
import { pool } from '../src/db.js';

import { PLANS } from '../src/config/plans.js';
const limit = PLANS[plan].limit;


const email = process.argv[2];
const plan = process.argv[3];

if (!email || !plan) {
  console.error('Usage: node scripts/upgrade-key.js email@example.com <plan>');
  console.error(`Available plans: ${Object.keys(PLANS).join(', ')}`);
  process.exit(1);
}

if (!(plan in PLANS)) {
  console.error(`Unknown plan "${plan}". Available plans: ${Object.keys(PLANS).join(', ')}`);
  process.exit(1);
}


const { rowCount } = await pool.query(
  `UPDATE api_keys SET plan = $1, monthly_limit = $2 WHERE owner_email = $3`,
  [plan, limit, email]
);

if (rowCount === 0) {
  console.error(`No API key found for email: ${email}`);
} else {
console.log(`${email} -> plan: ${plan}, limit: ${limit}, price: $${PLANS[plan].price}/mo`);}

await pool.end();
process.exit(0);