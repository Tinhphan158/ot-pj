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
} from '@nestjs/common';
import { CurrentUser } from '@/decorators';
import type { JwtPayload } from '@/common';
import { OvertimeService } from './overtime.service';
import { OvertimeResponseDto } from './overtime.response';
import { CreateOvertimeDto, QueryOvertimeRangeDto, UpdateOvertimeDto } from './dto';

@Controller('overtimes')
export class OvertimeController {
  constructor(private readonly overtimeService: OvertimeService) {}

  @Get('range')
  findByRange(@Query() query: QueryOvertimeRangeDto): Promise<OvertimeResponseDto[]> {
    return this.overtimeService.findByRange(query);
  }

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateOvertimeDto): Promise<OvertimeResponseDto> {
    return this.overtimeService.create(user.id, dto);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateOvertimeDto): Promise<OvertimeResponseDto> {
    return this.overtimeService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.overtimeService.remove(id);
  }
}
