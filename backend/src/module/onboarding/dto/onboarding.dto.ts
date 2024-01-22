import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';

export class QuestionAnswersDto {
  @IsString()
  @IsNotEmpty()
  question: string;

  @IsString()
  @IsNotEmpty()
  answer: string;

  @IsArray()
  @IsNotEmpty()
  options: string[];
}

export class OnboardingRequestDto {
  @IsArray()
  @IsNotEmpty()
  @Type(() => QuestionAnswersDto)
  @ValidateNested({ each: true })
  data: QuestionAnswersDto[];
}
