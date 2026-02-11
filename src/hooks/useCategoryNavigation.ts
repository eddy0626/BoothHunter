import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSearchContext } from '../lib/SearchContext';

export function useCategoryNavigation() {
  const { activeCategory, setActiveCategory } = useSearchContext();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const navigateToCategory = (jaName: string) => {
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
  };

  return { activeCategory, navigateToCategory };
}
