export interface SystemInfo {
  CPU: {
    load: string | null;
    temperature: string | null;
    power: string | null;
  };
  RAM: {
    load: string | null;
  };
  GPU: {
    load: string | null;
    temperature: string | null;
    power: string | null;
  };
  HDD: {
    load: string | null;
  };
}
