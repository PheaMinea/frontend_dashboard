import React, { useEffect, useMemo, useState } from 'react';
import {
  FiInbox,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
} from 'react-icons/fi';
import AdminLoading from './AdminLoading';
import { useLanguage } from '../../contexts/LanguageContext';

const AdminTable = ({
  columns = [],
  data = [],
  loading = false,
  itemsPerPage = 10,
  showPagination = true,
}) => {
  const { language } = useLanguage();
  const isKhmer = language === 'km' || language === 'kh';

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(itemsPerPage);

  // Reset to page 1 whenever data or search results change
  useEffect(() => {
    setCurrentPage(1);
  }, [data.length, pageSize]);

  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Ensure currentPage does not exceed totalPages
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedData = useMemo(() => {
    if (!showPagination) return data;
    const startIndex = (validCurrentPage - 1) * pageSize;
    return data.slice(startIndex, startIndex + pageSize);
  }, [data, validCurrentPage, pageSize, showPagination]);

  const startItem = totalItems === 0 ? 0 : (validCurrentPage - 1) * pageSize + 1;
  const endItem = Math.min(validCurrentPage * pageSize, totalItems);

  // Generate page numbers with ellipses
  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (validCurrentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }
    if (validCurrentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', validCurrentPage - 1, validCurrentPage, validCurrentPage + 1, '...', totalPages];
  }, [totalPages, validCurrentPage]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white">
        <AdminLoading compact label={isKhmer ? 'កំពុងផ្ទុកទិន្នន័យ...' : 'Loading data...'} />
      </div>
    );
  }

  if (totalItems === 0) {
    return (
      <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-6 text-center text-slate-500">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
          <FiInbox size={21} />
        </div>
        <p className="text-sm font-semibold">
          {isKhmer ? 'មិនមានទិន្នន័យទេ' : 'No data available'}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col">
      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="admin-table w-full">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((row, index) => (
              <tr key={row.id || index} className="hover:bg-slate-50/70 transition-colors">
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.render
                      ? col.render(row[col.key], row)
                      : row[col.key] || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {showPagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 border-t border-slate-100 bg-slate-50/40 text-xs text-slate-600">
          
          {/* Left: Entries Info & Page Size */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <span className="font-medium text-slate-500">
              {isKhmer
                ? `បង្ហាញពី ${startItem} ដល់ ${endItem} នៃ ${totalItems} ទិន្នន័យ`
                : `Showing ${startItem} to ${endItem} of ${totalItems} entries`}
            </span>

            {/* Page Size Selector */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
              <span className="text-slate-400 font-medium">{isKhmer ? 'ក្នុងមួយទំព័រ:' : 'Rows:'}</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-900 shadow-sm cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {/* Right: Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              {/* First Page */}
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                disabled={validCurrentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-blue-900 disabled:opacity-40 disabled:pointer-events-none transition-colors shadow-sm"
                title={isKhmer ? 'ទំព័រដំបូង' : 'First page'}
              >
                <FiChevronsLeft size={14} />
              </button>

              {/* Prev Page */}
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={validCurrentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-blue-900 disabled:opacity-40 disabled:pointer-events-none transition-colors shadow-sm"
                title={isKhmer ? 'ទំព័រមុន' : 'Previous page'}
              >
                <FiChevronLeft size={14} />
              </button>

              {/* Page Number Buttons */}
              <div className="flex items-center gap-1 mx-1">
                {pageNumbers.map((page, idx) => {
                  if (page === '...') {
                    return (
                      <span key={`dots-${idx}`} className="w-8 h-8 flex items-center justify-center text-slate-400 font-bold">
                        ...
                      </span>
                    );
                  }

                  const isActive = page === validCurrentPage;
                  return (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all shadow-sm ${
                        isActive
                          ? 'bg-blue-900 text-white border border-blue-900 shadow-blue-900/20'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-blue-900'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              {/* Next Page */}
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={validCurrentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-blue-900 disabled:opacity-40 disabled:pointer-events-none transition-colors shadow-sm"
                title={isKhmer ? 'ទំព័របន្ទាប់' : 'Next page'}
              >
                <FiChevronRight size={14} />
              </button>

              {/* Last Page */}
              <button
                type="button"
                onClick={() => setCurrentPage(totalPages)}
                disabled={validCurrentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-blue-900 disabled:opacity-40 disabled:pointer-events-none transition-colors shadow-sm"
                title={isKhmer ? 'ទំព័រចុងក្រោយ' : 'Last page'}
              >
                <FiChevronsRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminTable;
