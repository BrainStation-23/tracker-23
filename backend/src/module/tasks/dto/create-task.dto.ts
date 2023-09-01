import { Labels } from '@prisma/client';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description: string;

  @Min(0)
  @IsNumber()
  @IsOptional()
  estimation: number;

  @IsDateString()
  @IsOptional()
  due: string;

  @IsOptional()
  @IsString()
  priority: string;

  @IsOptional()
  @IsString()
  status: string;

  @IsOptional()
  @IsArray()
  labels: Labels[];

  @IsOptional()
  isRecurrent: boolean;

  @IsOptional()
  @IsString()
  frequency: string;

  @IsOptional()
  @IsString()
  startTime: Date;

  @IsOptional()
  @IsString()
  endTime: Date;

  @IsOptional()
  @IsString()
  startDate: Date;

  @IsOptional()
  @IsString()
  endDate: Date;

  @IsNotEmpty()
  @IsNumber()
  projectId: number;

  @IsOptional()
  @IsString()
  projectName?: string;
}
