import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Link2,
  Languages,
  Loader2,
} from "lucide-react";
import { getBoothItem } from "../lib/booth-api";
import { useI18n } from "../lib/i18n";
import { useFavorites } from "../hooks/useFavorites";
import FavoriteButton from "../components/favorites/FavoriteButton";
import { useToast } from "../lib/ToastContext";
import { useTranslation } from "../hooks/useTranslation";
import { open } from "@tauri-apps/plugin-shell";

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const itemId = id ? parseInt(id, 10) : NaN;
  const [currentImage, setCurrentImage] = useState(0);
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const { t, language } = useI18n();
  const { showToast } = useToast();
  const { translatedText, isTranslating, isTranslationVisible, translationError, translate, reset: resetTranslation } = useTranslation();
  const { translatedText: descTranslatedText, isTranslating: descIsTranslating, isTranslationVisible: descIsTranslationVisible, translationError: descTranslationError, translate: descTranslate, reset: resetDescTranslation } = useTranslation();

  useEffect(() => {
    setCurrentImage(0);
    resetTranslation();
    resetDescTranslation();
  }, [itemId, resetTranslation, resetDescTranslation]);

  const { data: item, isLoading, error } = useQuery({
    queryKey: ["item", itemId],
    queryFn: () => getBoothItem(itemId),
    enabled: !isNaN(itemId),
  });

  const backText = language === "ko" ? "돌아가기" : "Go back";
  const invalidIdText = language === "ko" ? "잘못된 아이템 ID입니다." : "Invalid item ID.";

  if (isNaN(itemId)) {
    return (
      <div className="p-6">
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
      const validHost =
        host === "booth.pm" ||
        (host != null && host.endsWith(".booth.pm"));
      if (parsed.protocol === "https:" && validHost) {
        await open(item.url);
      }
    } catch {
      // URL parsing failed or open failed — no action needed
    }
  };

  const handleCopyLink = () => {
    if (!item) return;
    navigator.clipboard.writeText(item.url).then(
      () => showToast(t.common.linkCopied),
      () => console.error("Clipboard write failed"),
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="p-6">
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

  const priceText =
    item.price === 0 ? t.item.free : `¥${item.price.toLocaleString()}`;

  return (
    <div className="p-6">
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
                  No Image
                </div>
              )}

              {item.images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setCurrentImage(
                        (currentImage - 1 + item.images.length) %
                          item.images.length,
                      )
                    }
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 text-white rounded-full flex items-center justify-center hover:bg-black/60"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentImage(
                        (currentImage + 1) % item.images.length,
                      )
                    }
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
                      idx === currentImage
                        ? "border-indigo-500"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Item info */}
          <div>
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-gray-900">
                  {item.name}
                </h1>
                {isTranslationVisible && translatedText && (
                  <p className="text-sm text-indigo-600 mt-1">{translatedText}</p>
                )}
                {translationError && (
                  <p className="text-xs text-red-400 mt-1">{t.translation.error}</p>
                )}
              </div>
              <button
                onClick={() => translate(item.name)}
                className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors shrink-0"
                title={t.translation.button}
              >
                {isTranslating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Languages className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={handleCopyLink}
                className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors shrink-0"
                title={t.common.copyLink}
              >
                <Link2 className="w-4 h-4" />
              </button>
              <FavoriteButton
                item={item}
                favorited={isFavorite(item.id)}
                onAdd={addFavorite}
                onRemove={removeFavorite}
              />
            </div>

            <p
              className={`text-2xl font-bold mt-3 ${item.price === 0 ? "text-green-600" : "text-gray-900"}`}
            >
              {priceText}
            </p>

            {item.shop_name && (
              <div className="mt-4">
                <span className="text-sm text-gray-500">
                  {t.item.shop}:
                </span>
                <span className="ml-2 text-sm text-gray-700">
                  {item.shop_name}
                </span>
              </div>
            )}

            {item.category_name && (
              <div className="mt-2">
                <span className="text-sm text-gray-500">
                  {t.item.category}:
                </span>
                <span className="ml-2 text-sm text-gray-700">
                  {item.category_name}
                </span>
              </div>
            )}

            {item.tags.length > 0 && (
              <div className="mt-4">
                <span className="text-sm text-gray-500 block mb-2">
                  {t.item.tags}:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleOpenInBooth}
              className="mt-6 flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              {t.item.openInBooth}
            </button>

            {item.description && (
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-sm font-medium text-gray-700">
                    {t.item.description}
                  </h3>
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
