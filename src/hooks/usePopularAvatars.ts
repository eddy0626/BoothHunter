import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getPopularAvatars,
  needsUpdate,
  updateAvatarData,
  type PopularAvatar,
} from '../lib/popular-avatars';

// Module-level lock to prevent concurrent background updates across hook instances.
// The flag is always reset in a finally block, so it cannot get stuck.
let updateInProgress = false;

export function usePopularAvatars() {
  const query = useQuery<PopularAvatar[]>({
    queryKey: ['popular-avatars'],
    queryFn: getPopularAvatars,
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  const refetchRef = useRef(query.refetch);
  refetchRef.current = query.refetch;

  // Background update if data is stale (>7 days)
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        if (updateInProgress) return;
        if (!(await needsUpdate())) return;
        if (controller.signal.aborted || updateInProgress) return;
        updateInProgress = true;
        try {
          await updateAvatarData();
          if (!controller.signal.aborted) {
            refetchRef.current();
          }
        } finally {
          updateInProgress = false;
        }
      } catch (e) {
        updateInProgress = false;
        console.error('Background avatar update failed:', e);
      }
    })();
    return () => {
      controller.abort();
    };
  }, []);

  return {
    avatars: query.data ?? [],
    isLoading: query.isLoading,
  };
}
