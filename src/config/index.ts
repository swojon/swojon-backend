import { config } from 'dotenv';
config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

export const CREDENTIALS = process.env.CREDENTIALS === 'true';
export const { NODE_ENV, PORT, SUBSCRIPTION_PORT, SECRET_KEY, LOG_FORMAT, LOG_DIR, ORIGIN } = process.env;
export const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_HOST, POSTGRES_PORT, POSTGRES_DB } = process.env;
export const { SMTP_USERNAME, SMTP_PASSWORD, SMTP_HOST, SMTP_PORT } = process.env;
export const { COOKIE_SECRET, COOKIE_NAME } = process.env;
