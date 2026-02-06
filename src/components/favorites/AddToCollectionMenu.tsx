import { useState, useMemo } from 'react';
import { FolderPlus, Check } from 'lucide-react';
import { clsx } from 'clsx';
import type { Collection } from '../../lib/types';
import { useI18n } from '../../lib/i18n';

interface Props {
  itemId: number;
  collections: Collection[];
  memberCollectionIds: number[];
  onAddToCollection: (params: { collectionId: number; itemId: number }) => Promise<void>;
  onRemoveFromCollection: (params: { collectionId: number; itemId: number }) => Promise<void>;
}

export default function AddToCollectionMenu({
  itemId,
  collections,
  memberCollectionIds,
  onAddToCollection,
  onRemoveFromCollection,
}: Props) {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();

  const memberOf = useMemo(() => new Set(memberCollectionIds), [memberCollectionIds]);

  const toggle = async (collectionId: number) => {
    try {
      if (memberOf.has(collectionId)) {
        await onRemoveFromCollection({ collectionId, itemId });
      } else {
        await onAddToCollection({ collectionId, itemId });
      }
    } catch (e) {
      console.error('Toggle collection failed:', e);
    }
  };

  if (collections.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
        title={t.collections.addToCollection}
      >
        <FolderPlus className="w-4 h-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[160px] py-1">
            {collections.map((col) => (
              <button
                key={col.id}
                onClick={() => toggle(col.id)}
                className={clsx(
                  'flex items-center gap-2 w-full text-left px-3 py-1.5 text-xs transition-colors',
                  memberOf.has(col.id)
                    ? 'text-indigo-700 bg-indigo-50'
                    : 'text-gray-700 hover:bg-gray-50',
                )}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: col.color }}
                />
                <span className="truncate flex-1">{col.name}</span>
                {memberOf.has(col.id) && <Check className="w-3.5 h-3.5 shrink-0 text-indigo-600" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
