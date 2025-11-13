import { useState } from 'react';

export const Table = ({ 
  headers, 
  data, 
  renderRow,
  emptyMessage = 'Tidak ada data',
  className = '',
  sortable = false,
  onSort
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (headerIndex, headerText) => {
    if (!sortable) return;

    let direction = 'asc';
    if (sortConfig.key === headerIndex && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    setSortConfig({ key: headerIndex, direction });
    
    if (onSort) {
      onSort(headerIndex, direction, headerText);
    }
  };

  const getSortIcon = (headerIndex) => {
    if (!sortable || sortConfig.key !== headerIndex) {
      return (
        <svg className="w-4 h-4 ml-1 text-gray-400 opacity-0 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }

    return sortConfig.direction === 'asc' ? (
      <svg className="w-4 h-4 ml-1 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 ml-1 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gradient-to-r from-cyan-600 to-cyan-700">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                onClick={() => handleSort(index, header)}
                className={`px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider ${
                  sortable ? 'cursor-pointer hover:bg-cyan-800 transition-colors group' : ''
                }`}
              >
                <div className="flex items-center">
                  <span>{header}</span>
                  {sortable && getSortIcon(index)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data && data.length > 0 ? (
            data.map((item, index) => renderRow(item, index))
          ) : (
            <tr>
              <td 
                colSpan={headers.length} 
                className="px-6 py-8 text-center text-gray-500"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
