import { IsBoolean, IsNotEmpty, IsNumber } from 'class-validator';

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

  @IsNotEmpty()
  @IsBoolean()
  finalStep: boolean;
}
