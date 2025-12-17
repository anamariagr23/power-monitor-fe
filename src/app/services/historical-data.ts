import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { HistoricalDataResponse } from '../models/power-consumption';

@Injectable({
  providedIn: 'root',
})
export class HistoricalData {
  private apiUrl = `${environment.apiUrl}/historical`;

  constructor(private http: HttpClient) {}

  getHistoricalData(date: string): Observable<HistoricalDataResponse> {
    return this.http.get<HistoricalDataResponse>(`${this.apiUrl}/${date}`).pipe(
      map(response => ({
        ...response,
        data: response.data.map(item => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }))
      }))
    );
  }

  getAvailableDates(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/dates`);
  }
}
