import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ProjectEntity } from './entity/project.entity';
import { Model } from 'mongoose';
import { ProjectDocument } from './entity/project-document.entity';
import { CreateTverProjectIn } from './project.dto';

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(ProjectEntity.name)
    private readonly projectModel: Model<ProjectDocument>,
  ) {}

  async createTverProject(body: CreateTverProjectIn) {
    const obj = await this.projectModel.create(body);
    return obj._id;
  }

  getProject(id: string) {
    return this.projectModel.findById(id).lean();
  }
}
