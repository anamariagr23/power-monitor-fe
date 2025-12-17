import { Component, OnDestroy, OnInit } from '@angular/core';
import { PowerConsumption } from '../../models/power-consumption';
import { Subscription } from 'rxjs';
import { HistoricalData } from '../../services/historical-data';
import { WebsocketService } from '../../services/websocket-service';
import { PowerGraph } from "../power-graph/power-graph";
import { FormsModule } from '@angular/forms';  

@Component({
  selector: 'app-dashboard',
  imports: [PowerGraph, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit, OnDestroy{

selectedDate: string = '';
  isRealtimeEnabled: boolean = false;
  historicalData: PowerConsumption[] = [];
  realtimeData: PowerConsumption | null = null;
  currentMetrics: PowerConsumption | null = null;
  loading: boolean = false;
  error: string = '';
  isConnected: boolean = false;

  private subscriptions: Subscription[] = [];

  constructor(
    private historicalService: HistoricalData,
    private websocketService: WebsocketService
  ) {}

  ngOnInit(): void {
    // Set default date (use a date from your CSV data)
    this.selectedDate = '2006-12-16';
    
    this.loadHistoricalData();
    this.setupRealtimeSubscription();
  }

  onDateChange(): void {
    this.loadHistoricalData();
    
    if (this.isRealtimeEnabled) {
      this.websocketService.stopSimulation();
      this.websocketService.startSimulation(this.selectedDate);
    }
  }

  loadHistoricalData(): void {
    if (!this.selectedDate) {
      return;
    }

    this.loading = true;
    this.error = '';
    
    this.historicalService.getHistoricalData(this.selectedDate).subscribe({
      next: (response) => {
        this.historicalData = response.data;
        this.loading = false;
        
        if (this.historicalData.length > 0) {
          this.currentMetrics = this.historicalData[this.historicalData.length - 1];
        }
        
        console.log(`Loaded ${response.count} historical data points`);
      },
      error: (error) => {
        console.error('Error loading historical data:', error);
        this.error = 'Failed to load historical data. Please try again.';
        this.loading = false;
      }
    });
  }

  async toggleRealtime(): Promise<void> {
    if (this.isRealtimeEnabled) {
      try {
        await this.websocketService.connect();
        this.websocketService.startSimulation(this.selectedDate);
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
        this.error = 'Failed to connect to real-time stream';
        this.isRealtimeEnabled = false;
      }
    } else {
      this.websocketService.stopSimulation();
      this.websocketService.disconnect();
      this.realtimeData = null;
    }
  }

  private setupRealtimeSubscription(): void {
    const dataSub = this.websocketService.data$.subscribe(data => {
      if (data) {
        this.realtimeData = data;
        this.currentMetrics = data;
        console.log('Received real-time data:', data);
      }
    });

    const connectedSub = this.websocketService.connected$.subscribe(connected => {
      this.isConnected = connected;
    });

    this.subscriptions.push(dataSub, connectedSub);
  }

  ngOnDestroy(): void {
    this.websocketService.disconnect();
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  formatNumber(value: number | undefined): string {
    return value !== undefined ? value.toFixed(3) : 'N/A';
  }
}
