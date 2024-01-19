import { IsNumber, IsOptional } from 'class-validator';

export class UpdateSettingsReqDto {
  @IsOptional()
  syncTime: 1 | 6 | 12;
  @IsOptional()
  timeFormat: 'Day' | 'Hour';

  @IsOptional()
  @IsNumber()
  extraSpent: number;
}
