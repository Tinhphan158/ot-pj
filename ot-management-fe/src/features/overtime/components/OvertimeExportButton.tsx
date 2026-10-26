'use client';

import { useState } from 'react';
import { FileSpreadsheet, Loader2 } from 'lucide-react';
import { overtimeService } from '@/shared/api';
import { Button } from '@/shared/components/ui/button';
import { notify } from '@/shared/utils/notify';
import { getErrorMessage } from '@/shared/utils/api-error';

interface OvertimeExportButtonProps {
  /** Inclusive start, YYYY-MM-DD. */
  from: string;
  /** Exclusive end, YYYY-MM-DD. */
  to: string;
  /** Limit the export to one member. */
  userId?: string;
  fileName?: string;
}

/** Downloads the payroll workbook (summary by day type + every entry) for the range. */
export function OvertimeExportButton({ from, to, userId, fileName }: OvertimeExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await overtimeService.exportXlsx(from, to, userId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName ?? `overtime_${from}_${to}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      notify({ type: 'error', title: 'Export failed', description: getErrorMessage(error) });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting}>
      {isExporting ? <Loader2 className="size-4 animate-spin" /> : <FileSpreadsheet className="size-4" />}
      Export Excel
    </Button>
  );
}
