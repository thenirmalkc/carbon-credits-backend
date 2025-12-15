import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ProjectService } from './project.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateTverProjectIn } from './project.dto';

@ApiTags('Project')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post('tver')
  async createTverProject(@Body() body: CreateTverProjectIn) {
    const projectId = await this.projectService.createTverProject(body);
    return projectId.toString();
  }

  // @Get('tver-projects')
  // getTverProjects() {
  //   return this.projectService.getTverProjects();
  // }
  // @Get('tver-project/:id')
  // getTverProject(@Param('id') id: string) {
  //   return this.projectService.getTverProject(id);
  // }
  // @Get('tver-project/:id/generate-pdd')
  // async generateTverProjectTdd(@Param('id') id: string, @Res() res: Response) {
  //   const html = await this.projectService.generateTverProjectTdd(id);
  //   const output = await htmlToDocx(html);
  //   res.setHeader(
  //     'Content-Type',
  //     'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  //   );
  //   res.setHeader('Content-Disposition', `attachment; filename="test.docx"`);
  //   res.send(output);
  // }
  // @Get('tver-project/:id/pdd-template')
  // getPddTemplate(@Param('id') id: string) {
  //   return this.projectService.getPddTemplate(id);
  // }
}
