import React from 'react';
import PropTypes from 'prop-types';
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';

/**
 * Pagination Component - Provides navigation controls for paginated content
 * 
 * @param {Number} currentPage - Current active page (1-based)
 * @param {Number} totalPages - Total number of pages
 * @param {Function} onPageChange - Callback when page changes
 * @param {Boolean} showFirstLast - Whether to show first/last page buttons
 * @param {Number} siblingCount - Number of sibling pages to show on each side
 */
const Pagination = ({ 
  currentPage = 1, 
  totalPages = 1, 
  onPageChange,
  showFirstLast = true,
  siblingCount = 1
}) => {
  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      onPageChange(newPage);
    }
  };
  
  // Generate page numbers to display
  const getPageNumbers = () => {
    // If we have 7 or fewer pages, show all pages
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    // Calculate start and end of page numbers with ellipsis
    let startPage = Math.max(1, currentPage - siblingCount);
    let endPage = Math.min(totalPages, currentPage + siblingCount);
    
    // Adjust to show more pages if we're at the start or end
    if (currentPage <= 3) {
      endPage = 5;
    } else if (currentPage >= totalPages - 2) {
      startPage = totalPages - 4;
    }
    
    // Build page numbers array with ellipsis
    const pages = [];
    
    // Always show first page
    pages.push(1);
    
    // Add ellipsis after first page if needed
    if (startPage > 2) {
      pages.push('...');
    }
    
    // Add page numbers between ellipsis
    for (let i = startPage; i <= endPage; i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i);
      }
    }
    
    // Add ellipsis before last page if needed
    if (endPage < totalPages - 1) {
      pages.push('...');
    }
    
    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };
  
  const pageNumbers = getPageNumbers();
  
  // Button styles
  const baseButtonStyles = "flex items-center justify-center w-10 h-10 text-sm text-neutral-600 transition-colors";
  const activeButtonStyles = "bg-primary-600 text-white rounded-md";
  const inactiveButtonStyles = "hover:bg-neutral-100 rounded-md";
  const disabledButtonStyles = "text-neutral-300 cursor-not-allowed";
  
  return (
    <nav className="flex items-center justify-center">
      <ul className="flex items-center space-x-1">
        {/* First page button */}
        {showFirstLast && (
          <li>
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className={`${baseButtonStyles} ${currentPage === 1 ? disabledButtonStyles : inactiveButtonStyles}`}
              aria-label="Go to first page"
            >
              <FiChevronsLeft size={20} />
            </button>
          </li>
        )}
        
        {/* Previous page button */}
        <li>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`${baseButtonStyles} ${currentPage === 1 ? disabledButtonStyles : inactiveButtonStyles}`}
            aria-label="Go to previous page"
          >
            <FiChevronLeft size={20} />
          </button>
        </li>
        
        {/* Page numbers */}
        {pageNumbers.map((pageNumber, index) => (
          <li key={index}>
            {pageNumber === '...' ? (
              <span className={`${baseButtonStyles}`}>...</span>
            ) : (
              <button
                onClick={() => handlePageChange(pageNumber)}
                className={`${baseButtonStyles} ${
                  pageNumber === currentPage ? activeButtonStyles : inactiveButtonStyles
                }`}
                aria-label={`Go to page ${pageNumber}`}
                aria-current={pageNumber === currentPage ? 'page' : undefined}
              >
                {pageNumber}
              </button>
            )}
          </li>
        ))}
        
        {/* Next page button */}
        <li>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`${baseButtonStyles} ${currentPage === totalPages ? disabledButtonStyles : inactiveButtonStyles}`}
            aria-label="Go to next page"
          >
            <FiChevronRight size={20} />
          </button>
        </li>
        
        {/* Last page button */}
        {showFirstLast && (
          <li>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className={`${baseButtonStyles} ${currentPage === totalPages ? disabledButtonStyles : inactiveButtonStyles}`}
              aria-label="Go to last page"
            >
              <FiChevronsRight size={20} />
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  showFirstLast: PropTypes.bool,
  siblingCount: PropTypes.number
};

export default Pagination; 