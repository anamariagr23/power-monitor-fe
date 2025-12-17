import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';
import { HouseStatistics } from '../models/house-statistics.model';

@Injectable({
  providedIn: 'root',
})
export class StatisticsService {
  private apiUrl = `${environment.apiUrl}/statistics`;

  constructor(private http: HttpClient) {}

  getLastDayStatistics(): Observable<HouseStatistics> {
    return this.http.get<HouseStatistics>(`${this.apiUrl}/last-day`);
  }

  getLastWeekStatistics(): Observable<HouseStatistics> {
    return this.http.get<HouseStatistics>(`${this.apiUrl}/last-week`);
  }

  getLastMonthStatistics(): Observable<HouseStatistics> {
    return this.http.get<HouseStatistics>(`${this.apiUrl}/last-month`);
  }

  getCustomRangeStatistics(startDate: string, endDate: string): Observable<HouseStatistics> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    
    return this.http.get<HouseStatistics>(`${this.apiUrl}/custom`, { params });
  }
}