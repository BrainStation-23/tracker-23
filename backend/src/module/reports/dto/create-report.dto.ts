import { ReportType } from '@prisma/client';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateReportDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsString()
  reportType: ReportType;

  @IsNumber()
  @IsNotEmpty()
  pageId: number;
}
