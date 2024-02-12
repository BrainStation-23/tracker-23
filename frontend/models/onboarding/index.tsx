type QuestionType =
  | "usingPurpose"
  | "purpose"
  | "profession"
  | "pastExperiences";

type QuestionOption = string[];

export interface OnBoardingQuestionDto {
  question: string;
  type: QuestionType;
  options: QuestionOption;
  answer: string;
  placeholder: string;
}
