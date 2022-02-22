import { Fauna } from "./Fauna";
import { Question } from "./Question";

export interface LearningLogData {
  tick: number;
  word: string;
  definitionIndex: number;
  questionType: Question["type"];
  miss: boolean;
}

export type LearningLog = Fauna<LearningLogData>;
