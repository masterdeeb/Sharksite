import { supabase } from './supabase';

export interface BlogPost {
  id: string;
  slug: string;
  titleEn: string;
  titleAr: string;
  contentEn: string;
  contentAr: string;
  categoryEn: string;
  categoryAr: string;
  dateEn: string;
  dateAr: string;
  readTimeEn: string;
  readTimeAr: string;
  image: string;
  author: {
    nameEn: string;
    nameAr: string;
    roleEn: string;
    roleAr: string;
  };
  createdAt: number;
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('createdAt', { ascending: false });

      if (error) {
        console.error('Error fetching blog posts from Supabase:', error);
        return getLocalBlogPosts();
      }

      return data as BlogPost[];
    } catch (error) {
      console.error('Exception fetching blog posts from Supabase:', error);
      return getLocalBlogPosts();
    }
  }

  return getLocalBlogPosts();
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        console.error(`Error fetching blog post ${slug} from Supabase:`, error);
        return getLocalBlogPostBySlug(slug);
      }

      return data as BlogPost;
    } catch (error) {
      console.error(`Exception fetching blog post ${slug} from Supabase:`, error);
      return getLocalBlogPostBySlug(slug);
    }
  }

  return getLocalBlogPostBySlug(slug);
}

export async function saveBlogPostToSupabase(post: BlogPost): Promise<boolean> {
  if (supabase) {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .upsert([post]);

      if (error) {
        console.error('Error saving blog post to Supabase:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Exception saving blog post to Supabase:', error);
      return false;
    }
  }
  return false;
}

export async function deleteBlogPostFromSupabase(id: string): Promise<boolean> {
  if (supabase) {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting blog post from Supabase:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Exception deleting blog post from Supabase:', error);
      return false;
    }
  }
  return false;
}

// Local Storage Fallbacks

function getLocalBlogPosts(): BlogPost[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem('sharksite_blog_posts');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading blog posts from localStorage:', error);
    return [];
  }
}

function getLocalBlogPostBySlug(slug: string): BlogPost | null {
  const posts = getLocalBlogPosts();
  return posts.find(p => p.slug === slug) || null;
}
