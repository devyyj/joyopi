import { pgTable, serial, text, timestamp, uuid, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull().unique(),
  nickname: text('nickname').notNull().unique(),
  bio: text('bio'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const profilesRelations = relations(profiles, ({ many }) => ({
  posts: many(posts),
  comments: many(comments),
  likes: many(likes),
  commentLikes: many(commentLikes),
  meals: many(meals),
}));

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  authorId: uuid('author_id').references(() => profiles.id, { onDelete: 'set null' }),
  authorName: text('author_name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const postImages = pgTable('post_images', {
  id: serial('id').primaryKey(),
  postId: integer('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(profiles, {
    fields: [posts.authorId],
    references: [profiles.id],
  }),
  comments: many(comments),
  likes: many(likes),
  images: many(postImages),
}));

export const postImagesRelations = relations(postImages, ({ one }) => ({
  post: one(posts, {
    fields: [postImages.postId],
    references: [posts.id],
  }),
}));

export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  postId: integer('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  authorId: uuid('author_id').references(() => profiles.id, { onDelete: 'set null' }),
  authorName: text('author_name').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const commentsRelations = relations(comments, ({ one, many }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  author: one(profiles, {
    fields: [comments.authorId],
    references: [profiles.id],
  }),
  likes: many(commentLikes),
}));

export const likes = pgTable('likes', {
  id: serial('id').primaryKey(),
  postId: integer('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const likesRelations = relations(likes, ({ one }) => ({
  post: one(posts, {
    fields: [likes.postId],
    references: [posts.id],
  }),
  user: one(profiles, {
    fields: [likes.userId],
    references: [profiles.id],
  }),
}));

export const commentLikes = pgTable('comment_likes', {
  id: serial('id').primaryKey(),
  commentId: integer('comment_id').notNull().references(() => comments.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const commentLikesRelations = relations(commentLikes, ({ one }) => ({
  comment: one(comments, {
    fields: [commentLikes.commentId],
    references: [comments.id],
  }),
  user: one(profiles, {
    fields: [commentLikes.userId],
    references: [profiles.id],
  }),
}));

export const echoLogs = pgTable('echo_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id'),
  role: text('role').notNull(),
  eventType: text('event_type').notNull(),
  message: text('message').notNull(),
  payload: text('payload'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const meals = pgTable('meals', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  menuName: text('menu_name').notNull(),
  mealType: text('meal_type').notNull(), // 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'night_snack'
  satisfaction: integer('satisfaction').notNull(), // 1-5
  memo: text('memo'),
  tags: text('tags').array(),
  eatenAt: timestamp('eaten_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const mealImages = pgTable('meal_images', {
  id: serial('id').primaryKey(),
  mealId: integer('meal_id').notNull().references(() => meals.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const mealsRelations = relations(meals, ({ one, many }) => ({
  user: one(profiles, {
    fields: [meals.userId],
    references: [profiles.id],
  }),
  images: many(mealImages),
}));

export const mealImagesRelations = relations(mealImages, ({ one }) => ({
  meal: one(meals, {
    fields: [mealImages.mealId],
    references: [meals.id],
  }),
}));


