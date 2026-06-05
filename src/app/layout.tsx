import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { Providers } from '@/providers';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#D4764E',
};

export const metadata: Metadata = {
  title: 'Seareiros — Gestão da Cozinha',
  description: 'Sistema de gestão da cozinha do Grupo Espírita Seareiros do Bem',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Seareiros',
  },
  icons: {
    icon: [
      { url: '/favicon.png',   sizes: 'any',     type: 'image/png' },
      { url: '/favicon-32.png',sizes: '32x32',   type: 'image/png' },
      { url: '/icon-192.png',  sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="min-h-full bg-background font-sans text-text-primary">
        <Providers>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              style: { fontFamily: 'Nunito, sans-serif', borderRadius: '12px' },
              success: { iconTheme: { primary: '#2E7D32', secondary: '#fff' } },
              error: { iconTheme: { primary: '#C62828', secondary: '#fff' } },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
