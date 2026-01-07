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
    return this.http.get<any>(`${this.apiUrl}/${date}`).pipe(
      map(response => {
        // Handle both array and wrapped object responses
        const data = Array.isArray(response) 
            ? response 
            : (response?.data || []);
        
        const mappedData = data.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        
        return {
          date: response?.date || date,
          count: response?.count ?? mappedData.length,
          data: mappedData
        };
      })
    );
  }

  getAvailableDates(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/dates`);
  }
}
