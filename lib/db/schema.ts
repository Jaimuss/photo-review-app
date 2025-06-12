import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

export const photographers = sqliteTable('photographers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  studioName: text('studio_name'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  photographerId: text('photographer_id').references(() => photographers.id),
  clientName: text('client_name').notNull(),
  location: text('location').notNull(),
  sessionDate: text('session_date'),
  accessToken: text('access_token').notNull().unique(),
  status: text('status').default('active'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

export const photos = sqliteTable('photos', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').references(() => sessions.id),
  filename: text('filename').notNull(),
  originalUrl: text('original_url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  uploadOrder: integer('upload_order'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

export const photoReviews = sqliteTable('photo_reviews', {
  id: text('id').primaryKey(),
  photoId: text('photo_id').references(() => photos.id),
  rating: integer('rating').default(3),
  colorTag: text('color_tag'),
  comment: text('comment').default(''),
  isFavorite: integer('is_favorite', { mode: 'boolean' }).default(false),
  isReviewed: integer('is_reviewed', { mode: 'boolean' }).default(false),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}) 