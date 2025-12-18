import { HttpException, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ProjectDocument, ProjectEntity } from './entity/project.entity';
import { Connection, Model, PipelineStage, Types } from 'mongoose';
import {
  ProjectDocumentsDocument,
  ProjectDocumentsEntity,
} from './entity/project-document.entity';
import {
  CalculateCarbonCreditsIn,
  CreateTverProjectIn,
  GetProjectsQuery,
  GetSolarMeterLogsQuery,
  UpdatePddTemplateIn,
  UpdateProjectIn,
  UploadSolarMeterLogsIn,
} from './project.dto';
import { FileUploadService } from '../file-upload/file-upload.service';
import fs from 'fs';
import path from 'path';
import { OpenaiService } from 'src/common/services/openai.service';
import pl from 'nodejs-polars';
import { MyHttpService } from 'src/common/services/my-http.service';
import {
  SolarMeterLogsDocument,
  SolarMeterLogsEntity,
} from './entity/solar-meter-logs.entity';

@Injectable()
export class ProjectService {
  private readonly tverTemplate: string;

  constructor(
    @InjectConnection() private readonly mongoConn: Connection,
    @InjectModel(ProjectEntity.name)
    private readonly projectModel: Model<ProjectDocument>,
    @InjectModel(ProjectDocumentsEntity.name)
    private readonly projectDocumentsModel: Model<ProjectDocumentsDocument>,
    @InjectModel(SolarMeterLogsEntity.name)
    private readonly solarMeterLogsModel: Model<SolarMeterLogsDocument>,
    private readonly fileUploadService: FileUploadService,
    private readonly openaiService: OpenaiService,
    private readonly myHttpService: MyHttpService,
  ) {
    this.tverTemplate = fs
      .readFileSync(path.join(__dirname, '../../templates/tver-template.html'))
      .toString();
  }

  async createTverProject(body: CreateTverProjectIn) {
    const session = await this.mongoConn.startSession();
    return session.withTransaction(async () => {
      const obj = await this.projectModel.create([body], { session });
      const projectId = obj[0]._id;
      if (body.documents && body.documents.length) {
        body.documents.forEach((doc) => {
          doc.projectId = projectId;
        });
        await this.projectDocumentsModel.create(body.documents, {
          session,
          ordered: true,
        });
      }
      return projectId;
    });
  }

  async updateProject(id: string, body: UpdateProjectIn) {
    const projectId = new Types.ObjectId(id);
    const session = await this.mongoConn.startSession();
    return session.withTransaction(async () => {
      const documents = body.documents;
      delete body._id;
      const updated = await this.projectModel.updateOne(
        {
          _id: projectId,
          deletedAt: { $exists: false },
        },
        { $set: body },
        { session },
      );
      if (Array.isArray(documents)) {
        const documentIds = documents.map((x) => x._id).filter((x) => !!x);
        await this.projectDocumentsModel.deleteMany(
          {
            _id: { $nin: documentIds },
            projectId: projectId,
          },
          { session },
        );
        for (const document of documents) {
          if (document._id) {
            const documentId = document._id;
            delete document._id;
            await this.projectDocumentsModel.updateOne(
              { _id: documentId },
              { $set: document },
              { session },
            );
          } else {
            document.projectId = projectId;
            await this.projectDocumentsModel.create([document], { session });
          }
        }
      }
      return updated.matchedCount;
    });
  }

  async getProject(id: string, join: Record<string, true> = {}) {
    const joinDocuments: PipelineStage[] = [];
    if (join['documents']) {
      joinDocuments.push({
        $lookup: {
          from: 'project_documents',
          localField: '_id',
          foreignField: 'projectId',
          as: 'documents',
        },
      });
    }

    const projects = await this.projectModel.aggregate<ProjectEntity>([
      {
        $match: {
          _id: new Types.ObjectId(id),
          deletedAt: { $exists: false },
        },
      },
      ...joinDocuments,
      {
        $lookup: {
          from: 'user',
          localField: 'verifiedById',
          foreignField: '_id',
          as: 'verifiedBy',
          pipeline: [{ $project: { _id: 1, firstName: 1, lastName: 1 } }],
        },
      },
      {
        $lookup: {
          from: 'user',
          localField: 'createdById',
          foreignField: '_id',
          as: 'createdBy',
          pipeline: [{ $project: { _id: 1, firstName: 1, lastName: 1 } }],
        },
      },
      {
        $lookup: {
          from: 'user',
          localField: 'updatedById',
          foreignField: '_id',
          as: 'updatedBy',
          pipeline: [{ $project: { _id: 1, firstName: 1, lastName: 1 } }],
        },
      },
      {
        $addFields: {
          verifiedBy: { $arrayElemAt: ['$verifiedBy', 0] },
          createdBy: { $arrayElemAt: ['$createdBy', 0] },
          updatedBy: { $arrayElemAt: ['$updatedBy', 0] },
        },
      },
      {
        $project: {
          pddTemplate: 0,
          __v: 0,
          'documents.__v': 0,
        },
      },
    ]);
    if (!projects.length) return null;
    if (join['documents']) {
      await this.fileUploadService.populateUrls(projects, ['filePath']);
    }
    return projects[0];
  }

