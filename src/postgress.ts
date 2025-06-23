import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv'
dotenv.config()
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES__DATABASE,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT,
});

export const query = (text, params) => pool.query(text, params);
