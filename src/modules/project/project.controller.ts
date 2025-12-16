import {
  Body,
  Controller,
  Get,
  HttpException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ProjectService } from './project.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CreateTverProjectIn,
  GetProjectsQuery,
  UpdateProjectIn,
} from './project.dto';
import { BypassAuth } from '../auth/decorators/bypass-auth.decorator';

@ApiTags('Project')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  getProjects(@Query() filter: GetProjectsQuery) {
    return this.projectService.getProjects(filter);
  }

  @Post('tver')
  async createTverProject(@Body() body: CreateTverProjectIn) {
    body.standardYear = '2025';
    const projectId = await this.projectService.createTverProject(body);
    return this.projectService.getProject(projectId.toString());
  }

  @BypassAuth()
  @Put(':id')
  async updateProject(@Param('id') id: string, @Body() body: UpdateProjectIn) {
    const updated = await this.projectService.updateProject(id, body);
    if (!updated) {
      throw new HttpException('Failed to update', 400);
    }
    return this.projectService.getProject(id);
  }

  @Get(':id')
  async getProject(@Param('id') id: string) {
    const project = await this.projectService.getProject(id);
    if (!project) {
      throw new HttpException('Project not found', 404);
    }
    return project;
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
