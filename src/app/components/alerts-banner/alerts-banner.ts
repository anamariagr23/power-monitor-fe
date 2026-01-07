import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RealtimeApiService } from '../../services/realtime-api.service';
import { AlertData } from '../../models/realtime.models';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-alerts-banner',
  imports: [CommonModule],
  templateUrl: './alerts-banner.html',
  styleUrl: './alerts-banner.scss'
})
export class AlertsBanner implements OnInit, OnDestroy {
  alerts: AlertData[] = [];
  private subscription: Subscription = new Subscription();

  constructor(private realtimeService: RealtimeApiService) {}

  ngOnInit(): void {
    this.fetchAlerts();
    // Optional: Auto-refresh alerts every minute
    this.subscription.add(
        interval(60000).subscribe(() => this.fetchAlerts())
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  fetchAlerts(): void {
    this.realtimeService.getAlerts().subscribe({
        next: (data) => {
            this.alerts = data; // Assuming API returns all active alerts
        },
        error: (err) => console.error('Failed to fetch alerts', err)
    });
  }
}
