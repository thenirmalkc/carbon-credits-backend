import { Body, Controller, Get, Param, Put, Query } from '@nestjs/common';
import { HistoryService } from './history.service';
import { GetHistoryQueryDto, UpdateHistoryStatusDto } from './history.dto';

@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get()
  getHistory(@Query() filter: GetHistoryQueryDto) {
    return this.historyService.getHistory(filter);
  }

  @Put(':id/status')
  updateHistoryStatus(
    @Param('id') id: string,
    @Body() body: UpdateHistoryStatusDto,
  ) {
    return this.historyService.updateHistoryStatus(id, body);
  }
}
