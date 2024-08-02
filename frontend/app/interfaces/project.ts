export interface StrategyContent {
  argus: Array<{
    argu_name: string;
    argu_annotation: string;
    argu_default: string;
  }>;
  return_annotation: string;
  comment: string;
}

export interface Mission {
  name: string;
  STRATEGY_QUEUE: Array<{
    ID: string;
    FUNC: string;
    ARGS: any;
  }>;
  ITER: boolean;
  GET_OUTPUT: Array<string>;
}
