'use client'

import { useState, useRef } from 'react'
import {
  Download,
  Upload,
  Database,
  CheckCircle2,
  AlertTriangle,
  FileJson,
  RefreshCw,
  Trash2,
  ShieldCheck,
} from 'lucide-react'
import {
  exportAllSiteData,
  parseAndValidateBackup,
  importAllSiteData,
  reloadFromPublicBackup,
  SiteBackupPayload,
  BackupSummary,
} from '@/lib/backup'
import { PUBLIC_SEED_PATH } from '@/lib/local-db'

export function BackupManager() {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [isReloadingPublic, setIsReloadingPublic] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [pendingBackup, setPendingBackup] = useState<SiteBackupPayload | null>(null)
  const [pendingSummary, setPendingSummary] = useState<BackupSummary | null>(null)
  const [pendingFileName, setPendingFileName] = useState<string>('')
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('replace')
  const [excludeContact, setExcludeContact] = useState<boolean>(true)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = async () => {
    setIsExporting(true)
    setErrorMessage(null)
    setStatusMessage(null)
    try {
      const payload = await exportAllSiteData()
      const jsonString = JSON.stringify(payload, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' })
      const url = URL.createObjectURL(blob)

      const dateStr = new Date().toISOString().slice(0, 10)
      const a = document.createElement('a')
      a.href = url
      a.download = `sharksite-full-backup-${dateStr}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setStatusMessage(
        `Exported ${payload.data.projects.length} projects, ${payload.data.categories.length} categories, ${payload.data.blog_posts.length} blog posts, ${payload.data.messages.length} messages, settings, and analytics.`
      )
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to export website data.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleReloadPublicJson = async () => {
    setIsReloadingPublic(true)
    setErrorMessage(null)
    setStatusMessage(null)
    try {
      const ok = await reloadFromPublicBackup(excludeContact)
      if (ok) {
        setStatusMessage(
          excludeContact
            ? `Loaded data from ${PUBLIC_SEED_PATH} into local IndexedDB (Contact section & messages preserved).`
            : `Loaded all data including Contact section from ${PUBLIC_SEED_PATH} into local IndexedDB.`
        )
      } else {
        setErrorMessage(`Could not load ${PUBLIC_SEED_PATH}.`)
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to reload public JSON.')
    } finally {
      setIsReloadingPublic(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setErrorMessage(null)
    setStatusMessage(null)

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const text = String(reader.result || '')
        const { payload, summary } = parseAndValidateBackup(text)
        setPendingBackup(payload)
        setPendingSummary(summary)
        setPendingFileName(file.name)
      } catch (err) {
        setPendingBackup(null)
        setPendingSummary(null)
        setErrorMessage(err instanceof Error ? err.message : 'Could not read JSON file.')
      }
    }
    reader.onerror = () => {
      setErrorMessage('Error reading the selected file.')
    }
    reader.readAsText(file)

    if (e.target) e.target.value = ''
  }

  const handleConfirmImport = async () => {
    if (!pendingBackup) return
    if (
      importMode === 'replace' &&
      !confirm(
        excludeContact
          ? 'This will replace existing projects, categories, blog posts, and general settings from the JSON file while keeping your Contact section & messages untouched. Continue?'
          : 'WARNING: "Replace All Data" will replace everything including Contact messages and contact info before importing. Are you sure?'
      )
    ) {
      return
    }

    setIsImporting(true)
    setErrorMessage(null)
    setStatusMessage('Starting import...')
    try {
      await importAllSiteData(
        pendingBackup,
        importMode,
        (step) => setStatusMessage(step),
        { excludeContact }
      )
      setPendingBackup(null)
      setPendingSummary(null)
      setPendingFileName('')
      setStatusMessage(
        `Successfully imported JSON data (${importMode === 'replace' ? 'Replace' : 'Merge'}${excludeContact ? ' — Contact section excluded' : ''}). All changes are live immediately.`
      )
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to import JSON backup.')
      setStatusMessage(null)
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Local Database &amp; JSON Export / Import</h2>
            <p className="text-sm text-slate-500 mt-1">
              100% browser-local IndexedDB storage — zero cloud quotas, pre-seeded from <code className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-700 text-xs">{PUBLIC_SEED_PATH}</code> and ready for Netlify static hosting.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleReloadPublicJson}
          disabled={isReloadingPublic || isImporting}
          className="px-4 py-2.5 bg-slate-900 hover:bg-purple-600 text-white rounded-xl text-xs font-bold shrink-0 transition-colors flex items-center gap-2 disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${isReloadingPublic ? 'animate-spin' : ''}`} />
          {isReloadingPublic ? 'Reloading...' : 'Reload Built-in JSON'}
        </button>
      </div>

      {statusMessage && (
        <div className="p-4 rounded-2xl bg-green-50 border border-green-200 text-green-800 flex items-start gap-3 text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3 text-sm font-medium">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <span className="break-words">{errorMessage}</span>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Export Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Export All Data</h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-4">
              Download a single <code className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-700">.json</code> snapshot containing every collection and configuration from the local database.
            </p>
            <ul className="text-xs text-slate-600 space-y-1.5 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <li>• Portfolio Projects &amp; Galleries</li>
              <li>• Project Categories</li>
              <li>• Blog Articles &amp; Metadata</li>
              <li>• Contact Messages (Read &amp; Unread)</li>
              <li>• Global Site Settings &amp; Social Links</li>
              <li>• Analytics Page Views &amp; Preferences</li>
            </ul>
          </div>

          <button
            onClick={handleExport}
            disabled={isExporting || isImporting}
            className="w-full py-3.5 px-5 bg-slate-900 text-white rounded-xl font-bold hover:bg-purple-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <Download className="w-5 h-5" />
            {isExporting ? 'Exporting JSON...' : 'Download Full JSON Backup'}
          </button>
        </div>

        {/* Import Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Import JSON Backup</h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-4">
              Upload any compatible <code className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-700">.json</code> file (even exported from another site with the same schema) and apply it instantly.
            </p>

            {/* Contact Section Exclusion Option */}
            <label className="flex items-start gap-3 p-3.5 mb-4 rounded-xl bg-amber-50 border border-amber-200 cursor-pointer">
              <input
                type="checkbox"
                checked={excludeContact}
                onChange={(e) => setExcludeContact(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-amber-400 text-purple-600 focus:ring-purple-500"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  Exclude Contact Section (Recommended)
                </span>
                <p className="text-slate-600 mt-0.5 leading-relaxed">
                  Keep this site&apos;s existing Contact email, office address, and inbox messages untouched when importing JSON from another site.
                </p>
              </div>
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div
              onClick={() => !isImporting && fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:bg-slate-50 hover:border-purple-400 transition-colors cursor-pointer"
            >
              <FileJson className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">
                {pendingFileName || 'Click to choose a .json backup file'}
              </p>
              <p className="text-xs text-slate-400 mt-1">Validates structure before writing to IndexedDB</p>
            </div>
          </div>

          {pendingSummary && (
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs text-slate-700">
                <p className="font-bold text-slate-900 text-sm mb-2">Backup Preview:</p>
                <div className="grid grid-cols-2 gap-2">
                  <span>Projects: <strong>{pendingSummary.projectsCount}</strong></span>
                  <span>Categories: <strong>{pendingSummary.categoriesCount}</strong></span>
                  <span>Blog Posts: <strong>{pendingSummary.blogPostsCount}</strong></span>
                  <span>
                    Messages:{' '}
                    <strong>
                      {excludeContact ? 'Skipped (Protected)' : pendingSummary.messagesCount}
                    </strong>
                  </span>
                  <span>Settings: <strong>{pendingSummary.hasSettings ? 'Included' : 'Default'}</strong></span>
                  <span>Page Views: <strong>{pendingSummary.pageViews}</strong></span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Import Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setImportMode('merge')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      importMode === 'merge'
                        ? 'border-purple-600 bg-purple-50 text-purple-900'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
                      <RefreshCw className="w-3.5 h-3.5" />
                      Merge &amp; Update
                    </div>
                    <p className="text-[11px] opacity-80">Keep existing items and add/update from file</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setImportMode('replace')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      importMode === 'replace'
                        ? 'border-red-600 bg-red-50 text-red-900'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
                      <Trash2 className="w-3.5 h-3.5" />
                      Replace All
                    </div>
                    <p className="text-[11px] opacity-80">Clear &amp; restore snapshot{excludeContact ? ' (excl. Contact)' : ''}</p>
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPendingBackup(null)
                    setPendingSummary(null)
                    setPendingFileName('')
                  }}
                  disabled={isImporting}
                  className="px-4 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  disabled={isImporting}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-white transition-colors text-sm disabled:opacity-60 ${
                    importMode === 'replace'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-purple-600 hover:bg-purple-700'
                  }`}
                >
                  {isImporting ? 'Importing...' : 'Apply Backup Now'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
