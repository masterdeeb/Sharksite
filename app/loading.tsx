import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="relative z-50">
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm transition-colors duration-300">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-purple-100 dark:border-purple-900 border-t-purple-600 dark:border-t-purple-400 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-900/30" />
            </div>
          </div>
          <p className="text-slate-600 dark:text-slate-400 font-medium animate-pulse transition-colors duration-300">Loading...</p>
        </div>
      </div>
    </div>
  );
}
