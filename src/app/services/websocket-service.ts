import { Injectable } from '@angular/core';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { PowerConsumption } from '../models/power-consumption';
import SockJS from 'sockjs-client';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private stompClient: Client | null = null;
  private subscription: StompSubscription | null = null;
  
  private dataSubject = new BehaviorSubject<PowerConsumption | null>(null);
  public data$: Observable<PowerConsumption | null> = this.dataSubject.asObservable();
  
  private connectedSubject = new BehaviorSubject<boolean>(false);
  public connected$: Observable<boolean> = this.connectedSubject.asObservable();

  constructor() {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.stompClient?.connected) {
        resolve();
        return;
      }

      this.stompClient = new Client({
        webSocketFactory: () => new SockJS(environment.wsUrl),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        debug: (str) => {
          console.log('STOMP: ' + str);
        }
      });

      this.stompClient.onConnect = (frame) => {
        console.log('Connected to WebSocket:', frame);
        this.connectedSubject.next(true);
        
        this.subscription = this.stompClient!.subscribe('/topic/realtime', (message: IMessage) => {
          const data = JSON.parse(message.body);
          // Convert timestamp string to Date object
          data.timestamp = new Date(data.timestamp);
          this.dataSubject.next(data);
        });
        
        resolve();
      };

      this.stompClient.onStompError = (frame) => {
        console.error('STOMP error:', frame);
        this.connectedSubject.next(false);
        reject(frame);
      };

      this.stompClient.activate();
    });
  }

  disconnect(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }

    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
    }
    
    this.connectedSubject.next(false);
    console.log('Disconnected from WebSocket');
  }

  startSimulation(date: string): void {
    if (this.stompClient?.connected) {
      this.stompClient.publish({
        destination: '/app/start',
        body: JSON.stringify({ date })
      });
      console.log('Started simulation for date:', date);
    } else {
      console.error('Cannot start simulation: not connected');
    }
  }

  stopSimulation(): void {
    if (this.stompClient?.connected) {
      this.stompClient.publish({
        destination: '/app/stop',
        body: '{}'
      });
      console.log('Stopped simulation');
    }
  }

  isConnected(): boolean {
    return this.stompClient?.connected ?? false;
  }
  
}
