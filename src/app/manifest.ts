import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Seareiros — Gestão da Cozinha',
    short_name: 'Seareiros',
    description: 'Sistema de gestão da cozinha do Grupo Espírita Seareiros do Bem',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#FFF9F2',
    theme_color: '#D4764E',
    orientation: 'portrait-primary',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
