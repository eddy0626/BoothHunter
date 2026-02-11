import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VRCHAT_CATEGORIES } from '../../lib/constants';
import { useSearchContext } from '../../lib/SearchContext';
import { useI18n, getCategoryLabel } from '../../lib/i18n';

const ICON_MAP: Record<string, string> = {
  User: '\u{1F464}',
  Shirt: '\u{1F455}',
  Gem: '\u{1F48E}',
  Paintbrush: '\u{1F3A8}',
  Box: '\u{1F4E6}',
  Crown: '\u{1F451}',
  Globe: '\u{1F30D}',
  Play: '\u25B6\uFE0F',
  Wrench: '\u{1F527}',
  Sparkles: '\u2728',
};

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CategorySheet({ open, onClose }: Props) {
  const { activeCategory, setActiveCategory } = useSearchContext();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  const handleCategoryClick = (jaName: string) => {
    const next = activeCategory === jaName ? null : jaName;
    setActiveCategory(next);

    if (searchParams.has('q')) {
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
      navigate(`/?q=&cat=${encodeURIComponent(next)}&sort=popular`);
    } else {
      navigate('/');
    }

    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-black/40 transition-opacity duration-200',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-label={t.nav.allCategories}
        aria-modal="true"
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl transition-transform duration-300 ease-out safe-area-bottom',
          open ? 'translate-y-0' : 'translate-y-full',
        )}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3">
          <h2 className="text-base font-semibold text-gray-900">
            {t.nav.allCategories}
          </h2>
          <button
            onClick={onClose}
            className="p-2 -mr-1 text-gray-400 hover:text-gray-600 rounded-lg"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Grid */}
        <div className="px-4 pb-6 grid grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto">
          {VRCHAT_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.jaName;
            const emoji = ICON_MAP[cat.icon] ?? '';
            return (
              <button
                key={cat.jaName}
                onClick={() => handleCategoryClick(cat.jaName)}
                aria-pressed={isActive}
                className={cn(
                  'flex items-center gap-2.5 p-3 rounded-xl text-sm font-medium min-h-[48px] transition-colors text-left',
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    : 'bg-gray-50 text-gray-700 border border-gray-100 active:bg-gray-100',
                )}
              >
                <span className="text-base">{emoji}</span>
                <span className="truncate">{getCategoryLabel(cat.jaName, t)}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
