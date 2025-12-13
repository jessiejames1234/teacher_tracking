// src/components/ui/Table.jsx
import { useMemo, useState } from "react";

/**
 * Reusable Table with client-side pagination.
 *
 * Props:
 * - columns: [{ key: 'field', label: 'Header', render?: (row) => JSX }]
 * - data:    array of rows (objects)
 * - pageSize?: number (default 10)
 * - striped?: boolean
 * - hover?: boolean
 * - small?: boolean
 * - loading?: boolean
 * - emptyText?: string
 */
export default function Table({
  columns = [],
  data = [],
  pageSize = 10,
  striped = true,
  hover = true,
  small = false,
  loading = false,
  emptyText = "No records found",
}) {
  const [currentPage, setCurrentPage] = useState(1);

  const total = data.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Clamp current page so it’s always in range
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);

  const pageData = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, safeCurrentPage, pageSize]);

  const goToPage = (page) => {
    const target = Math.min(Math.max(page, 1), totalPages);
    setCurrentPage(target);
  };

  const tableClassNames = [
    "table",
    striped ? "table-striped" : "",
    hover ? "table-hover" : "",
    small ? "table-sm" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div>
      {/* Table */}
      <div className="table-responsive">
        <table className={tableClassNames}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key || col.label}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={columns.length} className="text-center py-3">
                  Loading...
                </td>
              </tr>
            )}

            {!loading && pageData.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="text-center py-3">
                  {emptyText}
                </td>
              </tr>
            )}

            {!loading &&
              pageData.map((row, idx) => (
                <tr key={row.user_id || row.id || row.key || idx}>
                  {columns.map((col) => (
                    <td key={col.key || col.label}>
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center">
          <div className="text-muted small">
            Showing{" "}
            <strong>
              {total === 0
                ? 0
                : (safeCurrentPage - 1) * pageSize + 1}
            </strong>{" "}
            to{" "}
            <strong>
              {Math.min(safeCurrentPage * pageSize, total)}
            </strong>{" "}
            of <strong>{total}</strong> entries
          </div>

          <nav>
            <ul
              className="pagination mb-0"
              style={{
                // make active page green (Bootstrap 5 CSS vars)
                "--bs-pagination-active-bg": "#198754",
                "--bs-pagination-active-border-color": "#198754",
              }}
            >
              <li
                className={`page-item ${
                  safeCurrentPage === 1 ? "disabled" : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() => goToPage(safeCurrentPage - 1)}
                >
                  Previous
                </button>
              </li>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <li
                    key={page}
                    className={`page-item ${
                      page === safeCurrentPage ? "active" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => goToPage(page)}
                    >
                      {page}
                    </button>
                  </li>
                )
              )}

              <li
                className={`page-item ${
                  safeCurrentPage === totalPages ? "disabled" : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() => goToPage(safeCurrentPage + 1)}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}
