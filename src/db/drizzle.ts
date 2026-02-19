
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/mysql2";

config({path: ".env"});

export const db = drizzle(process.env.DATABASE_URL);

