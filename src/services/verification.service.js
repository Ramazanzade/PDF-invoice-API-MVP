import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { pool } from '../db.js';

if (!process.env.APP_URL) {
  throw new Error('APP_URL environment variable is required');
}

if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
  throw new Error('SMTP_HOST, SMTP_USER and SMTP_PASS environment variables are required');
}

const APP_URL = process.env.APP_URL;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: Number(process.env.SMTP_PORT) === 465,  // 465 → true, 587 → false
  family: 4,                                       // IPv4-ə məcbur
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
});

transporter.verify((err) => {
  if (err) {
    console.error('SMTP connection error:', err.message);
  } else {
    console.log('SMTP server ready to send emails');
  }
});

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

  try {
    const info = await transporter.sendMail({
      from: `"PDF Invoice API" <${process.env.SMTP_USER}>`,
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

    console.log('EMAIL SENT:', info.messageId);
    return info;
  } catch (err) {
    console.error('EMAIL SEND ERROR:', err);
    throw new Error(`Failed to send verification email: ${err.message}`);
  }
}

export async function completeVerification(token) {
  const { rows } = await pool.query(
    `SELECT *
     FROM email_verifications
     WHERE token = $1
       AND verified = false
       AND expires_at > now()`,
    [token]
  );

  if (rows.length === 0) {
    return null;
  }

  await pool.query(
    `UPDATE email_verifications
     SET verified = true
     WHERE token = $1`,
    [token]
  );

  return rows[0].email;
}