import { Module } from '@nestjs/common';
import { OvertimeController } from './overtime.controller';
import { OvertimeService } from './overtime.service';
import { OvertimeRepository } from './overtime.repository';

@Module({
  controllers: [OvertimeController],
  providers: [OvertimeService, OvertimeRepository],
  exports: [OvertimeService, OvertimeRepository],
})
export class OvertimeModule {}
