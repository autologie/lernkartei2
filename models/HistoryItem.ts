import { Question } from "./Question";
import { Response } from "./Response";

export interface HistoryItem {
  question: Question;
  missResponses: Response[];
  hintUsed: boolean;
}
