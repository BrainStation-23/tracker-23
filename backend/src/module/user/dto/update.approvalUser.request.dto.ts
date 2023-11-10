import { IsNotEmpty } from 'class-validator';

export class UpdateApprovalUserRequest {
  @IsNotEmpty()
  approved: boolean;
}
