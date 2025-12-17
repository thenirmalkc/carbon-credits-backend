import { HttpException, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ProjectDocument, ProjectEntity } from './entity/project.entity';
import { Connection, Model, Types } from 'mongoose';
import {
  ProjectDocumentsDocument,
  ProjectDocumentsEntity,
} from './entity/project-document.entity';
import {
  CreateTverProjectIn,
  GetProjectsQuery,
  UpdatePddTemplateIn,
  UpdateProjectIn,
} from './project.dto';
import { FileUploadService } from '../file-upload/file-upload.service';
import fs from 'fs';
import path from 'path';
import { OpenaiService } from 'src/common/services/openai.service';

@Injectable()
export class ProjectService {
  private readonly tverTemplate: string;

  constructor(
    @InjectConnection() private readonly mongoConn: Connection,
    @InjectModel(ProjectEntity.name)
    private readonly projectModel: Model<ProjectDocument>,
    @InjectModel(ProjectDocumentsEntity.name)
    private readonly projectDocumentsModel: Model<ProjectDocumentsDocument>,
    private readonly fileUploadService: FileUploadService,
    private readonly openaiService: OpenaiService,
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

  async getProject(id: string) {
    const projects = await this.projectModel.aggregate<ProjectEntity>([
      {
        $match: {
          _id: new Types.ObjectId(id),
          deletedAt: { $exists: false },
        },
      },
      {
        $lookup: {
          from: 'project_documents',
          localField: '_id',
          foreignField: 'projectId',
          as: 'documents',
        },
      },
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
    await this.fileUploadService.populateUrls(projects, ['filePath']);
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
    const result = await this.projectModel.aggregate<ProjectEntity>([
      {
        $facet: {
          total: [{ $match: matchStage }, { $count: 'total' }],
          items: [
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
          ],
        },
      },
      {
        $addFields: {
          total: { $ifNull: [{ $arrayElemAt: ['$total.total', 0] }, 0] },
        },
      },
      { $project: { total: 1, items: 1 } },
    ]);
    return result[0];
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
    return { pddTemplate: await this.formatHtmlByAi(this.tverTemplate) };
  }

  async formatHtmlByAi(html: string) {
    const prompt = `You are an expert HTML styler.
Given an HTML snippet, apply inline CSS styles only to the specified elements and leave everything else unchanged.

RULES:
1) Apply this inline CSS to all <table> elements:
   border-collapse: collapse; width: 100%;
2) Apply this inline CSS to all <th> elements:
   border: 1px solid black; padding: 8px; background-color: #f2f2f2;
3) Apply this inline CSS to all <td> elements:
   border: 1px solid black; padding: 8px;

CONSTRAINTS:
- Do NOT modify text content.
- Do NOT add, remove, or reorder HTML elements.
- Do NOT add classes or external styles.
- Output only the updated HTML.

INPUT:
[${html}]`;
    const response = await this.openaiService.client.chat.completions.create({
      model: 'gpt-4.1-mini',
      temperature: 1,
      messages: [{ role: 'user', content: prompt }],
    });
    const output = response.choices[0].message.content;
    if (!output) {
      throw new Error('Failed to generate output');
    }
    return output;
  }
}
