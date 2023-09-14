import { IsNotEmpty, IsOptional } from "class-validator";

export class CreateSettingsReqDto {
  @IsNotEmpty()
  syncTime: number;
}