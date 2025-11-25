import React from 'react';
import { clsx } from 'clsx';

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface Props<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
}

export function DataTable<T>({ columns, data, emptyMessage = 'No data' }: Props<T>) {
  return (
    <div className="overflow-x-auto border border-border/70 rounded-xl">
      <table className="w-full text-sm">
        <thead className="bg-background-softer text-muted uppercase text-[11px] tracking-wide">
          <tr>
            {columns.map((col) => (
              <th key={String(col.key)} className={clsx('px-4 py-3 text-left font-semibold', col.className)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {data.length === 0 && (
            <tr>
              <td className="px-4 py-4 text-gray-400" colSpan={columns.length}>
                {emptyMessage}
              </td>
            </tr>
          )}
          {data.map((row, idx) => (
            <tr key={idx} className="hover:bg-white/5">
              {columns.map((col) => (
                <td key={String(col.key)} className={clsx('px-4 py-3 text-gray-100', col.className)}>
                  {col.render ? col.render(row) : (row as any)[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
