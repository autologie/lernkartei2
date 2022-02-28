import { Fauna } from "./Fauna";
import { LearningProgress } from "./LearningProgress";
import { deflateSync, inflateSync } from "zlib";

export interface LearningProgressSnapshotData {
  sessionId: string;
  data: string;
}

export type LearningProgressSnapshot = Fauna<LearningProgressSnapshotData>;

export function encode(
  sessionId: string,
  progress: LearningProgress
): LearningProgressSnapshotData {
  return {
    sessionId,
    data: deflateSync(JSON.stringify(progress)).toString("base64"),
  };
}

export function decode(data: LearningProgressSnapshotData): LearningProgress {
  return JSON.parse(inflateSync(Buffer.from(data.data, "base64")).toString());
}
