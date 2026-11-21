import { Suspense } from 'react';
import { BlogPostClient } from '@/components/blog-post-client';

export default function DynamicBlogPostPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white dark:bg-slate-950" />}>
      <BlogPostClient />
    </Suspense>
  );
}
