// app/components/Pagination.tsx
'use client';

import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
                                                   currentPage,
                                                   totalPages,
                                                   onPageChange
                                               }) => {
    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;

        if (totalPages <= maxPagesToShow) {
            // Show all pages if total is less than our max
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            // Calculate start and end of page range around current page
            let start = Math.max(2, currentPage - 1);
            let end = Math.min(totalPages - 1, currentPage + 1);

            // Adjust if we're near the start or end
            if (currentPage <= 2) {
                end = Math.min(totalPages - 1, maxPagesToShow - 1);
            } else if (currentPage >= totalPages - 2) {
                start = Math.max(2, totalPages - maxPagesToShow + 2);
            }

            // Add ellipsis before middle pages if needed
            if (start > 2) {
                pages.push('ellipsis-start');
            }

            // Add middle pages
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            // Add ellipsis after middle pages if needed
            if (end < totalPages - 1) {
                pages.push('ellipsis-end');
            }

            // Always show last page
            if (totalPages > 1) {
                pages.push(totalPages);
            }
        }

        return pages;
    };

    return (
        <div className="flex items-center justify-center space-x-1 my-8">
            {/* Previous button */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded ${
                    currentPage === 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-blue-600 hover:bg-blue-100'
                }`}
            >
                Previous
            </button>

            {/* Page numbers */}
            {getPageNumbers().map((page, index) => {
                if (page === 'ellipsis-start' || page === 'ellipsis-end') {
                    return (
                        <span key={`${page}-${index}`} className="px-3 py-1">
              ...
            </span>
                    );
                }

                return (
                    <button
                        key={`page-${page}`}
                        onClick={() => onPageChange(Number(page))}
                        className={`px-3 py-1 rounded ${
                            currentPage === page
                                ? 'bg-blue-600 text-white'
                                : 'text-blue-600 hover:bg-blue-100'
                        }`}
                    >
                        {page}
                    </button>
                );
            })}

            {/* Next button */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded ${
                    currentPage === totalPages
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-blue-600 hover:bg-blue-100'
                }`}
            >
                Next
            </button>
        </div>
    );
};

export default Pagination;