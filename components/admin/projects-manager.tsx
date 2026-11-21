'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Plus, Edit2, Trash2, Image as ImageIcon, X, UploadCloud, Link as LinkIcon, Check, Crop, Sparkles } from 'lucide-react'
import {
  Project,
  CustomLink,
  CategoryDoc,
  subscribeToProjects,
  subscribeToCategories,
  saveProjectToFirestore,
  deleteProjectFromFirestore,
  addCategoryToFirestore,
  updateCategoryInFirestore,
  deleteCategoryFromFirestore,
  seedDefaultCategories,
  seedInitialProjects,
} from '@/lib/projects'
import Cropper from 'react-easy-crop'
import getCroppedImg from '@/lib/cropImage'

export function ProjectsManager() {
  const [projects, setProjects] = useState<Project[]>([])
  const [categoryDocs, setCategoryDocs] = useState<CategoryDoc[]>([])
  const [newCategory, setNewCategory] = useState('')
  const [editingCategory, setEditingCategory] = useState<{ id: string; old: string; new: string } | null>(null)

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [currentProject, setCurrentProject] = useState<Partial<Project> | null>(null)

  const [techInput, setTechInput] = useState('')
  const [galleryInput, setGalleryInput] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  // Cropper state
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ x: number; y: number; width: number; height: number } | null>(null)
  const [isCroppingMain, setIsCroppingMain] = useState(true)

  const categories = categoryDocs.map((c) => c.name)

  useEffect(() => {
    const unsubProjects = subscribeToProjects(
      (projs) => setProjects(projs),
      (error) => console.error('ProjectsManager projects error:', error)
    )

    let seededCats = false
    const unsubCategories = subscribeToCategories(
      async (cats) => {
        if (cats.length === 0 && !seededCats) {
          seededCats = true
          try {
            await seedDefaultCategories()
          } catch (e) {
            console.error('Error seeding categories:', e)
          }
        } else {
          setCategoryDocs(cats)
        }
      },
      (error) => console.error('ProjectsManager categories error:', error)
    )

    return () => {
      unsubProjects()
      unsubCategories()
    }
  }, [])

  const handleAddCategory = async () => {
    const trimmed = newCategory.trim()
    if (trimmed && !categories.includes(trimmed)) {
      await addCategoryToFirestore(trimmed, categoryDocs.length)
      setNewCategory('')
    }
  }

  const handleDeleteCategory = async (catDoc: CategoryDoc) => {
    if (confirm(`Are you sure you want to delete category "${catDoc.name}"?`)) {
      await deleteCategoryFromFirestore(catDoc.id)
    }
  }

  const handleSaveEditedCategory = async () => {
    if (
      editingCategory &&
      editingCategory.new.trim() &&
      !categories.includes(editingCategory.new.trim())
    ) {
      const nextName = editingCategory.new.trim()
      await updateCategoryInFirestore(editingCategory.id, nextName)

      const affectedProjects = projects.filter(
        (p) => p.category === editingCategory.old || p.categories?.includes(editingCategory.old)
      )
      for (const proj of affectedProjects) {
        const updatedCats = (proj.categories || [proj.category]).map((c) =>
          c === editingCategory.old ? nextName : c
        )
        await saveProjectToFirestore(
          {
            ...proj,
            category: proj.category === editingCategory.old ? nextName : proj.category,
            categories: updatedCats,
          },
          true
        )
      }

      if (currentProject?.category === editingCategory.old) {
        setCurrentProject({ ...currentProject, category: nextName })
      }

      setEditingCategory(null)
    }
  }

  const handleAddCategoryToProject = (cat: string) => {
    if (!currentProject) return
    const currentCats =
      currentProject.categories || (currentProject.category ? [currentProject.category] : [])
    if (!currentCats.includes(cat)) {
      setCurrentProject({
        ...currentProject,
        categories: [...currentCats, cat],
        category: currentCats.length === 0 ? cat : currentProject.category,
      })
    }
  }

  const handleRemoveCategoryFromProject = (cat: string) => {
    if (!currentProject) return
    const currentCats =
      currentProject.categories || (currentProject.category ? [currentProject.category] : [])
    const newCats = currentCats.filter((c) => c !== cat)
    setCurrentProject({
      ...currentProject,
      categories: newCats,
      category: newCats[0] || '',
    })
  }

  const handleAddCustomLink = () => {
    if (!currentProject) return
    const currentLinks =
      currentProject.customLinks ||
      (currentProject.link
        ? [{ url: currentProject.link, labelEn: 'Visit Project', labelAr: 'زيارة المشروع' }]
        : [])
    setCurrentProject({
      ...currentProject,
      customLinks: [...currentLinks, { url: '', labelEn: '', labelAr: '' }],
    })
  }

  const handleUpdateCustomLink = (index: number, field: keyof CustomLink, value: string) => {
    if (!currentProject) return
    const currentLinks =
      currentProject.customLinks ||
      (currentProject.link
        ? [{ url: currentProject.link, labelEn: 'Visit Project', labelAr: 'زيارة المشروع' }]
        : [])
    const newLinks = [...currentLinks]
    newLinks[index] = { ...newLinks[index], [field]: value }
    setCurrentProject({
      ...currentProject,
      customLinks: newLinks,
      link: index === 0 && field === 'url' ? value : currentProject.link,
    })
  }

  const handleRemoveCustomLink = (index: number) => {
    if (!currentProject) return
    const currentLinks =
      currentProject.customLinks ||
      (currentProject.link
        ? [{ url: currentProject.link, labelEn: 'Visit Project', labelAr: 'زيارة المشروع' }]
        : [])
    const newLinks = [...currentLinks]
    newLinks.splice(index, 1)
    setCurrentProject({
      ...currentProject,
      customLinks: newLinks,
      link: newLinks[0]?.url || '',
    })
  }

  const handleSave = async () => {
    const cats = currentProject?.categories?.length
      ? currentProject.categories
      : currentProject?.category
        ? [currentProject.category]
        : []
    const links = currentProject?.customLinks?.length
      ? currentProject.customLinks
      : currentProject?.link
        ? [{ url: currentProject.link, labelEn: 'Visit Project', labelAr: 'زيارة المشروع' }]
        : []

    if (
      !currentProject?.nameEn ||
      cats.length === 0 ||
      links.length === 0 ||
      !links[0].url ||
      !currentProject?.mainImage
    ) {
      alert('Please fill all required fields (Name EN, at least one Category, at least one Link URL, Main Image)')
      return
    }

    setIsSaving(true)
    try {
      const projectToSave: Partial<Project> = {
        ...currentProject,
        category: cats[0],
        categories: cats,
        link: links[0].url,
        customLinks: links,
        technologies: currentProject.technologies || [],
        gallery: currentProject.gallery || [],
      }

      await saveProjectToFirestore(projectToSave as Project, Boolean(currentProject.id))
      setIsEditing(false)
      setCurrentProject(null)
    } catch (e) {
      console.error('Failed to save project:', e)
      alert('Failed to save project. Please check image sizes (keep under 500KB) and try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      await deleteProjectFromFirestore(id)
    }
  }

  const handleAddTech = () => {
    if (techInput.trim() && currentProject) {
      setCurrentProject({
        ...currentProject,
        technologies: [...(currentProject.technologies || []), techInput.trim()],
      })
      setTechInput('')
    }
  }

  const handleRemoveTech = (index: number) => {
    if (currentProject) {
      const newTechs = [...(currentProject.technologies || [])]
      newTechs.splice(index, 1)
      setCurrentProject({ ...currentProject, technologies: newTechs })
    }
  }

  const handleRemoveGalleryImage = (index: number) => {
    if (currentProject) {
      const newGallery = [...(currentProject.gallery || [])]
      newGallery.splice(index, 1)
      setCurrentProject({ ...currentProject, gallery: newGallery })
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isMain: boolean) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setCropImageSrc(base64String)
        setIsCroppingMain(isMain)
      }
      reader.readAsDataURL(file)
    }
    if (e.target) e.target.value = ''
  }

  const handleUrlImage = (url: string, isMain: boolean) => {
    if (!url) return
    setCropImageSrc(url)
    setIsCroppingMain(isMain)
  }

  const onCropComplete = useCallback(
    (_croppedArea: unknown, croppedAreaPixels: { x: number; y: number; width: number; height: number }) => {
      setCroppedAreaPixels(croppedAreaPixels)
    },
    []
  )

  const handleCropSave = async () => {
    try {
      if (!cropImageSrc || !croppedAreaPixels) return
      const croppedImage = await getCroppedImg(cropImageSrc, croppedAreaPixels)
      if (croppedImage) {
        if (isCroppingMain) {
          setCurrentProject((prev) => ({ ...prev, mainImage: croppedImage }))
        } else {
          setCurrentProject((prev) => ({
            ...prev,
            gallery: [...(prev?.gallery || []), croppedImage],
          }))
        }
      }
      setCropImageSrc(null)
    } catch (e) {
      console.error(e)
      alert('Failed to crop image. If using an external URL without CORS, try uploading the image file directly.')
    }
  }

  if (isEditing && currentProject) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
          <h2 className="text-xl font-bold text-slate-900">
            {currentProject.id ? 'Edit Project' : 'Add New Project'}
          </h2>
          <button
            onClick={() => setIsEditing(false)}
            className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Names */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Name (English) *</label>
              <input
                type="text"
                value={currentProject.nameEn || ''}
                onChange={(e) => setCurrentProject({ ...currentProject, nameEn: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                placeholder="Project Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Name (Arabic) - Optional</label>
              <input
                type="text"
                value={currentProject.nameAr || ''}
                onChange={(e) => setCurrentProject({ ...currentProject, nameAr: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-right"
                placeholder="اسم المشروع"
                dir="rtl"
              />
            </div>
          </div>

          {/* Descriptions */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Description (English) - Optional</label>
              <textarea
                value={currentProject.descEn || ''}
                onChange={(e) => setCurrentProject({ ...currentProject, descEn: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none resize-none h-24"
                placeholder="Brief description..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Description (Arabic) - Optional</label>
              <textarea
                value={currentProject.descAr || ''}
                onChange={(e) => setCurrentProject({ ...currentProject, descAr: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none resize-none h-24 text-right"
                placeholder="وصف مختصر..."
                dir="rtl"
              />
            </div>
          </div>

          {/* Categories & Links */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Categories *</label>
              <div className="flex gap-2 mb-3">
                <select
                  className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none bg-white"
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddCategoryToProject(e.target.value)
                      e.target.value = ''
                    }
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select a category to add
                  </option>
                  {categories
                    .filter(
                      (c) =>
                        !(
                          currentProject.categories ||
                          (currentProject.category ? [currentProject.category] : [])
                        ).includes(c)
                    )
                    .map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                </select>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {(
                  currentProject.categories ||
                  (currentProject.category ? [currentProject.category] : [])
                ).map((cat, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-100"
                  >
                    {cat}
                    <button
                      type="button"
                      onClick={() => handleRemoveCategoryFromProject(cat)}
                      className="hover:text-blue-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">
                  Manage Categories
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCategory())}
                    className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                    placeholder="New category name"
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="px-3 py-1.5 bg-slate-900 text-white text-sm rounded-lg font-medium hover:bg-slate-800 transition-colors"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {categoryDocs.map((catDoc) => (
                    <div
                      key={catDoc.id}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-sm shadow-sm group"
                    >
                      {editingCategory?.id === catDoc.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            autoFocus
                            value={editingCategory.new}
                            onChange={(e) =>
                              setEditingCategory({ ...editingCategory, new: e.target.value })
                            }
                            onKeyDown={(e) =>
                              e.key === 'Enter' && (e.preventDefault(), handleSaveEditedCategory())
                            }
                            className="w-24 px-1 py-0.5 text-sm border border-purple-300 rounded outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleSaveEditedCategory}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCategory(null)}
                            className="text-slate-400 hover:text-slate-600"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="text-slate-700 font-medium">{catDoc.name}</span>
                          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                            <button
                              type="button"
                              onClick={() =>
                                setEditingCategory({ id: catDoc.id, old: catDoc.name, new: catDoc.name })
                              }
                              className="p-1 text-slate-400 hover:text-blue-600"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(catDoc)}
                              className="p-1 text-slate-400 hover:text-red-600"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Project Links */}
            <div className="md:col-span-2">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-slate-700">Project Links *</label>
                <button
                  type="button"
                  onClick={handleAddCustomLink}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add Link
                </button>
              </div>
              <div className="space-y-3">
                {(
                  currentProject.customLinks ||
                  (currentProject.link
                    ? [{ url: currentProject.link, labelEn: 'Visit Project', labelAr: 'زيارة المشروع' }]
                    : [])
                ).map((link, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 relative group"
                  >
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomLink(idx)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <div className="flex-1">
                      <input
                        type="url"
                        placeholder="URL (https://...)"
                        value={link.url}
                        onChange={(e) => handleUpdateCustomLink(idx, 'url', e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-purple-500 outline-none"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Label (English)"
                        value={link.labelEn}
                        onChange={(e) => handleUpdateCustomLink(idx, 'labelEn', e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-purple-500 outline-none"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Label (Arabic)"
                        value={link.labelAr || ''}
                        onChange={(e) => handleUpdateCustomLink(idx, 'labelAr', e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-purple-500 outline-none text-right"
                        dir="rtl"
                      />
                    </div>
                  </div>
                ))}
                {!(
                  currentProject.customLinks ||
                  (currentProject.link
                    ? [{ url: currentProject.link, labelEn: 'Visit Project', labelAr: 'زيارة المشروع' }]
                    : [])
                ).length && (
                  <div className="text-sm text-slate-500 text-center py-4 border-2 border-dashed border-slate-200 rounded-xl">
                    No links added. Click &quot;Add Link&quot; to add one.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Technologies */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Technologies</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTech())}
                className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                placeholder="Add a technology (e.g. React) and press Enter"
              />
              <button
                type="button"
                onClick={handleAddTech}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {currentProject.technologies?.map((tech, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium border border-purple-100"
                >
                  {tech}
                  <button type="button" onClick={() => handleRemoveTech(idx)} className="hover:text-purple-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Main Image */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Main Image *</label>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              {currentProject.mainImage && (
                <div className="relative w-40 h-28 rounded-xl overflow-hidden border border-slate-200 shrink-0 group">
                  <img src={currentProject.mainImage} alt="Main preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleUrlImage(currentProject.mainImage!, true)}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                  >
                    <Crop className="w-5 h-5" />
                  </button>
                </div>
              )}
              <div className="flex-1 w-full space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LinkIcon className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="url"
                      id="mainImageUrlInput"
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                      placeholder="Image URL"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById('mainImageUrlInput') as HTMLInputElement
                      if (input && input.value) {
                        setCurrentProject((prev) => ({ ...prev, mainImage: input.value }))
                        input.value = ''
                      }
                    }}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                  >
                    Use URL
                  </button>
                </div>
                <div
                  className="relative border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, true)}
                  />
                  <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">Click to upload &amp; crop</p>
                </div>
              </div>
            </div>
          </div>

          {/* Gallery Images */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Additional Images (Gallery) - Optional
            </label>
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LinkIcon className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="url"
                    value={galleryInput}
                    onChange={(e) => setGalleryInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        if (galleryInput.trim()) {
                          setCurrentProject((prev) => ({
                            ...prev,
                            gallery: [...(prev?.gallery || []), galleryInput.trim()],
                          }))
                          setGalleryInput('')
                        }
                      }
                    }}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                    placeholder="Add image URL and press Enter"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (galleryInput.trim()) {
                      setCurrentProject((prev) => ({
                        ...prev,
                        gallery: [...(prev?.gallery || []), galleryInput.trim()],
                      }))
                      setGalleryInput('')
                    }
                  }}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                >
                  Add URL
                </button>
              </div>

              <div
                className="relative border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => galleryInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={galleryInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, false)}
                />
                <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Click to upload additional image</p>
              </div>

              {currentProject.gallery && currentProject.gallery.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                  {currentProject.gallery.map((img, idx) => (
                    <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 group">
                      <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleUrlImage(img, false)}
                          className="p-1.5 bg-white text-slate-900 rounded-full hover:bg-slate-100 transition-colors shadow-sm"
                        >
                          <Crop className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryImage(idx)}
                          className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Show on Home Page */}
          <div className="pt-4 border-t border-slate-100">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={!!currentProject.showOnHome}
                onChange={(e) => setCurrentProject({ ...currentProject, showOnHome: e.target.checked })}
                className="w-5 h-5 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-slate-700">Show this project on the Home Page</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
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
              {isSaving ? 'Saving...' : 'Save Project'}
            </button>
          </div>
        </div>

        {/* Cropper Modal */}
        {cropImageSrc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden flex flex-col h-[80vh]">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-bold text-lg">Crop Image</h3>
                <button onClick={() => setCropImageSrc(null)} className="p-1 hover:bg-slate-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="relative flex-1 bg-slate-100">
                <Cropper
                  image={cropImageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={16 / 9}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              </div>
              <div className="p-4 border-t border-slate-200 flex items-center justify-between gap-4">
                <div className="flex-1 max-w-xs">
                  <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    aria-labelledby="Zoom"
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCropImageSrc(null)}
                    className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCropSave}
                    className="px-4 py-2 font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg"
                  >
                    Save Crop
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex flex-wrap gap-3 justify-between items-center">
        <h2 className="text-lg font-bold text-slate-900">Manage Projects</h2>
        <div className="flex items-center gap-3">
          {projects.length === 0 && (
            <button
              onClick={() => seedInitialProjects()}
              className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-xl font-medium hover:bg-purple-100 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Load Starter Projects
            </button>
          )}
          <button
            onClick={() => {
              setCurrentProject({ technologies: [], gallery: [] })
              setIsEditing(true)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Project
          </button>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {projects.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No projects in local database yet. Click &quot;Add Project&quot; or &quot;Load Starter Projects&quot;.
          </div>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:bg-slate-50 transition-colors group"
            >
              <div className="w-24 h-16 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                {project.mainImage ? (
                  <img src={project.mainImage} alt={project.nameEn} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-slate-900 truncate">{project.nameEn}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                    {project.categories && project.categories.length > 0
                      ? project.categories.join(', ')
                      : project.category}
                  </span>
                  {project.showOnHome && (
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-md">
                      On Home
                    </span>
                  )}
                  <span className="text-xs text-slate-500 truncate">
                    {project.technologies.join(', ')}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 sm:mt-0 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => {
                    setCurrentProject(project)
                    setIsEditing(true)
                  }}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(project.id)}
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
