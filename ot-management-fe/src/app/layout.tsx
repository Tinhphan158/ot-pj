import type { Metadata } from 'next';
import '@/styles/global.css';
import { AppProvider } from '@/shared/providers/AppProvider';
import { AppCosmicBackground } from '@/shared/components/layout/AppCosmicBackground';

export const metadata: Metadata = {
  title: 'OT Management',
  description: 'Overtime registration, approval and reporting',
  icons: { icon: [{ url: '/icon.svg', type: 'image/svg+xml' }] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Keeps bg-background as the fallback: the cosmic layer sits at a negative
          z-index, which paints above the canvas background but below all content. */}
      <body className="min-h-screen bg-background font-sans antialiased">
        <AppCosmicBackground />
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
