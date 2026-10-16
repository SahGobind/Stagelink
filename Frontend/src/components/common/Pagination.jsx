import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-between border-t border-brand-border px-4 py-4 sm:px-6 ${className}`}>
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 border border-brand-border text-xs font-semibold rounded-xl text-brand-navy bg-white hover:bg-gray-50 disabled:opacity-40 transition-colors"
        >
          Previous
        </button>
        <span className="text-xs text-brand-text-secondary self-center">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="relative inline-flex items-center px-4 py-2 border border-brand-border text-xs font-semibold rounded-xl text-brand-navy bg-white hover:bg-gray-50 disabled:opacity-40 transition-colors"
        >
          Next
        </button>
      </div>

      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <p className="text-xs text-brand-text-secondary">
          Showing page <span className="font-semibold text-brand-navy">{currentPage}</span> of{' '}
          <span className="font-semibold text-brand-navy">{totalPages}</span>
        </p>
        <nav className="isolate inline-flex -space-x-px rounded-xl shadow-subtle bg-white border border-brand-border overflow-hidden" aria-label="Pagination">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous page"
            className="relative inline-flex items-center px-3 py-2 text-gray-400 hover:bg-gray-50 hover:text-brand-navy disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {[...Array(totalPages)].map((_, idx) => {
            const page = idx + 1;
            const isActive = page === currentPage;
            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative inline-flex items-center px-3.5 py-2 text-xs font-semibold transition-colors ${
                  isActive
                    ? 'z-10 bg-brand-pink text-white font-bold'
                    : 'text-brand-navy hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            );
          })}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next page"
            className="relative inline-flex items-center px-3 py-2 text-gray-400 hover:bg-gray-50 hover:text-brand-navy disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </nav>
      </div>
    </div>
  );
};

export default Pagination;
