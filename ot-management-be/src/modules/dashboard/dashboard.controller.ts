import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardResponseDto } from './dashboard.response';
import { QueryDashboardDto } from './dto';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  getStats(@Query() query: QueryDashboardDto): Promise<DashboardResponseDto> {
    return this.dashboardService.getStats(query);
  }
}
