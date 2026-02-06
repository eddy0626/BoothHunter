import { useState } from 'react';
import { clsx } from 'clsx';
import { useI18n } from '../../lib/i18n';
import { usePopularAvatars } from '../../hooks/usePopularAvatars';

interface Props {
  onSearch: (keyword: string, extra?: { category?: string }) => void;
}

export default function AvatarQuickFilter({ onSearch }: Props) {
  const { avatars, isLoading } = usePopularAvatars();
  const [activeAvatar, setActiveAvatar] = useState<string | null>(null);
  const { t } = useI18n();

  if (isLoading || avatars.length === 0) return null;

  const handleClick = (nameJa: string) => {
    const keyword = `${nameJa} 対応`;
    if (activeAvatar === nameJa) {
      setActiveAvatar(null);
      return;
    }
    setActiveAvatar(nameJa);
    onSearch(keyword, { category: '3D衣装' });
  };

  const handleContextMenu = (e: React.MouseEvent, nameJa: string) => {
    e.preventDefault();
    setActiveAvatar(nameJa);
    onSearch(nameJa);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {t.avatarFilter.title}
        </h3>
      </div>
      <div
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin"
        title={t.avatarFilter.clickHint}
      >
        {avatars.map((avatar) => (
          <button
            key={avatar.name_ja}
            onClick={() => handleClick(avatar.name_ja)}
            onContextMenu={(e) => handleContextMenu(e, avatar.name_ja)}
            className={clsx(
              'shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
              activeAvatar === avatar.name_ja
                ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300',
            )}
            aria-label={`${avatar.name_ko} (${avatar.name_ja})${avatar.item_count > 0 ? ` - ${avatar.item_count} ${t.avatarFilter.items}` : ''}`}
            aria-pressed={activeAvatar === avatar.name_ja}
            title={`${avatar.name_ko} (${avatar.name_ja})`}
          >
            <span>{avatar.name_ko}</span>
            {avatar.item_count > 0 && (
              <span className="text-[10px] text-gray-400">
                {avatar.item_count} {t.avatarFilter.items}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