  async getProjects(filter: GetProjectsQuery) {
    const matchStage: Record<string, any> = {
      deletedAt: { $exists: false },
    };
    if (filter.projectType) {
      matchStage['projectType'] = filter.projectType;
    }
    if (filter.projectStandard) {
      matchStage['projectStandard'] = filter.projectStandard;
    }
    if (filter.myUserId) {
      matchStage['createdById'] = filter.myUserId;
    }
    const totalP = this.projectModel.aggregate<{ total: number }>([
      { $match: matchStage },
      { $count: 'total' },
    ]);
    const itemsP = this.projectModel.aggregate<ProjectEntity>([
      { $match: matchStage },
      { $sort: { [filter.sortBy]: filter.order } },
      { $skip: filter.offset },
      { $limit: filter.limit },
      {
        $project: {
          _id: 1,
          projectType: 1,
          projectStandard: 1,
          projectId: 1,
          projectTitle: 1,
          carbonCredits: 1,
          projectOwners: 1,
          locations: 1,
          verificationStatus: 1,
          createdAt: 1,
        },
      },
    ]);
    const [total, items] = await Promise.all([totalP, itemsP]);
    return {
      total: total.length ? total[0].total : 0,
      items,
    };
  }

  async getPddTemplate(id: string) {
    const projects = await this.projectModel.aggregate<ProjectEntity>([
      {
        $match: {
          _id: new Types.ObjectId(id),
          deletedAt: { $exists: false },
        },
      },
      {
        $project: {
          _id: 1,
          pddTemplate: 1,
        },
      },
    ]);
    if (!projects.length) return null;
    projects[0].pddTemplate = projects[0].pddTemplate || '';
    return projects[0];
  }

  async updatePddTemplate(id: string, body: UpdatePddTemplateIn) {
    const updated = await this.projectModel.updateOne(
      {
        _id: new Types.ObjectId(id),
        deletedAt: { $exists: false },
      },
      { $set: body },
    );
    return updated.matchedCount;
  }

  async generatePddTemplate(id: string) {
    const project = await this.getPddTemplate(id);
    if (!project) {
      throw new HttpException('Project not found', 404);
    }
    // wip: generate pdd template
    // 1 generate pdd template using given data
    // 2 format pdd template
    // const formattedPddTemplate = await this.formatHtmlByAi(this.tverTemplate);
    const formattedPddTemplate = this.tverTemplate;
    await this.projectModel.updateOne(
      { _id: new Types.ObjectId(id) },
      { $set: { pddTemplate: formattedPddTemplate } },
    );
    return { pddTemplate: formattedPddTemplate };
  }

  async formatHtmlByAi(
    html: string,
    generated: string = '',
    attempts: number = 3,
  ): Promise<string> {
    attempts -= 1;
    if (attempts > 3) {
      throw new Error('Cannot set more that 3 attempts');
    }
    if (attempts < 0) {
      throw new Error('Failed to generate output within 3 attempts');
    }
    const systemPrompt = `You are an expert at styling HTML content using inline CSS. You focus on readability, proper spacing, consistent fonts, colors, and clean layout without changing the text content or HTML structure.`;
    let userPrompt = `TASK: You are provided with HTML content. Your goal is to apply high-quality inline CSS to make the content visually appealing, readable, and well-formatted.
Guidelines:
- Use readable fonts like Arial, Helvetica, or sans-serif.
- Set font sizes appropriate for headings, paragraphs, and tables.
- Add padding and margins to elements for spacing.
- Add borders or background colors for tables and sections where appropriate.
- Ensure text colors have good contrast with background.
- Do not change or remove any text content.
- Maintain the original HTML structure.
INPUT HTML:
[${html}]
OUTPUT: Return final HTML content with inline CSS applied. No other output is applied.`;
    if (generated) {
      userPrompt += `\nA portion of output has already been generated. Continue generating from: [${generated}]`;
    }
    const response = await this.openaiService.client.chat.completions.create({
      model: 'gpt-4.1-nano',
      temperature: 0,
      max_completion_tokens: 1500, // increased for detailed styling
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    });
    const output = response.choices[0].message?.content;
    if (!output) {
      throw new Error('Failed to generate output');
    }
    generated += output;
    if (response.choices[0].finish_reason === 'length') {
      return this.formatHtmlByAi(html, generated);
    }
    return generated;
  }

