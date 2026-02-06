import { useQuery } from '@tanstack/react-query';
import { getAllStatistics } from '../lib/booth-api';

export function useStatistics() {
  const query = useQuery({
    queryKey: ['all-statistics'],
    queryFn: getAllStatistics,
  });

  const data = query.data;

  return {
    stats: data?.stats,
    categories: data?.categories ?? [],
    prices: data?.prices ?? [],
    tags: data?.tags ?? [],
    searches: data?.searches ?? [],
    monthly: data?.monthly ?? [],
    shops: data?.shops ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
