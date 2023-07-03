export interface Action {
  result: string | null;
  action(): void;
}
