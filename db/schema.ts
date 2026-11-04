import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const rosters = sqliteTable('rosters', { owner: text('owner').primaryKey(), payload: text('payload').notNull(), revision: integer('revision').notNull() });
