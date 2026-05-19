import { useState, useMemo } from 'react';

function SortIcon({ direction }) {
  if (!direction) return <span className="sort-icon">&#8597;</span>;
  return (
    <span className="sort-icon active">
      {direction === 'asc' ? '↑' : '↓'}
    </span>
  );
}

function SkeletonRows({ columns }) {
  return (
    <tbody>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i}>
          {columns.map((_, j) => (
            <td key={j}>
              <div
                className="skeleton"
                style={{ height: 14, width: `${60 + Math.random() * 30}%`, borderRadius: 4 }}
              />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

export default function DataTable({
  columns = [],
  data = [],
  searchable = false,
  onSearch,
  searchPlaceholder = 'Search...',
  loading = false,
  emptyMessage = 'No data found.',
  pageSize,
}) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const handleSort = (key) => {
    if (sortKey === key) {
      if (sortDir === 'asc') {
        setSortDir('desc');
      } else if (sortDir === 'desc') {
        setSortKey(null);
        setSortDir(null);
      }
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
    if (onSearch) onSearch(value);
  };

  const processedData = useMemo(() => {
    let result = [...data];

    if (searchTerm && !onSearch) {
      const term = searchTerm.toLowerCase();
      result = result.filter((row) =>
        columns.some((col) => {
          const val = row[col.key];
          return val != null && String(val).toLowerCase().includes(term);
        })
      );
    }

    if (sortKey) {
      result.sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
        }
        return sortDir === 'asc'
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      });
    }

    return result;
  }, [data, searchTerm, sortKey, sortDir, onSearch, columns]);

  const totalPages = pageSize ? Math.ceil(processedData.length / pageSize) : 1;
  const paginatedData = pageSize
    ? processedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : processedData;

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    pages.push(
      <button
        key="prev"
        className="page-btn"
        disabled={currentPage === 1}
        onClick={() => handlePageChange(currentPage - 1)}
      >
        &lsaquo;
      </button>
    );

    if (start > 1) {
      pages.push(
        <button key={1} className="page-btn" onClick={() => handlePageChange(1)}>
          1
        </button>
      );
      if (start > 2) {
        pages.push(
          <span key="ellipsis-start" className="page-btn" style={{ border: 'none', cursor: 'default' }}>
            ...
          </span>
        );
      }
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          className={`page-btn${i === currentPage ? ' active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push(
          <span key="ellipsis-end" className="page-btn" style={{ border: 'none', cursor: 'default' }}>
            ...
          </span>
        );
      }
      pages.push(
        <button
          key={totalPages}
          className="page-btn"
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </button>
      );
    }

    pages.push(
      <button
        key="next"
        className="page-btn"
        disabled={currentPage === totalPages}
        onClick={() => handlePageChange(currentPage + 1)}
      >
        &rsaquo;
      </button>
    );

    return <div className="pagination">{pages}</div>;
  };

  return (
    <div className="data-table-wrapper">
      {searchable && (
        <div className="data-table-toolbar">
          <div />
          <input
            type="text"
            className="search-input"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      )}
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={col.sortable !== false ? 'sortable' : ''}
                onClick={() => {
                  if (col.sortable !== false) handleSort(col.key);
                }}
              >
                {col.label}
                {col.sortable !== false && (
                  <SortIcon direction={sortKey === col.key ? sortDir : null} />
                )}
              </th>
            ))}
          </tr>
        </thead>
        {loading ? (
          <SkeletonRows columns={columns} />
        ) : paginatedData.length === 0 ? (
          <tbody>
            <tr>
              <td colSpan={columns.length}>
                <div className="empty-state">
                  <p>{emptyMessage}</p>
                </div>
              </td>
            </tr>
          </tbody>
        ) : (
          <tbody>
            {paginatedData.map((row, idx) => (
              <tr key={row.id || row._id || idx}>
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        )}
      </table>
      {renderPagination()}
    </div>
  );
}
