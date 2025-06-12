
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NewClientData, TableData } from '@/types/dashboard';

interface NewClientDataTableProps {
  data: NewClientData[] | TableData[];
  title?: string;
  maxRows?: number;
  className?: string;
}

export const NewClientDataTable: React.FC<NewClientDataTableProps> = ({
  data,
  title,
  maxRows = 50,
  className = ''
}) => {
  console.log('NewClientDataTable rendering with:', { 
    dataLength: data.length, 
    title, 
    maxRows,
    sampleData: data.slice(0, 2)
  });

  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        {title && (
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get headers from the first data item
  const headers = Object.keys(data[0]);
  const displayData = data.slice(0, maxRows);

  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="overflow-auto max-h-96">
          <Table>
            <TableHeader>
              <TableRow>
                {headers.map((header) => (
                  <TableHead key={header} className="font-medium">
                    {header.charAt(0).toUpperCase() + header.slice(1).replace(/([A-Z])/g, ' $1')}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayData.map((row, index) => (
                <TableRow key={index}>
                  {headers.map((header) => (
                    <TableCell key={header} className="text-sm">
                      {typeof row[header] === 'number' 
                        ? row[header].toLocaleString() 
                        : String(row[header] || '')
                      }
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {data.length > maxRows && (
          <div className="text-sm text-muted-foreground mt-2 text-center">
            Showing {maxRows} of {data.length} records
          </div>
        )}
      </CardContent>
    </Card>
  );
};
