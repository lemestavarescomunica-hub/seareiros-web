'use client';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-60 flex-col bg-surface border-r border-border shadow-card z-40">
        <Sidebar />
      </aside>

      {/* Conteúdo principal */}
      <main className="lg:ml-60 pb-20 lg:pb-0 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {children}
        </div>
      </main>

      {/* Bottom nav — mobile */}
      <BottomNav />
    </div>
  );
}
