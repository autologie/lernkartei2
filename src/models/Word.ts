export interface Word {
  level: "A1" | "A2" | "B1" | "B2" | "C1";
  german: string;
  definitions: string[];
  english: string[];
  examples: string[];
}
