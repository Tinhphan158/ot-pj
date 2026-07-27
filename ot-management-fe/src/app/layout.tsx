import type { Metadata } from 'next';
import '@/styles/global.css';
import { AppProvider } from '@/shared/providers/AppProvider';

export const metadata: Metadata = {
  title: 'OT Management',
  description: 'Overtime registration, approval and reporting',
  icons: { icon: [{ url: '/icon.svg', type: 'image/svg+xml' }] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
