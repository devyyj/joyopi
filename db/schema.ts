import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const echoLogs = pgTable('echo_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id'),
  role: text('role').notNull(),
  eventType: text('event_type').notNull(),
  message: text('message').notNull(),
  payload: text('payload'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