  async runScript() {
    // const systemPrompt = `You are an expert in HTML cleanup and sanitization.
    // TASK:
    // Given an HTML document, output the same document while preserving the original
    // element structure and text content, but removing the following:
    // - <style> tags
    // - <img> tags
    // - All class attributes
    // - All id attributes
    // - All style attributes (inline CSS)
    // INPUT:
    // [HTML content]
    // OUTPUT:
    // [Cleaned HTML content]
    // Rules:
    // - Do not add, rename, or reorder elements.
    // - Do not add new text or explanations.
    // - Remove specified tags entirely.
    // - Output only the resulting HTML. No other output is allowed.`;
    // const userPrompt = `INPUT: [${fs
    //   .readFileSync(path.join(__dirname, '../../templates/index.html'))
    //   .toString()}]`;
    // const response = await this.openaiService.client.chat.completions.create({
    //   model: 'gpt-4.1-mini',
    //   temperature: 0,
    //   messages: [
    //     { role: 'system', content: systemPrompt },
    //     { role: 'user', content: userPrompt },
    //   ],
    // });
    // const finishedReason = response.choices[0].finish_reason;
    // if (finishedReason !== 'stop') {
    //   throw new Error(`Finished reason: ${finishedReason}`);
    // }
    // const output = response.choices[0].message.content;
    // if (!output) {
    //   throw new Error('Failed to generate output');
    // }
    // fs.writeFileSync(
    //   path.join(__dirname, '../../templates/output.html'),
    //   output,
    // );
    // return true;
  }

  async uploadSolarMeterLogs(id: string, body: UploadSolarMeterLogsIn) {
    const url = await this.fileUploadService.getObjectSignedUrl(body.filePath);
    const res = await this.myHttpService.get<{ data: string }>({ url });
    const df = pl.readCSV(res.data);
    const rows = <[string, number, number, number][]>df.rows();
    if (!rows.length) return;
    const projectId = new Types.ObjectId(id);
    for (const row of rows) {
      const [dd, mm, yy] = row[0]
        .trim()
        .split('-')
        .map((x) => parseInt(x));
      const date = new Date(Date.UTC(yy, mm - 1, dd));
      date.setHours(0, 0, 0, 0);
      await this.solarMeterLogsModel.updateOne(
        { date, projectId },
        {
          $set: {
            date,
            projectId,
            createdById: body.createdById,
            totalProduction: row[1],
            onPeakProduction: row[2],
            offPeakProduction: row[3],
          },
        },
        { upsert: true },
      );
    }
  }

  async getSolarMeterLogs(id: string, filter: GetSolarMeterLogsQuery) {
    const projectId = new Types.ObjectId(id);
    const matchStage: Record<string, any> = { projectId };
    if (filter.dateFrom || filter.dateTo) {
      const dateFilter: Record<string, any> = {};
      if (filter.dateFrom) {
        dateFilter['$gte'] = filter.dateFrom;
      }
      if (filter.dateTo) {
        dateFilter['$lte'] = filter.dateTo;
      }
      matchStage['date'] = dateFilter;
    }

    const _totalP = this.solarMeterLogsModel.aggregate<{ total: number }>([
      { $match: matchStage },
      { $count: 'total' },
    ]);

    const itemsP = this.solarMeterLogsModel.aggregate<SolarMeterLogsEntity>([
      { $match: matchStage },
      { $sort: { date: -1 } },
      { $skip: filter.offset },
      { $limit: filter.limit },
      {
        $project: {
          _id: 1,
          date: 1,
          totalProduction: 1,
          onPeakProduction: 1,
          offPeakProduction: 1,
        },
      },
    ]);

    // ------------------------- calculation -------------------------
    const _grandTotalProductionP = this.solarMeterLogsModel.aggregate<{
      total: number;
    }>([
      { $match: { projectId } },
      {
        $group: {
          _id: '$projectId',
          total: { $sum: '$totalProduction' },
        },
      },
    ]);

    const _grandAvgProductionP = this.solarMeterLogsModel.aggregate<{
      total: number;
    }>([
      { $match: { projectId } },
      {
        $group: {
          _id: '$projectId',
          total: { $avg: '$totalProduction' },
        },
      },
    ]);

    const _totalProductionP = this.solarMeterLogsModel.aggregate<{
      total: number;
    }>([
      { $match: matchStage },
      {
        $group: {
          _id: '$projectId',
          total: { $sum: '$totalProduction' },
        },
      },
    ]);

    // xxxxxxxxxxxxxxxxxxxxxxxxx calculation xxxxxxxxxxxxxxxxxxxxxxxxx

    const [
      _total,
      items,
      _grandTotalProduction,
      _grandAvgProduction,
      _totalProduction,
    ] = await Promise.all([
      _totalP,
      itemsP,
      _grandTotalProductionP,
      _grandAvgProductionP,
      _totalProductionP,
    ]);

    const total = _total.length ? _total[0].total : 0;
    const grandTotalProduction = _grandTotalProduction.length
      ? _grandTotalProduction[0].total
      : 0;
    const grandAvgProduction = _grandAvgProduction.length
      ? _grandAvgProduction[0].total
      : 0;
    const totalProduction = _totalProduction.length
      ? _totalProduction[0].total
      : 0;
    const avgProduction = totalProduction / total;

    return {
      grandTotalProduction,
      grandAvgProduction,
      totalProduction,
      avgProduction,
      total,
      items,
    };
  }

  calculateCarbonCredits(id: string, body: CalculateCarbonCreditsIn) {
    const totalProductionMWh = body.totalProductionKWh / 1000;
    return {
      carbonCredits: body.emissionFactor * totalProductionMWh,
    };
  }
}
