import { supabase } from './supabase';

export async function getPageViews(): Promise<number> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('page_views')
        .select('count')
        .eq('id', 'default')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Row doesn't exist, create it
          await supabase.from('page_views').insert([{ id: 'default', count: 0 }]);
          return 0;
        }
        console.error('Error fetching page views from Supabase:', error);
        return getLocalPageViews();
      }

      return data.count;
    } catch (error) {
      console.error('Exception fetching page views from Supabase:', error);
      return getLocalPageViews();
    }
  }

  return getLocalPageViews();
}

export async function incrementPageViews(): Promise<void> {
  if (supabase) {
    try {
      // Use RPC if available, otherwise fetch and update
      const { data, error } = await supabase
        .from('page_views')
        .select('count')
        .eq('id', 'default')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          await supabase.from('page_views').insert([{ id: 'default', count: 1 }]);
        } else {
          console.error('Error fetching page views for increment:', error);
          incrementLocalPageViews();
        }
        return;
      }

      const newCount = data.count + 1;
      await supabase
        .from('page_views')
        .update({ count: newCount })
        .eq('id', 'default');
      
      return;
    } catch (error) {
      console.error('Exception incrementing page views in Supabase:', error);
      incrementLocalPageViews();
      return;
    }
  }

  incrementLocalPageViews();
}

// Local Storage Fallbacks

function getLocalPageViews(): number {
  if (typeof window === 'undefined') return 0;
  return parseInt(localStorage.getItem('sharksite_page_views') || '0', 10);
}

function incrementLocalPageViews(): void {
  if (typeof window === 'undefined') return;
  const currentViews = getLocalPageViews();
  localStorage.setItem('sharksite_page_views', (currentViews + 1).toString());
}
