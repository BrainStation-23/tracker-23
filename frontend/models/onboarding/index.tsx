type QuestionType =
  | "profession"
  | "role"
  | "interests"
  | "introducer"
  | "pastExperience"
  | "havePastExperience"
  | "currentlyUsing";

type QuestionOption = string[];

export interface OnBoardingQuestionDto {
  question: string;
  type: QuestionType;
  options: QuestionOption;
  answer: string;
  placeholder: string;
}
