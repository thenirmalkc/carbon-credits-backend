import { PickType } from '@nestjs/swagger';
import { ProjectEntity } from './entity/project.entity';
import { ProjectDocumentsEntity } from './entity/project-document.entity';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTverProjectIn extends PickType(ProjectEntity, [
  'projectType',
  'projectStandard',
  'projectTitle',
  'additionalInfo',
  'projectOwners',
  'locations',
  'tver',
  'createdById',
] as const) {
  @Type(() => CreateProjectDocumentIn)
  @IsArray()
  @ValidateNested({ each: true })
  @IsOptional()
  documents?: CreateProjectDocumentIn[];
}

export class CreateProjectDocumentIn extends PickType(ProjectDocumentsEntity, [
  'filePath',
  'filePath',
  'userDescription',
  'projectId',
  'createdById',
] as const) {}
