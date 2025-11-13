import { Controller, Get, Query } from '@nestjs/common';
import { HistoryService } from './history.service';
import { GetHistoryQueryDto } from './history.dto';

@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get()
  getHistory(@Query() filter: GetHistoryQueryDto) {
    return this.historyService.getHistory(filter);
  }
}
