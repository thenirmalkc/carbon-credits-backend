import { Body, Controller, Post } from '@nestjs/common';
import { CreateTVerPddIn } from './project.dto';
import { ProjectService } from './project.service';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post('tver-pdd')
  createTverPdd(@Body() body: CreateTVerPddIn) {
    return this.projectService.createTverPdd(body);
  }
}
