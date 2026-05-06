import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}

export function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange,
  totalItems,
  itemsPerPage
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
      <div className="text-xs text-slate-600 dark:text-slate-300">
        Showing <span className="font-medium text-slate-900 dark:text-slate-200">{startItem}</span> to <span className="font-medium text-slate-900 dark:text-slate-200">{endItem}</span> of <span className="font-medium text-slate-900 dark:text-slate-200">{totalItems}</span> results
      </div>
      
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg hover:bg-white dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-slate-600 dark:text-slate-300 border border-transparent hover:border-slate-200 dark:hover:border-slate-600 hover:shadow-sm"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        <div className="flex items-center gap-1 px-2">
           {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
               // Logic to show a window of pages centered on current page if many pages
               let pageNum = i + 1;
               if (totalPages > 5) {
                   if (currentPage > 3) {
                       pageNum = currentPage - 2 + i;
                   }
                   if (pageNum > totalPages) {
                       pageNum = totalPages - (4 - i);
                   }
               }
               
               // Ensure we don't go out of bounds (simple clamp for edge cases)
               if (pageNum < 1) pageNum = i + 1; 

               return (
                   <button
                       key={pageNum}
                       onClick={() => onPageChange(pageNum)}
                       className={clsx(
                           "w-8 h-8 rounded-lg text-xs font-medium transition-all",
                           currentPage === pageNum
                               ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm"
                               : "text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 border border-transparent hover:border-slate-200 dark:hover:border-slate-600 hover:shadow-sm"
                       )}
                   >
                       {pageNum}
                   </button>
               );
           })}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg hover:bg-white dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-slate-600 dark:text-slate-300 border border-transparent hover:border-slate-200 dark:hover:border-slate-600 hover:shadow-sm"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}