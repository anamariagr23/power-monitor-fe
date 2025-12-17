import { Component, OnInit } from '@angular/core';
import { HouseStatistics } from '../../models/house-statistics.model';
import { StatisticsService } from '../../services/statistics.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-general-metrics',
  imports: [CommonModule, FormsModule],
  templateUrl: './general-metrics.html',
  styleUrl: './general-metrics.scss',
})
export class GeneralMetrics implements OnInit {

  // Statistics data
  lastDayStats: HouseStatistics | null = null;
  lastWeekStats: HouseStatistics | null = null;
  lastMonthStats: HouseStatistics | null = null;
  customStats: HouseStatistics | null = null;
  
  // Loading states
  loadingLastDay = false;
  loadingLastWeek = false;
  loadingLastMonth = false;
  loadingCustom = false;
  
  // Custom date range
  customStartDate: string = '';
  customEndDate: string = '';
  
  // Active tab
  activeTab: 'day' | 'week' | 'month' | 'custom' = 'day';
  
  // Error handling
  error: string = '';

  constructor(private statisticsService: StatisticsService) {}

  ngOnInit(): void {
    // Load all predefined statistics on init
    this.loadLastDayStats();
    this.loadLastWeekStats();
    this.loadLastMonthStats();
    
    // Set default custom dates (last 7 days)
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    this.customStartDate = this.formatDate(weekAgo);
    this.customEndDate = this.formatDate(today);
  }

  loadLastDayStats(): void {
    this.loadingLastDay = true;
    this.error = '';
    
    this.statisticsService.getLastDayStatistics().subscribe({
      next: (stats) => {
        this.lastDayStats = stats;
        this.loadingLastDay = false;
        console.log('Last day stats loaded:', stats);
      },
      error: (error) => {
        console.error('Error loading last day stats:', error);
        this.error = 'Failed to load last day statistics';
        this.loadingLastDay = false;
      }
    });
  }

  loadLastWeekStats(): void {
    this.loadingLastWeek = true;
    this.error = '';
    
    this.statisticsService.getLastWeekStatistics().subscribe({
      next: (stats) => {
        this.lastWeekStats = stats;
        this.loadingLastWeek = false;
        console.log('Last week stats loaded:', stats);
      },
      error: (error) => {
        console.error('Error loading last week stats:', error);
        this.error = 'Failed to load last week statistics';
        this.loadingLastWeek = false;
      }
    });
  }

  loadLastMonthStats(): void {
    this.loadingLastMonth = true;
    this.error = '';
    
    this.statisticsService.getLastMonthStatistics().subscribe({
      next: (stats) => {
        this.lastMonthStats = stats;
        this.loadingLastMonth = false;
        console.log('Last month stats loaded:', stats);
      },
      error: (error) => {
        console.error('Error loading last month stats:', error);
        this.error = 'Failed to load last month statistics';
        this.loadingLastMonth = false;
      }
    });
  }

  loadCustomStats(): void {
    if (!this.customStartDate || !this.customEndDate) {
      this.error = 'Please select both start and end dates';
      return;
    }
    
    if (new Date(this.customStartDate) > new Date(this.customEndDate)) {
      this.error = 'Start date must be before end date';
      return;
    }
    
    this.loadingCustom = true;
    this.error = '';
    
    this.statisticsService.getCustomRangeStatistics(
      this.customStartDate, 
      this.customEndDate
    ).subscribe({
      next: (stats) => {
        this.customStats = stats;
        this.loadingCustom = false;
        console.log('Custom range stats loaded:', stats);
      },
      error: (error: any) => {
        console.error('Error loading custom stats:', error);
        this.error = 'Failed to load custom range statistics';
        this.loadingCustom = false;
      }
    });
  }

  setActiveTab(tab: 'day' | 'week' | 'month' | 'custom'): void {
    this.activeTab = tab;
    this.error = '';
  }

  getCurrentStats(): HouseStatistics | null {
    switch (this.activeTab) {
      case 'day': return this.lastDayStats;
      case 'week': return this.lastWeekStats;
      case 'month': return this.lastMonthStats;
      case 'custom': return this.customStats;
      default: return null;
    }
  }

  isLoading(): boolean {
    switch (this.activeTab) {
      case 'day': return this.loadingLastDay;
      case 'week': return this.loadingLastWeek;
      case 'month': return this.loadingLastMonth;
      case 'custom': return this.loadingCustom;
      default: return false;
    }
  }

  formatNumber(value: number | undefined, decimals: number = 2): string {
    if (value === undefined || value === null) return 'N/A';
    return value.toFixed(decimals);
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  formatDateDisplay(dateStr: string): string {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatPeakTime(timestamp: string): string {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getSubMeteringColor(index: number): string {
    const colors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12'];
    return colors[index % colors.length];
  }
}
