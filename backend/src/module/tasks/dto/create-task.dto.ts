import { Labels } from '@prisma/client';
import {
  IsArray,
  IsDate,
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
  @IsString()
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
  @IsString()
  endDate: Date;

  @IsOptional()
  @IsNumber()
  occurrences: number;
}

export enum WeekDaysType {
  Saturday = 'Saturday',
  Sunday = 'Sunday',
  Monday = 'Monday',
  Tuesday = 'Tuesday',
  Wednesday = 'Wednesday',
  Thursday = 'Thursday',
  Friday = 'Friday',
}

enum MonthlyRepeatType {
  Date = 'DATE',
  Day = 'DAY',
}

enum TaskRepeatType {
  Day = 'DAY',
  Week = 'WEEK',
  Month = 'MONTH',
}
