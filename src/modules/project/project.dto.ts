import { PartialType, PickType } from '@nestjs/swagger';
import { ProjectEntity } from './entity/project.entity';
import { ProjectDocumentsEntity } from './entity/project-document.entity';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BaseQueryDto } from 'src/common/dtos/base-query.dto';
import { ProjectStandardEnum, ProjectTypeEnum } from './project.enum';

export class CreateTverProjectIn extends PickType(ProjectEntity, [
  'projectType',
  'projectStandard',
  'standardYear',
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
  'userDescription',
  'projectId',
  'createdById',
] as const) {}

export class GetProjectsQuery extends BaseQueryDto {
  @IsEnum(ProjectTypeEnum)
  @IsOptional()
  projectType?: ProjectTypeEnum;

  @IsEnum(ProjectStandardEnum)
  @IsOptional()
  projectStandard?: ProjectStandardEnum;

  @IsString()
  @IsOptional()
  search?: string;
}

export class UpdateProjectIn extends PartialType(
  PickType(ProjectEntity, [
    '_id',
    'projectTitle',
    'additionalInfo',
    'projectOwners',
    'locations',
    'tver',
    'updatedById',
  ] as const),
) {
  @Type(() => UpdateProjectDocumentIn)
  @IsArray()
  @ValidateNested({ each: true })
  @IsOptional()
  documents?: UpdateProjectDocumentIn[];
}

export class UpdateProjectDocumentIn extends PartialType(
  PickType(ProjectDocumentsEntity, [
    '_id',
    'filePath',
    'userDescription',
    'projectId',
    'createdById',
    'updatedById',
  ] as const),
) {}

export class UpdatePddTemplateIn extends PickType(ProjectEntity, [
  'pddTemplate',
] as const) {}
