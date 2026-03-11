import { mysqlTable, varchar, json, datetime, int, text, double, mysqlEnum, date, longtext } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const user = mysqlTable("user", {
    id: int("id").primaryKey().autoincrement(),
    email: varchar("email", { length: 180 }).notNull().unique(),
    roles: json("roles").notNull(),
    password: varchar("password", { length: 255 }).notNull(),
    nom: varchar("nom", { length: 255 }).notNull(),
    statut_pro: varchar("statut_pro", { length: 255 }).notNull(),
    prenom: varchar("prenom", { length: 255 }).notNull(),
    createdAt: datetime("created_at").notNull(),
});

export const spots = mysqlTable("spots", {
    id: int("id").primaryKey().autoincrement(),
    type: mysqlEnum("type", ['Event', 'Signalement', 'Point de Tri']).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    author: varchar("author", { length: 100 }).notNull(),

    latitude: double("latitude").notNull(),
    longitude: double("longitude").notNull(),
    address: varchar("address", { length: 255 }).notNull(),

    image: longtext("image"),
    date: date("date"),
    hours: varchar("hours", { length: 100 }),
    urgency: varchar("urgency", { length: 50 }),

    // Types de matières (stocké en JSON : ["Plastique", "Verre", ...])
    materials: json("materials"),

    createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// ---------- COMMENTAIRES ----------
export const comments = mysqlTable("comments", {
    id: int("id").primaryKey().autoincrement(),
    spotId: int("spot_id").notNull(),
    author: varchar("author", { length: 100 }).notNull(),
    content: text("content").notNull(),
    createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// ---------- PARTICIPATIONS ----------
export const participations = mysqlTable("participations", {
    id: int("id").primaryKey().autoincrement(),
    spotId: int("spot_id").notNull(),
    userName: varchar("user_name", { length: 100 }).notNull(),
    createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// ---------- FAVORIS ----------
export const favorites = mysqlTable("favorites", {
    id: int("id").primaryKey().autoincrement(),
    spotId: int("spot_id").notNull(),
    userName: varchar("user_name", { length: 100 }).notNull(),
    createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
});