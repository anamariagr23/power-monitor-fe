import { Component, OnDestroy, OnInit } from '@angular/core';
import { PowerConsumption } from '../../models/power-consumption';
import { Subscription, interval } from 'rxjs';
import { HistoricalData } from '../../services/historical-data';
import { RealtimeApiService } from '../../services/realtime-api.service';
import { PowerGraph } from "../power-graph/power-graph";
import { AlertsBanner } from "../alerts-banner/alerts-banner";
import { FormsModule } from '@angular/forms';
import { RealtimeAverages } from '../../models/realtime.models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [PowerGraph, AlertsBanner, FormsModule, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit, OnDestroy {

  selectedDate: string = '';
  selectedHour: number = 0;
  hours: number[] = Array.from({length: 24}, (_, i) => i);
  
  isRealtimeEnabled: boolean = false;
  autoRefreshEnabled: boolean = false;
  
  historicalData: PowerConsumption[] = [];
  realtimeData: PowerConsumption[] = []; // Changed to array
  currentMetrics: RealtimeAverages | null = null;
  
  loading: boolean = false;
  loadingRealtime: boolean = false;
  error: string = '';
  realtimeError: string = '';
  
  isConnected: boolean = false; // Used for source availability
  lastRefresh: Date | null = null;

  private subscriptions: Subscription = new Subscription();
  private refreshSubscription: Subscription | null = null;

  constructor(
    private historicalService: HistoricalData,
    private realtimeService: RealtimeApiService
  ) {}

  ngOnInit(): void {
    // Set default date (use a date from your CSV data or today)
    this.selectedDate = '2006-12-16'; 
    this.selectedHour = 12; // Default hour
    
    this.loadHistoricalData();
    this.loadMetrics();
    
    // Initial check for realtime availability or alerts
    this.subscriptions.add(this.realtimeService.getAlerts().subscribe());
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.stopAutoRefresh();
  }

  onDateTimeChange(): void {
    console.log('DateTime changed', this.selectedDate, this.selectedHour);
    this.loadHistoricalData();
    this.loadMetrics();
  }

  loadHistoricalData(): void {
    if (!this.selectedDate) return;

    this.loading = true;
    this.error = '';
    
    this.historicalService.getHistoricalData(this.selectedDate).subscribe({
      next: (response) => {
        // Filter for specific hour if the API returns full day
        // Build start/end in local time, matching the server-side timestamps
        const [year, month, day] = this.selectedDate.split('-').map(Number);
        const start = new Date(year, month - 1, day, this.selectedHour, 0, 0, 0);
        const end = new Date(year, month - 1, day, this.selectedHour + 1, 0, 0, 0);

        console.log(`Filtering from ${start.toISOString()} to ${end.toISOString()}`);
        console.log(`Total response data points: ${response.data.length}`);

        // Filter by timestamp hour
        this.historicalData = response.data.filter(d => {
            const timestamp = d.timestamp;
            return timestamp >= start && timestamp < end;
        });
        
        // If still no data, maybe the timestamps use different format - show all data for the day
        if (this.historicalData.length === 0 && response.data.length > 0) {
            console.log('Hour filtering returned 0 results, showing all data for the day');
            this.historicalData = response.data;
        }
        
        this.loading = false;
        console.log(`Loaded ${this.historicalData.length} historical data points for hour ${this.selectedHour}`);
      },
      error: (error) => {
        console.error('Error loading historical data:', error);
        this.error = 'Failed to load historical data. Please try again.';
        this.loading = false;
      }
    });
  }

  loadMetrics(): void {
    if (!this.selectedDate) return;
    
    const startDate = new Date(this.selectedDate);
    startDate.setHours(this.selectedHour, 0, 0, 0); 
    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + 1);

    this.realtimeService.getAverages(startDate, endDate).subscribe({
        next: (avgs) => {
            this.currentMetrics = avgs;
        },
        error: (err) => {
            console.error('Failed to load metrics', err);
            this.currentMetrics = null;
        }
    });
  }

  toggleRealtime(): void {
    if (this.isRealtimeEnabled) {
      this.loadRealtimeData();
      this.startAutoRefresh();
    } else {
      this.stopAutoRefresh();
      this.realtimeData = [];
    }
  }
  
  toggleAutoRefresh(): void {
    if (this.autoRefreshEnabled) {
        this.startAutoRefresh();
    } else {
        this.stopAutoRefresh();
    }
  }

  private startAutoRefresh(): void {
    this.stopAutoRefresh();
    if (this.isRealtimeEnabled || this.autoRefreshEnabled) {
        // Initial fetch
        this.loadRealtimeData();
        // Poll every minute
        this.refreshSubscription = interval(60000).subscribe(() => {
            this.loadRealtimeData();
        });
    }
  }

  private stopAutoRefresh(): void {
    if (this.refreshSubscription) {
        this.refreshSubscription.unsubscribe();
        this.refreshSubscription = null;
    }
  }

  loadRealtimeData(): void {
    this.loadingRealtime = true;
    this.realtimeService.getLatestData(60).subscribe({
        next: (response) => {
            this.realtimeData = response.data;
            this.isConnected = response.sourceAvailable;
            this.loadingRealtime = false;
            this.lastRefresh = new Date();
            this.realtimeError = '';
        },
        error: (err) => {
            console.error('Failed to load realtime data', err);
            this.realtimeError = 'Real-time unavailable';
            this.isConnected = false;
            this.loadingRealtime = false;
        }
    });
  }

  formatNumber(val: number | undefined): string {
    return val !== undefined ? val.toFixed(3) : '-';
  }
}
