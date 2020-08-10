// Import all env vars from .env file
require("dotenv").config();
export const DB_DATABASE = process.env.DB_DATABASE;
export const DB_HOST = process.env.DB_HOST;
export const DB_PASS = process.env.DB_PASS;
export const DB_PATH = process.env.DB_PATH;
export const DB_URL = process.env.DB_URL;
export const DB_USER = process.env.DB_USER;
export const PAGARME_KEY = process.env.PAGARME_KEY;
export const SECRET = process.env.SECRET;
export const SENDGRID = process.env.SENDGRID;
