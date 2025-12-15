import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ProjectDocument, ProjectEntity } from './entity/project.entity';
import { Connection, Model, Types } from 'mongoose';
import {
  ProjectDocumentsDocument,
  ProjectDocumentsEntity,
} from './entity/project-document.entity';
import { CreateTverProjectIn } from './project.dto';
import { FileUploadService } from '../file-upload/file-upload.service';

@Injectable()
export class ProjectService {
  constructor(
    @InjectConnection() private readonly mongoConn: Connection,
    @InjectModel(ProjectEntity.name)
    private readonly projectModel: Model<ProjectDocument>,
    @InjectModel(ProjectDocumentsEntity.name)
    private readonly projectDocumentsModel: Model<ProjectDocumentsDocument>,
    private readonly fileUploadService: FileUploadService,
  ) {}

  async createTverProject(body: CreateTverProjectIn) {
    const session = await this.mongoConn.startSession();
    return session.withTransaction(async () => {
      const obj = await this.projectModel.create([body], { session });
      const projectId = obj[0]._id;
      if (body.documents && body.documents.length) {
        body.documents.forEach((doc) => {
          doc.projectId = projectId;
        });
        await this.projectDocumentsModel.create(body.documents, { session });
      }
      return projectId;
    });
  }

  async getProject(id: string) {
    const projects = await this.projectModel.aggregate<ProjectEntity>([
      { $match: { _id: new Types.ObjectId(id) } },
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
}
