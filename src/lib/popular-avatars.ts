import {
  backgroundFetch,
  getPopularAvatars as getPopularAvatarsApi,
  checkAvatarsNeedUpdate,
  updatePopularAvatar,
  type PopularAvatar,
} from './booth-api';
import { parseSearchHtml } from './booth-parser';

export type { PopularAvatar };

export async function getPopularAvatars(): Promise<PopularAvatar[]> {
  return getPopularAvatarsApi();
}

export async function needsUpdate(): Promise<boolean> {
  return checkAvatarsNeedUpdate();
}

export async function updateAvatarData(): Promise<void> {
  const avatars = await getPopularAvatars();

  for (const avatar of avatars) {
    try {
      const keyword = `${avatar.name_ja} 対応`;
      const url = `https://booth.pm/ja/browse/${encodeURIComponent('3D衣装')}?q=${encodeURIComponent(keyword)}&page=1`;
      const resp = await backgroundFetch(url);
      if (!resp.ok) continue;

      const html = await resp.text();
      const { items, totalCount } = parseSearchHtml(html);

      const thumbnailUrl = items[0]?.images[0] ?? avatar.thumbnail_url;

      await updatePopularAvatar(avatar.id, totalCount ?? items.length, thumbnailUrl);
    } catch (e) {
      console.error(`Failed to update avatar ${avatar.name_ja}:`, e);
    }
  }
}
