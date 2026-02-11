import { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Link2, Languages, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { BoothItem } from '../../lib/types';
import { useI18n } from '../../lib/i18n';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import FavoriteButton from '../favorites/FavoriteButton';
import { performTranslation } from '../../hooks/useTranslation';

interface Props {
  item: BoothItem;
  favorited: boolean;
  onAddFavorite: (item: BoothItem) => Promise<void>;
  onRemoveFavorite: (itemId: number) => Promise<void>;
}

interface TranslationState {
  text: string | null;
  loading: boolean;
  visible: boolean;
  error: boolean;
}

const INITIAL_TRANSLATION: TranslationState = { text: null, loading: false, visible: false, error: false };

export default memo(function ItemCard({ item, favorited, onAddFavorite, onRemoveFavorite }: Props) {
  const { t, language } = useI18n();
  const thumbnail = item.images[0] || '';
  const priceText = item.price === 0 ? t.item.free : `¥${item.price.toLocaleString()}`;
  const [tr, setTr] = useState<TranslationState>(INITIAL_TRANSLATION);

  const handleTranslate = async () => {
    // Toggle off if already visible
    if (tr.visible) {
      setTr((s) => ({ ...s, visible: false }));
      return;
    }
    // Show cached result if available
    if (tr.text) {
      setTr((s) => ({ ...s, visible: true }));
      return;
    }
    setTr({ text: null, loading: true, visible: false, error: false });
    try {
      const translated = await performTranslation(item.name, language);
      setTr({ text: translated, loading: false, visible: true, error: false });
    } catch {
      setTr({ text: null, loading: false, visible: false, error: true });
    }
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(item.url).then(
      () => toast.success(t.common.linkCopied),
      () => {
        console.error('Clipboard write failed');
        toast.error(t.errors.clipboardWrite);
      },
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
      <Link to={`/item/${item.id}`} className="block">
        <div className="aspect-square bg-gray-100 relative overflow-hidden">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
              {t.item.noImage}
            </div>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleCopyLink}
                className="absolute top-1.5 right-1.5 p-2 md:p-1.5 bg-black/50 text-white rounded-md opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-black/70"
              >
                <Link2 className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>{t.common.copyLink}</TooltipContent>
          </Tooltip>
        </div>
      </Link>
      <div className="p-2 md:p-3">
        <div className="flex items-start justify-between gap-1">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    to={`/item/${item.id}`}
                    className="text-xs md:text-sm font-medium text-gray-900 line-clamp-2 hover:text-indigo-600 flex-1"
                  >
                    {item.name}
                  </Link>
                </TooltipTrigger>
                <TooltipContent>{item.name}</TooltipContent>
              </Tooltip>
              <button
                onClick={handleTranslate}
                className="p-2 md:p-0.5 text-gray-400 hover:text-indigo-600 transition-colors shrink-0"
                title={t.translation.button}
              >
                {tr.loading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Languages className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            {tr.visible && tr.text && (
              <p className="text-xs text-indigo-600 mt-0.5">{tr.text}</p>
            )}
            {tr.error && (
              <p className="text-xs text-red-400 mt-0.5">{t.translation.error}</p>
            )}
          </div>
          <FavoriteButton
            item={item}
            favorited={favorited}
            onAdd={onAddFavorite}
            onRemove={onRemoveFavorite}
          />
        </div>
        <div className="mt-1.5 md:mt-2 flex items-center justify-between">
          <span
            className={`text-xs md:text-sm font-bold ${item.price === 0 ? 'text-green-600' : 'text-gray-900'}`}
          >
            {priceText}
          </span>
          {item.shop_name && (
            <span className="text-[10px] md:text-xs text-gray-500 truncate max-w-[80px] md:max-w-[120px]">{item.shop_name}</span>
          )}
        </div>
        <div className="mt-1 md:mt-1.5 flex items-center gap-1 md:gap-1.5 flex-wrap">
          {item.category_name && (
            <Badge variant="secondary" className="text-[10px] md:text-xs text-gray-500 bg-gray-100">
              {item.category_name}
            </Badge>
          )}
          {item.wish_lists_count != null && (
            <span className="flex items-center gap-0.5 text-[10px] md:text-xs text-pink-500">
              <Heart className="w-2.5 h-2.5 md:w-3 md:h-3" fill="currentColor" />
              {item.wish_lists_count.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});
