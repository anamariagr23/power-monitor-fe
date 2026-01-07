import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environment/environment';
import { AlertData, LatestDataResponse, RealtimeAverages } from '../models/realtime.models';
import { PowerConsumption } from '../models/power-consumption';

@Injectable({
  providedIn: 'root'
})
export class RealtimeApiService {
  private apiUrl = `${environment.apiUrl}/realtime`;

  constructor(private http: HttpClient) {}

  getAverages(start: Date, end: Date): Observable<RealtimeAverages> {
    const params = new HttpParams()
      .set('start', start.toISOString())
      .set('end', end.toISOString());

    return this.http.get<any>(`${this.apiUrl}/averages`, { params }).pipe(
      map(response => ({
        avgPower: response?.avgPower ?? response?.avg_power ?? 0,
        avgVoltage: response?.avgVoltage ?? response?.avg_voltage ?? 0,
        avgCurrent: response?.avgCurrent ?? response?.avg_current ?? 0,
        avgReactivePower: response?.avgReactivePower ?? response?.avg_reactive_power ?? 0,
        start: response?.start,
        end: response?.end,
        dataPoints: response?.dataPoints ?? response?.data_points ?? 0
      }))
    );
  }

  getLatestData(minutes: number): Observable<LatestDataResponse> {
    const params = new HttpParams().set('minutes', minutes.toString());
    
    return this.http.get<any>(`${this.apiUrl}/latest`, { params }).pipe(
      map(response => {
        // Handle both array and wrapped object responses
        const data = Array.isArray(response) 
            ? response 
            : (response?.data || []);
        const sourceAvailable = response?.sourceAvailable ?? true;
        
        return {
          sourceAvailable,
          data: data.map((item: any) => ({
            ...item,
            timestamp: new Date(item.timestamp)
          }))
        };
      })
    );
  }

  getAlerts(): Observable<AlertData[]> {
    return this.http.get<any>(`${this.apiUrl}/alerts`).pipe(
        map(response => {
            // Handle both array and wrapped object responses
            const alerts: AlertData[] = Array.isArray(response) 
                ? response 
                : (response?.alerts || response?.data || []);
            
            return alerts.map(alert => ({
                ...alert,
                timestamp: new Date(alert.timestamp)
            }));
        })
    );
  }
}
