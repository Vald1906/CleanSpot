import { mysqlTable, varchar, json, datetime, int, text, double, mysqlEnum, date, longtext } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const users = mysqlTable("user", {
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

    materials: json("materials"),

    createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const archived_spots = mysqlTable("archived_spots", {
    id: int("id").primaryKey(),

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

    materials: json("materials"),

    createdAt: datetime("created_at"),

    archivedAt: datetime("archived_at").default(sql`CURRENT_TIMESTAMP`),
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

//DELIMITER //
//CREATE EVENT IF NOT EXISTS `archive_expired_events`
//ON SCHEDULE EVERY 1 HOUR
//DO
//BEGIN
//    -- 1. Copier les événements passés vers l'archive
//    INSERT INTO archived_spots (
//        id, type, title, description, author,
//        latitude, longitude, address, image,
//        date, hours, urgency, created_at, materials
//    )
//    SELECT
//        id, type, title, description, author,
//        latitude, longitude, address, image,
//        date, hours, urgency, created_at, materials
//    FROM spots
//    WHERE (date < CURDATE())
//       OR (date = CURDATE() AND hours < CURTIME());
//
//    -- 2. Supprimer les événements passés de la table active
//    DELETE FROM spots
//    WHERE (date < CURDATE())
//       OR (date = CURDATE() AND hours < CURTIME());
//END //
//DELIMITER ;
