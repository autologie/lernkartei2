import { Question } from "./Question";

export type Response =
  | { type: "choice"; value: number }
  | { type: "input"; value: string[] };

export function isCorrect(question: Question, response: Response): boolean {
  if (question.chooseFrom === null) {
    if (response.type !== "input") {
      return false;
    }

    if (question.type === "fill-blank") {
      const answer = question.chunks.flatMap((chunk) =>
        chunk.isMatch ? [chunk.text] : []
      );

      return (
        answer.length === response.value.length &&
        answer.every((el, i) => el === response.value[i].trim())
      );
    }

    return response.value[0].trim() === question.word;
  }

  return (
    response.type === "choice" &&
    response.value === question.chooseFrom.answerIndex
  );
}
