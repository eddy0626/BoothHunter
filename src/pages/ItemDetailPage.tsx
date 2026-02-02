import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getBoothItem } from "../lib/booth-api";
import { UI_TEXT } from "../lib/constants";
import FavoriteButton from "../components/favorites/FavoriteButton";
import { open } from "@tauri-apps/plugin-shell";

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const itemId = id ? parseInt(id, 10) : NaN;
  const [currentImage, setCurrentImage] = useState(0);

  const { data: item, isLoading, error } = useQuery({
    queryKey: ["item", itemId],
    queryFn: () => getBoothItem(itemId),
    enabled: !isNaN(itemId),
  });

  if (isNaN(itemId)) {
    return (
      <div className="p-6">
        <Link
          to="/"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          돌아가기
        </Link>
        <p className="text-red-500">잘못된 아이템 ID입니다.</p>
      </div>
    );
  }

  const handleOpenInBooth = async () => {
    if (!item) return;
    try {
      const parsed = new URL(item.url);
      const validHost = parsed.hostname === "booth.pm" || parsed.hostname.endsWith(".booth.pm");
      if (parsed.protocol === "https:" && validHost) {
        await open(item.url);
      }
    } catch (e) {
      console.error("Failed to open URL:", e);
    }
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
          돌아가기
        </Link>
        <p className="text-red-500">{UI_TEXT.common.error}</p>
      </div>
    );
  }

  const priceText =
    item.price === 0 ? UI_TEXT.item.free : `¥${item.price.toLocaleString()}`;

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto">
        <Link
          to="/"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          돌아가기
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
              <h1 className="text-xl font-bold text-gray-900 flex-1">
                {item.name}
              </h1>
              <FavoriteButton item={item} />
            </div>

            <p
              className={`text-2xl font-bold mt-3 ${item.price === 0 ? "text-green-600" : "text-gray-900"}`}
            >
              {priceText}
            </p>

            {item.shop_name && (
              <div className="mt-4">
                <span className="text-sm text-gray-500">
                  {UI_TEXT.item.shop}:
                </span>
                <span className="ml-2 text-sm text-gray-700">
                  {item.shop_name}
                </span>
              </div>
            )}

            {item.category_name && (
              <div className="mt-2">
                <span className="text-sm text-gray-500">
                  {UI_TEXT.item.category}:
                </span>
                <span className="ml-2 text-sm text-gray-700">
                  {item.category_name}
                </span>
              </div>
            )}

            {item.tags.length > 0 && (
              <div className="mt-4">
                <span className="text-sm text-gray-500 block mb-2">
                  {UI_TEXT.item.tags}:
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
              {UI_TEXT.item.openInBooth}
            </button>

            {item.description && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  {UI_TEXT.item.description}
                </h3>
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
