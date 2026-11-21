import type {Metadata} from 'next';
import { Cairo } from 'next/font/google';
import { LanguageProvider } from '@/lib/i18n';
import { ClientSettings } from '@/components/client-settings';
import { ThemeProvider } from '@/components/theme-provider';
import { ErrorBoundary } from '@/components/error-boundary';
import './globals.css'; // Global styles

const cairo = Cairo({ subsets: ['arabic', 'latin'] });

export const metadata: Metadata = {
  title: 'Sharksite',
  description: 'Professional web design services and solutions',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${cairo.className} dark:bg-slate-950 dark:text-white transition-colors duration-300`}>
        <ErrorBoundary>
          <ThemeProvider>
            <LanguageProvider>
              <ClientSettings />
              {children}
            </LanguageProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
