import { useMemo } from 'react';
import { FolderPlus, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
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
    <Tooltip>
      <DropdownMenu>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <button className="p-1 text-gray-400 hover:text-indigo-600 transition-colors">
              <FolderPlus className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>{t.collections.addToCollection}</TooltipContent>
        <DropdownMenuContent align="end" className="min-w-[160px]">
          {collections.map((col) => (
            <DropdownMenuItem
              key={col.id}
              onClick={() => toggle(col.id)}
              className={cn(
                'flex items-center gap-2 text-xs',
                memberOf.has(col.id) && 'text-indigo-700 bg-indigo-50',
              )}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: col.color }}
              />
              <span className="truncate flex-1">{col.name}</span>
              {memberOf.has(col.id) && <Check className="w-3.5 h-3.5 shrink-0 text-indigo-600" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </Tooltip>
  );
}
