import { useState } from 'react';
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Heart,
  BarChart3,
  Store,
  ChevronDown,
  User,
  Shirt,
  Gem,
  Paintbrush,
  Box,
  Crown,
  Globe,
  Play,
  Wrench,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { VRCHAT_CATEGORIES } from '../../lib/constants';
import { useSearchContext } from '../../lib/SearchContext';
import { useI18n, getCategoryLabel } from '../../lib/i18n';
import LanguageSelector from '../common/LanguageSelector';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  User,
  Shirt,
  Gem,
  Paintbrush,
  Box,
  Crown,
  Globe,
  Play,
  Wrench,
  Sparkles,
};

export default function Sidebar() {
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const { activeCategory, setActiveCategory } = useSearchContext();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const navItems = [
    { to: '/', icon: Search, label: t.nav.search },
    { to: '/favorites', icon: Heart, label: t.nav.favorites },
    { to: '/stats', icon: BarChart3, label: t.nav.stats },
  ];

  const handleCategoryClick = (jaName: string) => {
    const next = activeCategory === jaName ? null : jaName;
    setActiveCategory(next);

    if (searchParams.has('q')) {
      // Search is active — update cat/sort in-place
      setSearchParams(
        (prev) => {
          const updated = new URLSearchParams(prev);
          if (next) {
            updated.set('cat', next);
            updated.set('sort', 'popular');
          } else {
            updated.delete('cat');
            updated.delete('sort');
          }
          updated.set('page', '1');
          return updated;
        },
        { replace: true },
      );
    } else if (next) {
      // No search active — start a category browse
      navigate(`/?q=&cat=${encodeURIComponent(next)}&sort=popular`);
    } else {
      navigate('/');
    }
  };

  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Store className="w-6 h-6 text-indigo-600" />
          <h1 className="text-lg font-bold text-gray-900">{t.appName}</h1>
        </div>
        <p className="text-xs text-gray-500 mt-1">Booth.pm {t.nav.search}</p>
      </div>
      <nav className="flex-1 p-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
              )
            }
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </NavLink>
        ))}

        {/* VRChat Category Tree */}
        <Collapsible open={isCategoryOpen} onOpenChange={setIsCategoryOpen} className="mt-3">
          <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700">
            <span>{t.nav.vrchat}</span>
            <ChevronDown
              className={cn('w-3.5 h-3.5 transition-transform', !isCategoryOpen && '-rotate-90')}
            />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-1 space-y-0.5">
              {VRCHAT_CATEGORIES.map((cat) => {
                const Icon = ICON_MAP[cat.icon];
                return (
                  <button
                    key={cat.jaName}
                    onClick={() => handleCategoryClick(cat.jaName)}
                    className={cn(
                      'flex items-center gap-2.5 w-full px-3 py-1.5 rounded-lg text-sm transition-colors text-left',
                      activeCategory === cat.jaName
                        ? 'bg-indigo-50 text-indigo-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                    )}
                  >
                    {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
                    <span className="truncate">{getCategoryLabel(cat.jaName, t)}</span>
                  </button>
                );
              })}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </nav>

      {/* Language Selector */}
      <div className="border-t border-gray-200">
        <LanguageSelector />
      </div>
    </aside>
  );
}
