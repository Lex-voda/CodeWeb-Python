export interface StrategyContent {
  argus: Array<{
    argu_name: string;
    argu_annotation: string;
    argu_default: string;
  }>;
  return_annotation: string;
  comment: string;
}
