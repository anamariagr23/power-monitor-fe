export interface HouseStatistics {
  // Time period info
  startDate: string;
  endDate: string;
  totalDataPoints: number;
  period: 'last_day' | 'last_week' | 'last_month' | 'custom';
  
  // Global Active Power (kW)
  avgActivePower: number;
  maxActivePower: number;
  minActivePower: number;
  totalActivePowerKwh: number;
  
  // Global Reactive Power (kW)
  avgReactivePower: number;
  maxReactivePower: number;
  minReactivePower: number;
  
  // Voltage (V)
  avgVoltage: number;
  maxVoltage: number;
  minVoltage: number;
  
  // Current Intensity (A)
  avgIntensity: number;
  maxIntensity: number;
  minIntensity: number;
  
  // Sub-metering breakdown
  kitchen: SubMeteringStats;
  laundry: SubMeteringStats;
  hvac: SubMeteringStats;
  other: SubMeteringStats;
  
  // Cost estimation
  estimatedCostUSD: number;
  
  // Peak usage info
  peakUsage: PeakUsageInfo;
}

export interface SubMeteringStats {
  name: string;
  totalWattHour: number;
  totalKwh: number;
  percentage: number;
  avgPower?: number;
  maxPower?: number;
}

export interface PeakUsageInfo {
  timestamp: string;
  power: number;
  dayOfWeek: string;
  hourOfDay: number;
}