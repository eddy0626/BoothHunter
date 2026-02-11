import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Link2,
  Languages,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { getBoothItem } from '../lib/booth-api';
import { useI18n } from '../lib/i18n';
import { useFavorites } from '../hooks/useFavorites';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import FavoriteButton from '../components/favorites/FavoriteButton';
import { useTranslation } from '../hooks/useTranslation';
import { openUrl } from '@tauri-apps/plugin-opener';

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const parsedId = id && /^\d+$/.test(id) ? parseInt(id, 10) : NaN;
  const itemId = parsedId;
  const [currentImage, setCurrentImage] = useState(0);
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const { t } = useI18n();
  const {
    translatedText,
    isTranslating,
    isTranslationVisible,
    translationError,
    translate,
    reset: resetTranslation,
  } = useTranslation();
  const {
    translatedText: descTranslatedText,
    isTranslating: descIsTranslating,
    isTranslationVisible: descIsTranslationVisible,
    translationError: descTranslationError,
    translate: descTranslate,
    reset: resetDescTranslation,
  } = useTranslation();

  useEffect(() => {
    setCurrentImage(0);
    resetTranslation();
    resetDescTranslation();
  }, [itemId, resetTranslation, resetDescTranslation]);

  const {
    data: item,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['item', itemId],
    queryFn: () => getBoothItem(itemId),
    enabled: !isNaN(itemId),
  });

  const backText = t.item.goBack;
  const invalidIdText = t.item.invalidId;

  if (isNaN(itemId)) {
    return (
      <div className="p-3 md:p-6">
        <Link
          to="/"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          {backText}
        </Link>
        <p className="text-red-500">{invalidIdText}</p>
      </div>
    );
  }

  const handleOpenInBooth = async () => {
    if (!item) return;
    try {
      const parsed = new URL(item.url);
      const host = parsed.hostname;
      const validHost = host === 'booth.pm' || /^[\w-]+\.booth\.pm$/.test(host);
      if (parsed.protocol === 'https:' && validHost) {
        await openUrl(item.url);
      }
    } catch {
      // URL parsing failed or open failed — no action needed
    }
  };

  const handleCopyLink = () => {
    if (!item) return;
    navigator.clipboard.writeText(item.url).then(
      () => toast.success(t.common.linkCopied),
      () => {
        console.error('Clipboard write failed');
        toast.error(t.errors.clipboardWrite);
      },
    );
  };

  if (isLoading) {
    return (
      <div className="p-3 md:p-6">
        <div className="max-w-5xl mx-auto">
          <Skeleton className="h-5 w-24 mb-4" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-7 w-3/4" />
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-10 w-48" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="p-3 md:p-6">
        <Link
          to="/"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          {backText}
        </Link>
        <p className="text-red-500">{t.common.error}</p>
      </div>
    );
  }

  const priceText = item.price === 0 ? t.item.free : `¥${item.price.toLocaleString()}`;

  return (
    <div className="p-3 md:p-6">
      <div className="max-w-5xl mx-auto">
        <Link
          to="/"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          {backText}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image gallery */}
          <div>
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
              {item.images.length > 0 ? (
                <img
                  src={item.images[currentImage]}
                  alt={item.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  {t.item.noImage}
                </div>
              )}

              {item.images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setCurrentImage((currentImage - 1 + item.images.length) % item.images.length)
                    }
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 text-white rounded-full flex items-center justify-center hover:bg-black/60"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentImage((currentImage + 1) % item.images.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 text-white rounded-full flex items-center justify-center hover:bg-black/60"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {item.images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                {item.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImage(idx)}
                    className={`w-16 h-16 rounded-md overflow-hidden border-2 shrink-0 ${
                      idx === currentImage ? 'border-indigo-500' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Item info */}
          <div>
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-gray-900">{item.name}</h1>
                {isTranslationVisible && translatedText && (
                  <p className="text-sm text-indigo-600 mt-1">{translatedText}</p>
                )}
                {translationError && (
                  <p className="text-xs text-red-400 mt-1">{t.translation.error}</p>
                )}
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => translate(item.name)}
                    className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors shrink-0"
                  >
                    {isTranslating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Languages className="w-4 h-4" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>{t.translation.button}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleCopyLink}
                    className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors shrink-0"
                  >
                    <Link2 className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>{t.common.copyLink}</TooltipContent>
              </Tooltip>
              <FavoriteButton
                item={item}
                favorited={isFavorite(item.id)}
                onAdd={addFavorite}
                onRemove={removeFavorite}
              />
            </div>

            <p
              className={`text-2xl font-bold mt-3 ${item.price === 0 ? 'text-green-600' : 'text-gray-900'}`}
            >
              {priceText}
            </p>

            {item.shop_name && (
              <div className="mt-4">
                <span className="text-sm text-gray-500">{t.item.shop}:</span>
                <span className="ml-2 text-sm text-gray-700">{item.shop_name}</span>
              </div>
            )}

            {item.category_name && (
              <div className="mt-2">
                <span className="text-sm text-gray-500">{t.item.category}:</span>
                <span className="ml-2 text-sm text-gray-700">{item.category_name}</span>
              </div>
            )}

            {item.tags.length > 0 && (
              <div className="mt-4">
                <span className="text-sm text-gray-500 block mb-2">{t.item.tags}:</span>
                <div className="flex flex-wrap gap-1.5">
                  {item.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="bg-gray-100 text-gray-600">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={handleOpenInBooth} className="mt-6">
              <ExternalLink className="w-4 h-4" />
              {t.item.openInBooth}
            </Button>

            {item.description && (
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-sm font-medium text-gray-700">{t.item.description}</h3>
                  <button
                    onClick={() => descTranslate(item.description!)}
                    className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                    title={t.translation.button}
                  >
                    {descIsTranslating ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Languages className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                {descIsTranslationVisible && descTranslatedText && (
                  <div className="text-sm text-indigo-600 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto mb-3">
                    {descTranslatedText}
                  </div>
                )}
                {descTranslationError && (
                  <p className="text-xs text-red-400 mb-2">{t.translation.error}</p>
                )}
                <div className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
                  {item.description}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
