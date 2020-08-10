// Import all env vars from .env file
require("dotenv").config();
export const DB_URL = process.env.DB_URL;
console.log(DB_URL); // => Hello
