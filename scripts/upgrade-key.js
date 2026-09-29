import 'dotenv/config';
import { pool } from '../src/db.js';
import { PLANS } from '../src/config/plans.js';

const email  = process.argv[2];
const plan   = process.argv[3];
const amount = process.argv[4] ? Number(process.argv[4]) : null;
const method = process.argv[5] || null;   // payoneer | wise | other
const note   = process.argv[6] || null;

if (!email || !plan) {
  console.error('Usage: node scripts/upgrade-key.js <email> <plan> [amount_usd] [method] [note]');
  console.error(`Available plans: ${Object.keys(PLANS).join(', ')}`);
  process.exit(1);
}

if (!(plan in PLANS)) {
  console.error(`Unknown plan "${plan}". Available plans: ${Object.keys(PLANS).join(', ')}`);
  process.exit(1);
}

const limit = PLANS[plan].limit;
const price = amount ?? PLANS[plan].price;

// 1. Mövcud açarı və planı götür
const { rows } = await pool.query(
  `SELECT id, plan FROM api_keys WHERE owner_email = $1`,
  [email]
);

if (rows.length === 0) {
  console.error(`No API key found for email: ${email}`);
  await pool.end();
  process.exit(1);
}

const key = rows[0];
const planFrom = key.plan;

const { rowCount } = await pool.query(
  `UPDATE api_keys SET plan = $1, monthly_limit = $2 WHERE id = $3`,
  [plan, limit, key.id]
);

if (rowCount === 0) {
  console.error('Update failed');
  await pool.end();
  process.exit(1);
}

// 3. payment_log-a yaz
await pool.query(
  `INSERT INTO payment_log
     (key_id, owner_email, plan_from, plan_to, amount_usd, payment_method, note)
   VALUES ($1, $2, $3, $4, $5, $6, $7)`,
  [key.id, email, planFrom, plan, price, method, note]
);

console.log(`${email}: ${planFrom} → ${plan} (limit: ${limit}, $${price})`);
if (method) console.log(`Payment method: ${method}`);

await pool.end();
process.exit(0);