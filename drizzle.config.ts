import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config({ path: '.env' });

export default defineConfig({
    schema: "src/db/schema.ts",
    out: "./migrations",
    dialect: 'mysql',
    tablesFilter: ["comments", "favorites", "participations", "spots", "user", "notifications", "archived_spots"],
    dbCredentials: {
        url: process.env.DATABASE_URL!
    }
});
