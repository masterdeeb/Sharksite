-- Supabase Schema for Sharksite

-- 1. Messages Table
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  "createdAt" BIGINT NOT NULL,
  read BOOLEAN DEFAULT FALSE
);

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  "nameEn" TEXT NOT NULL,
  "nameAr" TEXT,
  "descEn" TEXT,
  "descAr" TEXT,
  technologies JSONB DEFAULT '[]'::jsonb,
  category TEXT NOT NULL,
  categories JSONB DEFAULT '[]'::jsonb,
  link TEXT NOT NULL,
  "customLinks" JSONB DEFAULT '[]'::jsonb,
  "mainImage" TEXT NOT NULL,
  gallery JSONB DEFAULT '[]'::jsonb,
  "showOnHome" BOOLEAN DEFAULT FALSE,
  "createdAt" BIGINT
);

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  name TEXT PRIMARY KEY
);

-- Insert default categories
INSERT INTO categories (name) VALUES 
  ('SaaS Product'),
  ('Web Design'),
  ('Marketing Site'),
  ('Mobile App'),
  ('Brand Identity'),
  ('Web Application')
ON CONFLICT (name) DO NOTHING;

-- 4. Settings Table
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  "contactEmail" TEXT,
  "contactPhone" TEXT,
  "contactAddress" TEXT,
  "socialFacebook" TEXT,
  "socialTwitter" TEXT,
  "socialInstagram" TEXT,
  "socialLinkedin" TEXT,
  "heroTitleEn" TEXT,
  "heroTitleAr" TEXT,
  "heroSubtitleEn" TEXT,
  "heroSubtitleAr" TEXT,
  "aboutTextEn" TEXT,
  "aboutTextAr" TEXT
);

-- 6. Blog Posts Table
CREATE TABLE IF NOT EXISTS blog_posts (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  "titleEn" TEXT NOT NULL,
  "titleAr" TEXT,
  "contentEn" TEXT NOT NULL,
  "contentAr" TEXT,
  "categoryEn" TEXT NOT NULL,
  "categoryAr" TEXT,
  "dateEn" TEXT NOT NULL,
  "dateAr" TEXT,
  "readTimeEn" TEXT NOT NULL,
  "readTimeAr" TEXT,
  image TEXT NOT NULL,
  author JSONB NOT NULL,
  "createdAt" BIGINT NOT NULL
);
