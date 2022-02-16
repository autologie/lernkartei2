import { Question } from "./Question";

export interface Presentation {
  question: Question;
  timestamp: number;
  correct: boolean;
}
