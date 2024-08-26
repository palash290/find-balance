import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, of } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { SharedService } from './shared.service';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  role: any;
  isCoach: boolean = true;
  private socket!: Socket;
  private readonly serverUrl = 'http://18.175.98.27:4000';
  authToken = localStorage.getItem('fbToken');
  constructor(private service: SharedService) {
    

    this.role = this.service.getRole();
    this.isCoach = this.role !== 'USER';

    // this.socket = io(this.serverUrl, {
    //   query: {
    //     isUser: this.isCoach ? '0' : '1'
    //   },
    //   extraHeaders: {
    //     Authorization: `Bearer ${this.authToken}`
    //   },
    //   // Ensure WebSocket transport is used
    // });

    // this.socket.on('connect_error', (err) => {
    //   console.error('Connection Error:', err);
    // });

    // this.socket.on('connect', () => {
    //   console.log('Connected to Socket.IO server');
    // });
  }

  connectSocket(){
    const authToken = localStorage.getItem('fbToken');
    this.socket = io(this.serverUrl, {
      query: {
        isUser: this.isCoach ? '0' : '1'
      },
      extraHeaders: {
        Authorization: `Bearer ${authToken}`
      },
      // Ensure WebSocket transport is used
    });

    this.socket.on('connect_error', (err) => {
      console.error('Connection Error:', err);
    });

    this.socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });
  }

  getMessage(): Observable<{ user: string, message: string }> {
    return new Observable<{ user: string, message: string }>(observer => {
      this.socket.on('messageReceived', (data) => {
        observer.next(data);
        console.log('Message received:', data);
      });

      return () => {
        this.socket.disconnect();
      };
    }).pipe(
      catchError(err => {
        console.error('Error:', err);
        return of({ user: '', message: '' }); // Return a default value or empty observable
      })
    );
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
