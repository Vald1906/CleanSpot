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

export const banned_users = mysqlTable("banned_users", {
    userId: int("user_id").primaryKey().references(() => user.id, { onDelete: 'cascade' }),
    bannedAt: datetime("banned_at").default(sql`CURRENT_TIMESTAMP`),
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

    maxParticipants: int("max_participants").default(0),

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
    isReported: int("is_reported").default(0), // 0: normal, 1: reported
    createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// ---------- PARTICIPATIONS ----------
export const participations = mysqlTable("participations", {
    id: int("id").primaryKey().autoincrement(),
    spotId: int("spot_id").notNull(),
    userName: varchar("user_name", { length: 100 }).notNull(),
    presence: int("presence"), // null: pas encore marqué, 0: absent, 1: présent
    createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// ---------- FAVORIS ----------
export const favorites = mysqlTable("favorites", {
    id: int("id").primaryKey().autoincrement(),
    spotId: int("spot_id").notNull(),
    userName: varchar("user_name", { length: 100 }).notNull(),
    createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// ---------- NOTIFICATIONS ----------
export const notifications = mysqlTable("notifications", {
    id: int("id").primaryKey().autoincrement(),
    userId: int("user_id").notNull().references(() => user.id, { onDelete: 'cascade' }),
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message").notNull(),
    type: mysqlEnum("type", ['Info', 'Success', 'Warning', 'Suggestion']).default('Info'),
    isRead: int("is_read").default(0), // 0 for unread, 1 for read
    createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// ---------- ASSOCIATIONS ----------
export const associations = mysqlTable("associations", {
    id: int("id").primaryKey().autoincrement(),
    // Lien direct avec la table user
    userId: int("user_id").notNull().references(() => user.id, { onDelete: 'cascade' }),

    // Informations administratives
    nomAsso: varchar("nom_asso", { length: 255 }).notNull(),
    rnaNumber: varchar("rna_number", { length: 10 }).notNull().unique(), // Identifiant national unique
    typeAsso: varchar("type_asso", { length: 100 }), // Sport, Culture, Humanitaire, etc.
    siren: varchar("siren", { length: 9 }), // Optionnel, pour les assos employeuses

    // Profil public
    description: text("description"),
    objetSocial: varchar("objet_social", { length: 255 }), // Le "but" de l'asso
    siteWeb: varchar("site_web", { length: 255 }),
    telephone: varchar("telephone", { length: 20 }),

    // Localisation du siège
    adresse: varchar("adresse", { length: 255 }),
    codePostal: varchar("code_postal", { length: 10 }),
    ville: varchar("ville", { length: 100 }),

    // Modération
    isVerified: int("is_verified").default(0), // 0: en attente, 1: validée par admin

    createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
});

//DELIMITER //
//CREATE EVENT IF NOT EXISTS `archive_expired_events`
//ON SCHEDULE EVERY 5 MINUTE
//DO
//BEGIN
//    -- 1. Copie vers l'archive
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

//    -- 2. Suppression de la table principale
//    DELETE FROM spots
//    WHERE (date < CURDATE())
//       OR (date = CURDATE() AND hours < CURTIME());
//END //

//DELIMITER ;