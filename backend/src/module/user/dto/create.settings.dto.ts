import { IsOptional } from 'class-validator';

export class UpdateSettingsReqDto {
  @IsOptional()
  syncTime: number;
  @IsOptional()
  timeFormat: string;
}
