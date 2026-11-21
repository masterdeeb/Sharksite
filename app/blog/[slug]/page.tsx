import fs from 'fs';
import path from 'path';
import { Suspense } from 'react';
import { defaultBlogPosts } from '@/lib/blog';
import { BlogPostClient } from '@/components/blog-post-client';

export function generateStaticParams() {
  const slugs = new Set<string>(defaultBlogPosts.map((p) => p.slug));
  try {
    const jsonPath = path.join(process.cwd(), 'public', 'sharksite-full-backup-2026-11-21.json');
    if (fs.existsSync(jsonPath)) {
      const parsed = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
      const posts = parsed?.data?.blog_posts;
      if (Array.isArray(posts)) {
        for (const p of posts) {
          if (p && typeof p.slug === 'string' && p.slug.trim()) {
            slugs.add(p.slug.trim());
          }
        }
      }
    }
  } catch {
    // Fallback to defaultBlogPosts slugs
  }

  return Array.from(slugs).map((slug) => ({ slug }));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <Suspense fallback={<div className="min-h-screen bg-white dark:bg-slate-950" />}>
      <BlogPostClient slugProp={slug} />
    </Suspense>
  );
}
