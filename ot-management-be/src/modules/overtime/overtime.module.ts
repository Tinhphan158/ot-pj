import { Module } from '@nestjs/common';
import { OvertimeController } from './overtime.controller';
import { OvertimeService } from './overtime.service';
import { OvertimeRepository } from './overtime.repository';
import { OvertimeGateway } from './overtime.gateway';

@Module({
  controllers: [OvertimeController],
  providers: [OvertimeService, OvertimeRepository, OvertimeGateway],
  exports: [OvertimeService, OvertimeRepository],
})
export class OvertimeModule {}
