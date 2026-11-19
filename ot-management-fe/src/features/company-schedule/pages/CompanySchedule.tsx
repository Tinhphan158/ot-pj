'use client';

import { Download, ExternalLink, FileText } from 'lucide-react';
import { AppPageContainer, AppPageHeader } from '@/shared/components/custome';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';

/** Served from `public/`. To publish a new schedule, replace the file and update these. */
const SCHEDULE_PDF = '/company-schedule-2026-2027.pdf';
const SCHEDULE_DOWNLOAD_NAME = 'LỊCH HOẠT ĐỘNG 4.2026~6.2027.pdf';
const SCHEDULE_PERIOD = '01/04/2026 – 30/06/2027';

export default function CompanySchedule() {
  return (
    <AppPageContainer className="max-w-7xl">
      <AppPageHeader
        title="Company schedule"
        description={`Lịch hoạt động công ty từ ${SCHEDULE_PERIOD}: họp nội bộ, ngày nghỉ lễ, du lịch và sự kiện công ty.`}
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <a href={SCHEDULE_PDF} target="_blank" rel="noopener noreferrer">
                <ExternalLink />
                Open in new tab
              </a>
            </Button>
            <Button size="sm" asChild>
              <a href={SCHEDULE_PDF} download={SCHEDULE_DOWNLOAD_NAME}>
                <Download />
                Download
              </a>
            </Button>
          </>
        }
      />

      {/* Desktop/tablet: the browser's built-in PDF viewer. */}
      <Card className="hidden overflow-hidden py-0 sm:block">
        <iframe
          src={`${SCHEDULE_PDF}#view=FitH`}
          title="Lịch hoạt động công ty"
          className="block h-[calc(100vh-14rem)] min-h-[560px] w-full bg-muted"
        />
      </Card>

      {/* Phones: most mobile browsers can't render a PDF inside a page, so link out instead. */}
      <Card className="items-center gap-3 px-6 py-10 text-center sm:hidden">
        <FileText className="size-10 text-muted-foreground" />
        <p className="font-medium">Lịch hoạt động {SCHEDULE_PERIOD}</p>
        <p className="text-sm text-muted-foreground">Mở file PDF để xem lịch đầy đủ.</p>
        <Button asChild className="mt-2">
          <a href={SCHEDULE_PDF} target="_blank" rel="noopener noreferrer">
            <ExternalLink />
            View schedule
          </a>
        </Button>
      </Card>
    </AppPageContainer>
  );
}
