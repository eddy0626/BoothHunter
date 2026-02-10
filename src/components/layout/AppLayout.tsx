import type { ReactNode } from 'react';
import { useI18n } from '../../lib/i18n';
import Sidebar from './Sidebar';

interface Props {
  children: ReactNode;
}

export default function AppLayout({ children }: Props) {
  const { t } = useI18n();

  return (
    <div className="flex h-screen bg-gray-50">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-lg focus:text-sm focus:font-medium"
      >
        {t.a11y.skipToContent}
      </a>
      <Sidebar />
      <main id="main-content" className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
