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
  UpdatePddTemplateIn,
  UpdateProjectIn,
} from './project.dto';

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

  @Get(':id/pdd-template')
  async getPddTemplate(@Param('id') id: string) {
    const project = await this.projectService.getPddTemplate(id);
    if (!project) {
      throw new HttpException('Project not found', 404);
    }
    return project;
  }

  @Put(':id/pdd-template')
  async updatePddTemplate(
    @Param('id') id: string,
    @Body() body: UpdatePddTemplateIn,
  ) {
    const updated = await this.projectService.updatePddTemplate(id, body);
    if (!updated) {
      throw new HttpException('Failed to update', 400);
    }
    return updated;
  }
}
