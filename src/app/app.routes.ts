import { Routes } from '@angular/router';
import { Dashboard } from './components/dashboard/dashboard';
import { GeneralMetrics } from './components/general-metrics/general-metrics';

// export const routes: Routes =  [
//   { path: '', component: Dashboard },
//   { path: 'general-metrics', component: GeneralMetrics },
//   { path: '**', redirectTo: '' }
// ];


export const routes: Routes = [
  { 
    path: '', 
    redirectTo: '/metrics', 
    pathMatch: 'full' 
  },
  { 
    path: 'metrics', 
    component: GeneralMetrics,
    title: 'House Power Statistics'
  },
  { 
    path: 'dashboard', 
    component: Dashboard,
    title: 'Real-time Power Monitor'
  },
  { 
    path: '**', 
    redirectTo: '/metrics' 
  }
];