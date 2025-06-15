
import React, { memo, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { designTokens } from '@/utils/designTokens';

interface OptimizedTableProps<T> {
  data: T[];
  columns: Array<{
    key: keyof T;
    header: string;
    render?: (value: any, item: T) => React.ReactNode;
    className?: string;
  }>;
  loading?: boolean;
  maxHeight?: string;
  stickyHeader?: boolean;
}

function OptimizedTableComponent<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  maxHeight = "400px",
  stickyHeader = true
}: OptimizedTableProps<T>) {
  const memoizedRows = useMemo(() => {
    return data.map((item, index) => (
      <TableRow 
        key={index} 
        className="hover:bg-gray-50/80 transition-colors duration-150 h-8 max-h-8"
      >
        {columns.map((column) => (
          <TableCell 
            key={String(column.key)} 
            className={`py-2 ${column.className || ''}`}
          >
            {column.render ? column.render(item[column.key], item) : item[column.key]}
          </TableCell>
        ))}
      </TableRow>
    ));
  }, [data, columns]);

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div 
      className="relative w-full overflow-auto border border-gray-200 rounded-lg"
      style={{ maxHeight }}
    >
      <Table>
        <TableHeader className={stickyHeader ? "sticky top-0 z-10 bg-white" : ""}>
          <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100">
            {columns.map((column) => (
              <TableHead 
                key={String(column.key)} 
                className="font-bold text-gray-800 py-3"
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {memoizedRows}
        </TableBody>
      </Table>
    </div>
  );
}

export const OptimizedTable = memo(OptimizedTableComponent) as <T extends Record<string, any>>(
  props: OptimizedTableProps<T>
) => JSX.Element;
