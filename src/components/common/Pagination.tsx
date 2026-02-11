import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useI18n } from '../../lib/i18n';

interface Props {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: Props) {
  const { t } = useI18n();
  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <nav role="navigation" aria-label={t.a11y.paginationNav} className="flex items-center justify-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label={t.a11y.prevPage}
        className="min-h-[44px] md:min-h-0"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden md:inline">{t.common.prev}</span>
      </Button>

      {pages.map((page, idx) =>
        page === -1 ? (
          <span key={`ellipsis-${idx}`} className="px-2 text-gray-400" aria-hidden="true">
            ...
          </span>
        ) : (
          <Button
            key={page}
            variant={page === currentPage ? 'default' : 'ghost'}
            size="icon"
            onClick={() => onPageChange(page)}
            aria-label={t.a11y.pageN(page)}
            aria-current={page === currentPage ? 'page' : undefined}
            className={cn('w-10 h-10 md:w-8 md:h-8', page !== currentPage && 'text-gray-600')}
          >
            {page}
          </Button>
        ),
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label={t.a11y.nextPage}
        className="min-h-[44px] md:min-h-0"
      >
        <span className="hidden md:inline">{t.common.next}</span>
        <ChevronRight className="w-4 h-4" />
      </Button>
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
