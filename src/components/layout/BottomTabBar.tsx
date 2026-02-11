import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Search, Heart, BarChart3, Grid3X3, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n, LANGUAGE_OPTIONS } from '../../lib/i18n';
import type { Language } from '../../lib/i18n';
import CategorySheet from './CategorySheet';

export default function BottomTabBar() {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const { t, language, setLanguage } = useI18n();
  const location = useLocation();

  const tabs = [
    { to: '/', icon: Search, label: t.nav.search, type: 'link' as const },
    { icon: Grid3X3, label: t.nav.category, type: 'category' as const },
    { to: '/favorites', icon: Heart, label: t.nav.favorites, type: 'link' as const },
    { to: '/stats', icon: BarChart3, label: t.nav.stats, type: 'link' as const },
    { icon: Globe, label: t.nav.language, type: 'language' as const },
  ];

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 lg:hidden safe-area-bottom"
        aria-label={t.a11y.mainNav}
      >
        <div className="flex">
          {tabs.map((tab, idx) => {
            if (tab.type === 'link') {
              const isActive =
                tab.to === '/'
                  ? location.pathname === '/' || location.pathname.startsWith('/item/')
                  : location.pathname === tab.to;
              return (
                <NavLink
                  key={idx}
                  to={tab.to!}
                  className={cn(
                    'flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px] transition-colors',
                    isActive ? 'text-indigo-600' : 'text-gray-400',
                  )}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium">{tab.label}</span>
                </NavLink>
              );
            }

            if (tab.type === 'category') {
              return (
                <button
                  key={idx}
                  onClick={() => setIsCategoryOpen(true)}
                  className={cn(
                    'flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px] transition-colors',
                    isCategoryOpen ? 'text-indigo-600' : 'text-gray-400',
                  )}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium">{tab.label}</span>
                </button>
              );
            }

            // language
            return (
              <button
                key={idx}
                onClick={() => setIsLangOpen(!isLangOpen)}
                className={cn(
                  'flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px] transition-colors',
                  isLangOpen ? 'text-indigo-600' : 'text-gray-400',
                )}
              >
                <tab.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Language picker popover */}
      {isLangOpen && (
        <>
          <div
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setIsLangOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed bottom-[60px] right-2 z-50 bg-white border border-gray-200 rounded-xl shadow-lg p-1 min-w-[140px] lg:hidden safe-area-bottom">
            {LANGUAGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setLanguage(opt.value as Language);
                  setIsLangOpen(false);
                }}
                className={cn(
                  'w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px]',
                  language === opt.value
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-700 active:bg-gray-100',
                )}
              >
                {opt.nativeLabel}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Category sheet */}
      <CategorySheet open={isCategoryOpen} onClose={() => setIsCategoryOpen(false)} />
    </>
  );
}
