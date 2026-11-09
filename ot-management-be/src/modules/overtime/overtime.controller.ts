import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  StreamableFile,
} from '@nestjs/common';
import { CurrentUser } from '@/decorators';
import type { JwtPayload } from '@/common';
import { OvertimeService } from './overtime.service';
import { OvertimeExportService } from './overtime-export.service';
import type {
  OvertimeAuditPageResponseDto,
  OvertimeResponseDto,
  OvertimeRulesResponseDto,
  OvertimeUsageResponseDto,
} from './overtime.response';
import {
  CreateOvertimeDto,
  QueryOvertimeAuditDto,
  QueryOvertimeExportDto,
  QueryOvertimeRangeDto,
  QueryOvertimeUsageDto,
  UpdateOvertimeDto,
} from './dto';

@Controller('overtimes')
export class OvertimeController {
  constructor(
    private readonly overtimeService: OvertimeService,
    private readonly exportService: OvertimeExportService,
  ) {}

  @Get('range')
  findByRange(@Query() query: QueryOvertimeRangeDto): Promise<OvertimeResponseDto[]> {
    return this.overtimeService.findByRange(query);
  }

  @Get('rules')
  getRules(): OvertimeRulesResponseDto {
    return this.overtimeService.getRules();
  }

  @Get('usage')
  getUsage(@CurrentUser() user: JwtPayload, @Query() query: QueryOvertimeUsageDto): Promise<OvertimeUsageResponseDto> {
    return this.overtimeService.getUsage(user, query);
  }

  @Get('audit-logs')
  findAuditLogs(@Query() query: QueryOvertimeAuditDto): Promise<OvertimeAuditPageResponseDto> {
    return this.overtimeService.findAuditLogs(query);
  }

  @Get('export')
  async export(@Query() query: QueryOvertimeExportDto): Promise<StreamableFile> {
    const buffer = await this.exportService.exportXlsx(query);
    return new StreamableFile(buffer, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      disposition: `attachment; filename="overtime_${query.from}_${query.to}.xlsx"`,
    });
  }

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateOvertimeDto): Promise<OvertimeResponseDto> {
    return this.overtimeService.create(user, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOvertimeDto,
  ): Promise<OvertimeResponseDto> {
    return this.overtimeService.update(id, dto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.overtimeService.remove(id, user);
  }
}
