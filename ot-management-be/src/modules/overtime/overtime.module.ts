import { Module } from '@nestjs/common';
import { OvertimeController } from './overtime.controller';
import { OvertimeService } from './overtime.service';
import { OvertimeRepository } from './overtime.repository';
import { OvertimeGateway } from './overtime.gateway';
import { OvertimeExportService } from './overtime-export.service';

@Module({
  controllers: [OvertimeController],
  providers: [OvertimeService, OvertimeExportService, OvertimeRepository, OvertimeGateway],
  exports: [OvertimeService, OvertimeRepository],
})
export class OvertimeModule {}
