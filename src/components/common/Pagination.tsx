import { ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { useI18n } from '../../lib/i18n';

interface Props {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: Props) {
  const { t, language } = useI18n();
  const pages = getPageNumbers(currentPage, totalPages);

  const navLabel = language === 'ko' ? '검색 결과 페이지 탐색' : 'Search results pagination';
  const prevLabel = language === 'ko' ? '이전 페이지' : 'Previous page';
  const nextLabel = language === 'ko' ? '다음 페이지' : 'Next page';
  const pageLabel = (p: number) => (language === 'ko' ? `${p} 페이지` : `Page ${p}`);

  return (
    <nav role="navigation" aria-label={navLabel} className="flex items-center justify-center gap-1">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label={prevLabel}
        className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-4 h-4" />
        {t.common.prev}
      </button>

      {pages.map((page, idx) =>
        page === -1 ? (
          <span key={`ellipsis-${idx}`} className="px-2 text-gray-400" aria-hidden="true">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            aria-label={pageLabel(page)}
            aria-current={page === currentPage ? 'page' : undefined}
            className={clsx(
              'w-8 h-8 rounded-lg text-sm font-medium transition-colors',
              page === currentPage ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100',
            )}
          >
            {page}
          </button>
        ),
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label={nextLabel}
        className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {t.common.next}
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
}

function getPageNumbers(current: number, total: number): number[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: number[] = [1];

  if (current > 3) {
    pages.push(-1); // ellipsis
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) {
    pages.push(-1); // ellipsis
  }

  pages.push(total);

  return pages;
}
