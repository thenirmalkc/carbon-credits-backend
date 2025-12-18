import {
  Body,
  Controller,
  Get,
  HttpException,
  Param,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ProjectService } from './project.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CalculateCarbonCreditsIn,
  CreateTverProjectIn,
  GetProjectsQuery,
  GetSolarMeterLogsQuery,
  UpdatePddTemplateIn,
  UpdateProjectIn,
  UploadSolarMeterLogsIn,
} from './project.dto';
import htmlToDocx from '@turbodocx/html-to-docx';
import { Response } from 'express';
import { BypassAuth } from '../auth/decorators/bypass-auth.decorator';
import { User } from '../auth/decorators/user.decorator';
import { UserI } from 'src/common/types';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/role.decorator';
import { UserRoleEnum } from '../user/user.enum';

@ApiTags('Project')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  // for testing purpose only
  @BypassAuth()
  @Post('run-script')
  runScript() {
    return this.projectService.runScript();
  }

  @Roles(UserRoleEnum.ADMIN)
  @Get()
  getProjects(@Query() filter: GetProjectsQuery) {
    return this.projectService.getProjects(filter);
  }

  @Get('my-projects')
  getMyProjects(@Query() filter: GetProjectsQuery, @User() user: UserI) {
    filter.myUserId = user._id;
    return this.projectService.getProjects(filter);
  }

  @BypassAuth()
  @Get('public-projects')
  getPublicProjects(@Query() filter: GetProjectsQuery) {
    return this.projectService.getProjects(filter);
  }

  @Post('tver')
  async createTverProject(@Body() body: CreateTverProjectIn) {
    body.standardYear = '2025';
    const projectId = await this.projectService.createTverProject(body);
    return this.projectService.getProject(projectId.toString(), {
      documents: true,
    });
  }

  @Put(':id')
  async updateProject(@Param('id') id: string, @Body() body: UpdateProjectIn) {
    const updated = await this.projectService.updateProject(id, body);
    if (!updated) {
      throw new HttpException('Failed to update', 400);
    }
    return this.projectService.getProject(id, { documents: true });
  }

  @Get(':id')
  async getProject(@Param('id') id: string) {
    const project = await this.projectService.getProject(id, {
      documents: true,
    });
    if (!project) {
      throw new HttpException('Project not found', 404);
    }
    return project;
  }

  @BypassAuth()
  @Get(':id/public')
  async getPublicProject(@Param('id') id: string) {
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

  @Post(':id/generate')
  async generatePddTemplate(@Param('id') id: string, @Res() res: Response) {
    const { pddTemplate } = await this.projectService.generatePddTemplate(id);
    // convert to buffer
    let buffer = await htmlToDocx(pddTemplate);
    if (buffer instanceof ArrayBuffer) {
      buffer = Buffer.from(buffer);
    } else if (buffer instanceof Blob) {
      buffer = Buffer.from(await buffer.arrayBuffer());
    }
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': 'attachment; filename="pdd.docx"',
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @BypassAuth()
  @Get(':id/solar-meter-logs')
  async getSolarMeterLogs(
    @Param('id') id: string,
    @Query() filter: GetSolarMeterLogsQuery,
  ) {
    return this.projectService.getSolarMeterLogs(id, filter);
  }

  @Post(':id/upload-solar-meter-logs')
  async uploadSolarMeterLogs(
    @Param('id') id: string,
    @Body() body: UploadSolarMeterLogsIn,
  ) {
    await this.projectService.uploadSolarMeterLogs(id, body);
    return true;
  }

  @BypassAuth()
  @Post(':id/calculate-carbon-credits')
  calculateCarbonCredits(
    @Param('id') id: string,
    @Body() body: CalculateCarbonCreditsIn,
  ) {
    return this.projectService.calculateCarbonCredits(id, body);
  }
}
