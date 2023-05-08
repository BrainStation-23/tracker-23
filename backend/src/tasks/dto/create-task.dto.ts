import { Frequency, Priority, Status } from '@prisma/client';
import {
  IsArray,
  IsDateString,
  IsEnum,
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
  @IsEnum(Priority)
  priority: Priority;

  @IsOptional()
  @IsString()
  @IsEnum(Status)
  status: Status;

  @IsOptional()
  @IsArray()
  labels: string[];

  @IsOptional()
  isRecurrent: boolean;

  @IsOptional()
  @IsString()
  frequency: Frequency;

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
}
