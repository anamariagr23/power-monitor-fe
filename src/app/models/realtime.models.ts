
import { PowerConsumption } from './power-consumption';

export interface RealtimeAverages {
    avgPower: number;
    avgVoltage: number;
    avgCurrent: number;
    avgReactivePower: number;
    start: Date;
    end: Date;
    dataPoints: number;
}

export interface AlertData {
    timestamp: Date;
    power: number;
    threshold: number;
    avgMaxDailyPower: number;
    message: string;
    level: 'warning' | 'critical' | 'info';
}

export interface LatestDataResponse {
    data: PowerConsumption[];
    sourceAvailable: boolean;
}
