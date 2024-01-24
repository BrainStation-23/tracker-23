import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { QuestionAnswersDto } from 'src/module/onboarding/dto/onboarding.dto';

export class UpdateApprovalUserRequest {
  @IsNotEmpty()
  @IsBoolean()
  approved: boolean;
}

export class UpdateUserOnboardingStepReqBody {
  @IsNotEmpty()
  @IsNumber()
  index: number;

  @IsNotEmpty()
  @IsBoolean()
  completed: boolean;

  @IsString()
  @IsOptional()
  emails: string;

  @IsArray()
  @IsNotEmpty()
  @Type(() => QuestionAnswersDto)
  @ValidateNested({ each: true })
  data: QuestionAnswersDto[];
}
