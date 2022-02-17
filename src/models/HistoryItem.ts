import { Question } from "./Question";

export interface HistoryItem {
  question: Question;
  missResponses: number[];
}
