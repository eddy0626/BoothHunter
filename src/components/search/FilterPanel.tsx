import { useState, useEffect } from 'react';
import { Filter, X, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { useI18n, getSortLabel } from '../../lib/i18n';
import type { SearchParams } from '../../lib/types';

const SORT_VALUES = ['new', 'popular', 'price_asc', 'price_desc'] as const;
const SORT_PLACEHOLDER = '__none__';

interface Props {
  params: SearchParams;
  onFilterChange: (filters: Partial<SearchParams>) => void;
  isEnriching?: boolean;
}

export default function FilterPanel({ params, onFilterChange, isEnriching }: Props) {
  const { t, language } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [priceMin, setPriceMin] = useState(params.price_min?.toString() ?? '');
  const [priceMax, setPriceMax] = useState(params.price_max?.toString() ?? '');
  const [wishMin, setWishMin] = useState(params.min_wish_count?.toString() ?? '');

  // Sync local state when params change (e.g. URL back/forward navigation)
  useEffect(() => {
    setPriceMin(params.price_min?.toString() ?? '');
    setPriceMax(params.price_max?.toString() ?? '');
    setWishMin(params.min_wish_count?.toString() ?? '');
  }, [params.price_min, params.price_max, params.min_wish_count]);

  const handleApplyPrice = () => {
    const clampPrice = (val: string) => {
      const num = parseInt(val, 10);
      if (isNaN(num) || num < 0) return undefined;
      return Math.min(num, 999_999_999);
    };
    const min = priceMin ? clampPrice(priceMin) : undefined;
    const max = priceMax ? clampPrice(priceMax) : undefined;
    onFilterChange({
      price_min: min,
      price_max: max !== undefined && min !== undefined && max < min ? min : max,
    });
  };

  const handleApplyWish = () => {
    const num = parseInt(wishMin, 10);
    onFilterChange({
      min_wish_count: !isNaN(num) && num > 0 ? num : undefined,
    });
  };

  const handleReset = () => {
    setPriceMin('');
    setPriceMax('');
    setWishMin('');
    onFilterChange({
      category: undefined,
      sort: undefined,
      only_free: undefined,
      price_min: undefined,
      price_max: undefined,
      min_wish_count: undefined,
    });
  };

  return (
    <div>
      <div className="flex items-center gap-3 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(isOpen && 'bg-indigo-50 border-indigo-300 text-indigo-700')}
        >
          <Filter className="w-3.5 h-3.5" />
          {t.filter.filter}
        </Button>

        {/* Sort dropdown */}
        <Select
          value={params.sort ?? SORT_PLACEHOLDER}
          onValueChange={(v) => onFilterChange({ sort: v === SORT_PLACEHOLDER ? undefined : v })}
        >
          <SelectTrigger className="w-auto h-9 gap-1">
            <SelectValue placeholder={t.filter.sort} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={SORT_PLACEHOLDER}>{t.filter.sort}</SelectItem>
            {SORT_VALUES.map((value) => (
              <SelectItem key={value} value={value}>
                {getSortLabel(value, t)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Free toggle */}
        <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border border-input bg-background text-gray-600 cursor-pointer hover:bg-gray-50">
          <Checkbox
            checked={params.only_free ?? false}
            onCheckedChange={(checked) =>
              onFilterChange({ only_free: checked === true || undefined })
            }
          />
          {t.filter.freeOnly}
        </label>

        {/* Active filter indicators */}
        {(params.category || params.price_min || params.price_max || params.min_wish_count) && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:text-red-700"
          >
            <X className="w-3 h-3" />
            {t.filter.reset}
          </button>
        )}
      </div>

      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleContent>
          <div className="mt-3 p-4 bg-white rounded-lg border border-gray-200 space-y-4">
            {/* Price range */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">{t.filter.priceRange}</h4>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder={language === 'ko' ? '¥ 최소' : '¥ Min'}
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  className="w-24 h-8"
                />
                <span className="text-gray-400">~</span>
                <Input
                  type="number"
                  placeholder={language === 'ko' ? '¥ 최대' : '¥ Max'}
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className="w-24 h-8"
                />
                <Button size="sm" onClick={handleApplyPrice}>
                  {t.filter.apply}
                </Button>
              </div>
            </div>

            {/* Wish count filter */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-pink-500" />
                {t.filter.minWishCount}
                {isEnriching && (
                  <span className="text-xs text-gray-400 font-normal ml-1">
                    ({t.common.loading})
                  </span>
                )}
              </h4>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="0"
                  min={0}
                  value={wishMin}
                  onChange={(e) => setWishMin(e.target.value)}
                  className="w-24 h-8"
                />
                <span className="text-xs text-gray-500">
                  {language === 'ko' ? '개 이상' : 'or more'}
                </span>
                <Button size="sm" onClick={handleApplyWish}>
                  {t.filter.apply}
                </Button>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
