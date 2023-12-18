import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

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
}
