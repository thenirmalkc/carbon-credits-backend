import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateTverProjectIn } from './project.dto';
import { Response } from 'express';
import htmlToDocx from '@turbodocx/html-to-docx';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post('tver-project')
  createTverProject(@Body() body: CreateTverProjectIn) {
    return this.projectService.createTverProject(body);
  }

  @Get('tver-projects')
  getTverProjects() {
    return this.projectService.getTverProjects();
  }

  @Get('tver-project/:id')
  getTverProject(@Param('id') id: string) {
    return this.projectService.getTverProject(id);
  }

  @Get('tver-project/:id/generate-pdd')
  async generateTverProjectTdd(@Param('id') id: string, @Res() res: Response) {
    const html = await this.projectService.generateTverProjectTdd(id);
    const output = await htmlToDocx(html);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    );
    res.setHeader('Content-Disposition', `attachment; filename="test.docx"`);
    res.send(output);
  }

  @Get('tver-project/:id/pdd-template')
  getPddTemplate(@Param('id') id: string) {
    return this.projectService.getPddTemplate(id);
  }
}
