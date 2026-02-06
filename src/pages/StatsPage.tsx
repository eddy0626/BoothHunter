import { Heart, FolderOpen, Tag, Search } from 'lucide-react';
import { useStatistics } from '../hooks/useStatistics';
import { useI18n } from '../lib/i18n';

// ── Reusable bar component ────────────────────────────

function HorizontalBar({
  label,
  value,
  maxValue,
  color = 'bg-indigo-500',
}: {
  label: string;
  value: number;
  maxValue: number;
  color?: string;
}) {
  const pct = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-600 w-24 truncate text-right shrink-0">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
        <div
          className={`${color} h-full rounded-full transition-all duration-500`}
          style={{ width: `${Math.max(pct, 1)}%` }}
        />
      </div>
      <span className="text-xs font-medium text-gray-700 w-8 text-right shrink-0">{value}</span>
    </div>
  );
}

// ── Summary card ──────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4">
      <div className={`p-2.5 rounded-lg ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>
      {children}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────

export default function StatsPage() {
  const { stats, categories, prices, tags, searches, monthly, shops, isLoading, isError } =
    useStatistics();
  const { t } = useI18n();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <p className="text-lg">{t.common.error}</p>
      </div>
    );
  }

  const maxOf = (arr: { count: number }[]) => arr.reduce((m, x) => Math.max(m, x.count), 1);
  const catMax = maxOf(categories);
  const priceMax = maxOf(prices);
  const tagMax = maxOf(tags);
  const searchMax = maxOf(searches);
  const shopMax = maxOf(shops);
  const monthMax = maxOf(monthly);

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <h2 className="text-xl font-bold text-gray-900">{t.stats.title}</h2>

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Heart}
            label="즐겨찾기"
            value={stats?.favorites_count ?? 0}
            sub={`총 ¥${(stats?.total_value ?? 0).toLocaleString()}`}
            color="bg-pink-500"
          />
          <StatCard
            icon={FolderOpen}
            label="컬렉션"
            value={stats?.collections_count ?? 0}
            color="bg-indigo-500"
          />
          <StatCard icon={Tag} label="태그" value={stats?.tags_count ?? 0} color="bg-amber-500" />
          <StatCard
            icon={Search}
            label="총 검색"
            value={stats?.searches_count ?? 0}
            sub={stats?.avg_price ? `평균가 ¥${stats.avg_price.toLocaleString()}` : undefined}
            color="bg-emerald-500"
          />
        </div>

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category distribution */}
          <Section title="카테고리별 즐겨찾기">
            {categories.length === 0 ? (
              <p className="text-sm text-gray-400">데이터 없음</p>
            ) : (
              <div className="space-y-2">
                {categories.map((c) => (
                  <HorizontalBar
                    key={c.category}
                    label={c.category}
                    value={c.count}
                    maxValue={catMax}
                    color="bg-indigo-500"
                  />
                ))}
              </div>
            )}
          </Section>

          {/* Price distribution */}
          <Section title={t.stats.priceDistribution}>
            {prices.length === 0 ? (
              <p className="text-sm text-gray-400">{t.stats.noData}</p>
            ) : (
              <div className="space-y-2">
                {prices.map((p) => {
                  const priceLabel =
                    t.priceBuckets[p.label as keyof typeof t.priceBuckets] ?? `¥${p.label}`;
                  return (
                    <HorizontalBar
                      key={p.label}
                      label={priceLabel}
                      value={p.count}
                      maxValue={priceMax}
                      color="bg-emerald-500"
                    />
                  );
                })}
              </div>
            )}
          </Section>
        </div>

        {/* Charts row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top shops */}
          <Section title={t.stats.topShops}>
            {shops.length === 0 ? (
              <p className="text-sm text-gray-400">{t.stats.noData}</p>
            ) : (
              <div className="space-y-2">
                {shops.map((s) => (
                  <HorizontalBar
                    key={s.shop}
                    label={s.shop}
                    value={s.count}
                    maxValue={shopMax}
                    color="bg-violet-500"
                  />
                ))}
              </div>
            )}
          </Section>

          {/* Top tags */}
          <Section title={t.stats.topTags}>
            {tags.length === 0 ? (
              <p className="text-sm text-gray-400">{t.stats.noData}</p>
            ) : (
              <div className="space-y-2">
                {tags.map((tag) => (
                  <HorizontalBar
                    key={tag.tag}
                    label={tag.tag}
                    value={tag.count}
                    maxValue={tagMax}
                    color="bg-amber-500"
                  />
                ))}
              </div>
            )}
          </Section>
        </div>

        {/* Charts row 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly timeline */}
          <Section title={t.stats.monthlyFavorites}>
            {monthly.length === 0 ? (
              <p className="text-sm text-gray-400">{t.stats.noData}</p>
            ) : (
              <div className="flex items-end gap-1 h-40">
                {monthly.map((m) => {
                  const pct = monthMax > 0 ? (m.count / monthMax) * 100 : 0;
                  return (
                    <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[10px] text-gray-500 font-medium">{m.count}</span>
                      <div className="w-full bg-gray-100 rounded-t flex-1 relative">
                        <div
                          className="absolute bottom-0 w-full bg-pink-400 rounded-t transition-all duration-500"
                          style={{ height: `${Math.max(pct, 4)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-400 -rotate-45 origin-top-left whitespace-nowrap">
                        {m.month.slice(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Section>

          {/* Search history */}
          <Section title={t.stats.searchHistory}>
            {searches.length === 0 ? (
              <p className="text-sm text-gray-400">{t.stats.noData}</p>
            ) : (
              <div className="space-y-2">
                {searches.map((s) => (
                  <HorizontalBar
                    key={s.keyword}
                    label={s.keyword}
                    value={s.count}
                    maxValue={searchMax}
                    color="bg-cyan-500"
                  />
                ))}
              </div>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}
