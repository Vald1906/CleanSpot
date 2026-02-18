import {mysqlTable, int, varchar} from "drizzle-orm/mysql-core";

export const userTable = mysqlTable('user', {
    id: int().primaryKey().autoincrement(),
    email: varchar('email', {length: 255}).notNull(),
    
})
