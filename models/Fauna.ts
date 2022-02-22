export type Fauna<T> = {
  _id: string;
  _ts: number;
} & T;
