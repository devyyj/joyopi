import { pgTable, serial, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(),
  nickname: text('nickname').notNull().unique(),
  bio: text('bio'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  authorId: uuid('author_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  authorName: text('author_name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
