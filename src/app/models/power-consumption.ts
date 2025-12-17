export interface PowerConsumption {
  timestamp: Date; 
  globalActivePower: number;
  globalReactivePower: number;
  voltage: number;
  globalIntensity: number;
  subMetering1: number;
  subMetering2: number;
  subMetering3: number;
  isRealtime?: boolean;
}

export interface HistoricalDataResponse {
  date: string;
  count: number;
  data: PowerConsumption[];
}