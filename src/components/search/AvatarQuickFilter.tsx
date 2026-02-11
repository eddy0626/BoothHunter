import { memo, useCallback, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useI18n } from '../../lib/i18n';
import { usePopularAvatars } from '../../hooks/usePopularAvatars';
import type { PopularAvatar } from '../../lib/booth-api';

interface Props {
  onSearch: (keyword: string, extra?: { category?: string }) => void;
}

function getDisplayName(avatar: PopularAvatar, language: string): string {
  if (language === 'en') return avatar.name_en || avatar.name_ko;
  return avatar.name_ko;
}

interface AvatarChipProps {
  avatar: PopularAvatar;
  isActive: boolean;
  language: string;
  itemsLabel: string;
  onClick: (nameJa: string) => void;
  onContextMenu: (e: React.MouseEvent, nameJa: string) => void;
}

const AvatarChip = memo(function AvatarChip({
  avatar,
  isActive,
  language,
  itemsLabel,
  onClick,
  onContextMenu,
}: AvatarChipProps) {
  const displayName = getDisplayName(avatar, language);
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={() => onClick(avatar.name_ja)}
          onContextMenu={(e) => onContextMenu(e, avatar.name_ja)}
          className={cn(
            'shrink-0 snap-start inline-flex items-center gap-1.5 px-3 py-2.5 md:py-1.5 rounded-full text-xs font-medium border transition-colors',
            isActive
              ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300',
          )}
          aria-label={`${displayName} (${avatar.name_ja})${avatar.item_count > 0 ? ` - ${avatar.item_count} ${itemsLabel}` : ''}`}
          aria-pressed={isActive}
        >
          <span>{displayName}</span>
          {avatar.item_count > 0 && (
            <span className="text-[10px] text-gray-400">
              {avatar.item_count} {itemsLabel}
            </span>
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent>{`${displayName} (${avatar.name_ja})`}</TooltipContent>
    </Tooltip>
  );
});

export default function AvatarQuickFilter({ onSearch }: Props) {
  const { avatars, isLoading } = usePopularAvatars();
  const [activeAvatar, setActiveAvatar] = useState<string | null>(null);
  const activeRef = useRef<string | null>(null);
  const { t, language } = useI18n();

  const handleClick = useCallback(
    (nameJa: string) => {
      if (activeRef.current === nameJa) {
        activeRef.current = null;
        setActiveAvatar(null);
        return;
      }
      activeRef.current = nameJa;
      setActiveAvatar(nameJa);
      onSearch(`${nameJa} 対応`, { category: '3D衣装' });
    },
    [onSearch],
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, nameJa: string) => {
      e.preventDefault();
      setActiveAvatar(nameJa);
      onSearch(nameJa);
    },
    [onSearch],
  );

  if (isLoading || avatars.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-1 md:mb-2">
        <h3 className="text-[10px] md:text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {t.avatarFilter.title}
        </h3>
      </div>
      <div className="relative">
        <div
          className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin snap-x-mandatory -mx-3 px-3 md:mx-0 md:px-0"
          title={t.avatarFilter.clickHint}
        >
          {avatars.map((avatar) => (
            <AvatarChip
              key={avatar.name_ja}
              avatar={avatar}
              isActive={activeAvatar === avatar.name_ja}
              language={language}
              itemsLabel={t.avatarFilter.items}
              onClick={handleClick}
              onContextMenu={handleContextMenu}
            />
          ))}
        </div>
        {/* Right fade hint (mobile only) */}
        <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none md:hidden" />
      </div>
    </div>
  );
}
