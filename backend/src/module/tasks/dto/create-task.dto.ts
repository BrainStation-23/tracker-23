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

  @IsNotEmpty()
  @IsNumber()
  projectId: number;

  @IsNotEmpty()
  @IsDate()
  startDate: Date;

  @IsOptional()
  isRecurrent: boolean;

  @IsOptional()
  @IsNumber()
  repeat: number;

  @IsOptional()
  @IsString()
  repeatType: TaskRepeatType; // day, week, month

  @IsOptional()
  @IsArray()
  weekDays: WeekDaysType[]; // sun, mon, ....

  @IsOptional()
  @IsString()
  monthlyRepeat: MonthlyRepeatType;

  @IsOptional()
  @IsString()
  startTime: Date;

  @IsOptional()
  @IsString()
  endTime: Date;

  @IsOptional()
  @IsDate()
  endDate: Date;

  @IsOptional()
  @IsNumber()
  occurrences: number;
}
