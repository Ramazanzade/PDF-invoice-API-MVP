import crypto from 'crypto';
import { Resend } from 'resend';
import { pool } from '../db.js';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY environment variable is required');
}

if (!process.env.APP_URL) {
  throw new Error('APP_URL environment variable is required');
}

const resend = new Resend(process.env.RESEND_API_KEY);
const APP_URL = process.env.APP_URL;

export async function startVerification(email) {
  const token = crypto.randomBytes(24).toString('hex');
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  await pool.query(
    `INSERT INTO email_verifications (email, token, expires_at)
     VALUES ($1, $2, $3)`,
    [email, token, expiresAt]
  );

  const verifyUrl = `${APP_URL}/v1/verify?token=${token}`;

  console.log('Sending verification email to:', email);

  const { data, error } = await resend.emails.send({
    from: 'PDF Invoice API <onboarding@resend.dev>',
    to: email,
    subject: 'Confirm your email to get your API key',
    html: `
      <p>Click to confirm and receive your API key:</p>
      <p>
        <a href="${verifyUrl}">${verifyUrl}</a>
      </p>
      <p>This link expires in 30 minutes.</p>
    `,
  });

  if (error) {
    console.error('RESEND ERROR:', error);
    throw new Error(`Failed to send verification email: ${error.message}`);
  }

  console.log('RESEND SUCCESS:', data);

  return data;
}