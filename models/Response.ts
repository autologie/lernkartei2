import { Question } from "./Question";

export type Response =
  | { type: "choice"; value: number }
  | { type: "input"; value: string };

export function isCorrect(question: Question, response: Response): boolean {
  if (question.chooseFrom === null) {
    return response.type === "input" && response.value.trim() === question.word;
  }

  return (
    response.type === "choice" &&
    response.value === question.chooseFrom.answerIndex
  );
}
