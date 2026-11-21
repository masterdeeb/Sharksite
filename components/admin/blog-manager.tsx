'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, X, FileText, Sparkles } from 'lucide-react'
import {
  BlogPost,
  defaultBlogPosts,
  subscribeToBlogPosts,
  saveBlogPostToFirestore,
  deleteBlogPostFromFirestore,
  seedBlogPosts,
} from '@/lib/blog'

export function BlogManager() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [isNew, setIsNew] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [currentPost, setCurrentPost] = useState<Partial<BlogPost> | null>(null)

  useEffect(() => {
    const unsubscribe = subscribeToBlogPosts(
      (items) => setPosts(items),
      (error) => console.error('BlogManager subscription error:', error)
    )
    return () => unsubscribe()
  }, [])

  const handleSave = async () => {
    if (!currentPost?.titleEn || !currentPost?.contentEn) {
      alert('Please fill in at least the English title and content.')
      return
    }
    setIsSaving(true)
    try {
      await saveBlogPostToFirestore(
        {
          id: currentPost.id,
          slug: currentPost.slug || currentPost.titleEn,
          titleEn: currentPost.titleEn,
          titleAr: currentPost.titleAr || currentPost.titleEn,
          contentEn: currentPost.contentEn,
          contentAr: currentPost.contentAr || currentPost.contentEn,
          categoryEn: currentPost.categoryEn || 'General',
          categoryAr: currentPost.categoryAr || 'عام',
          dateEn:
            currentPost.dateEn ||
            new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          dateAr:
            currentPost.dateAr ||
            new Date().toLocaleDateString('ar-EG', { month: 'long', day: 'numeric', year: 'numeric' }),
          readTimeEn: currentPost.readTimeEn || '5',
          readTimeAr: currentPost.readTimeAr || '5',
          image:
            currentPost.image ||
            'https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=800&auto=format&fit=crop',
          author: {
            nameEn: currentPost.author?.nameEn || 'Muneeb Adil',
            nameAr: currentPost.author?.nameAr || 'منيب عادل',
            roleEn: currentPost.author?.roleEn || 'Author',
            roleAr: currentPost.author?.roleAr || 'كاتب',
          },
        },
        !isNew
      )
      setIsEditing(false)
      setCurrentPost(null)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this article?')) {
      await deleteBlogPostFromFirestore(id)
    }
  }

  const handleSeedDefaults = async () => {
    await seedBlogPosts(defaultBlogPosts)
  }

  if (isEditing && currentPost) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
          <h2 className="text-xl font-bold text-slate-900">
            {isNew ? 'Add New Article' : 'Edit Article'}
          </h2>
          <button
            onClick={() => setIsEditing(false)}
            className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Title (English) *</label>
              <input
                type="text"
                value={currentPost.titleEn || ''}
                onChange={(e) => setCurrentPost({ ...currentPost, titleEn: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-purple-500 outline-none"
                placeholder="Article Title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Title (Arabic)</label>
              <input
                type="text"
                value={currentPost.titleAr || ''}
                onChange={(e) => setCurrentPost({ ...currentPost, titleAr: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-purple-500 outline-none text-right"
                placeholder="عنوان المقال"
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Slug (URL)</label>
              <input
                type="text"
                value={currentPost.slug || ''}
                onChange={(e) => setCurrentPost({ ...currentPost, slug: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-purple-500 outline-none"
                placeholder="future-of-web-design"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Category (English)</label>
              <input
                type="text"
                value={currentPost.categoryEn || ''}
                onChange={(e) => setCurrentPost({ ...currentPost, categoryEn: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-purple-500 outline-none"
                placeholder="Design Trends"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Category (Arabic)</label>
              <input
                type="text"
                value={currentPost.categoryAr || ''}
                onChange={(e) => setCurrentPost({ ...currentPost, categoryAr: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-purple-500 outline-none text-right"
                placeholder="اتجاهات التصميم"
                dir="rtl"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Cover Image URL</label>
            <input
              type="url"
              value={currentPost.image || ''}
              onChange={(e) => setCurrentPost({ ...currentPost, image: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-purple-500 outline-none"
              placeholder="https://images.unsplash.com/..."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Content (English) *</label>
              <textarea
                value={currentPost.contentEn || ''}
                onChange={(e) => setCurrentPost({ ...currentPost, contentEn: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-purple-500 outline-none h-40 resize-y"
                placeholder="HTML or plain text content..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Content (Arabic)</label>
              <textarea
                value={currentPost.contentAr || ''}
                onChange={(e) => setCurrentPost({ ...currentPost, contentAr: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-purple-500 outline-none h-40 resize-y text-right"
                placeholder="محتوى المقال..."
                dir="rtl"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => setIsEditing(false)}
              className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-sm disabled:opacity-70"
            >
              {isSaving ? 'Saving...' : 'Save Article'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex flex-wrap gap-3 justify-between items-center">
        <h2 className="text-lg font-bold text-slate-900">Manage Blog Articles</h2>
        <div className="flex items-center gap-3">
          {posts.length === 0 && (
            <button
              onClick={handleSeedDefaults}
              className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-xl font-medium hover:bg-purple-100 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Load Starter Articles
            </button>
          )}
          <button
            onClick={() => {
              setCurrentPost({
                readTimeEn: '5',
                readTimeAr: '5',
                author: { nameEn: 'Muneeb Adil', nameAr: 'منيب عادل', roleEn: 'Author', roleAr: 'كاتب' },
              })
              setIsNew(true)
              setIsEditing(true)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Article
          </button>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {posts.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            No blog articles in local database yet. Click &quot;Add Article&quot; or &quot;Load Starter Articles&quot;.
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="p-6 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold text-slate-900 truncate">{post.titleEn}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  /{post.slug} • {post.categoryEn} • {post.dateEn}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setCurrentPost(post)
                    setIsNew(false)
                    setIsEditing(true)
                  }}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
