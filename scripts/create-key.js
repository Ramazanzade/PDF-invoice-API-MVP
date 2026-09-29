import 'dotenv/config';
import { createApiKey } from '../src/services/apikey.service.js';
import { pool } from '../src/db.js';

const email = process.argv[2];
const plan = process.argv[3] || 'free';
const limit = Number(process.argv[4]) || 50;

if (!email) {
  console.error('Usage: node scripts/create-key.js email@example.com [plan] [limit]');
  process.exit(1);
}

const key = await createApiKey({ ownerEmail: email, plan, monthlyLimit: limit });
console.log('New API key (displayed once, save):');
console.log(key);
await pool.end();
process.exit(0);