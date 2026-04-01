import Link from 'next/link'
 
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4 transition-colors duration-300">Not Found</h2>
      <p className="text-slate-600 dark:text-slate-400 mb-8 transition-colors duration-300">Could not find requested resource</p>
      <Link 
        href="/"
        className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
      >
        Return Home
      </Link>
    </div>
  )
}
