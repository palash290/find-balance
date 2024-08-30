import { Injectable } from '@angular/core';
import { AngularFireMessaging } from '@angular/fire/compat/messaging';
import { BehaviorSubject, take } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  currentMessage = new BehaviorSubject<any>(null);

  constructor(private afMessaging: AngularFireMessaging) {
    this.afMessaging.messages.subscribe((message) => {
      console.log('Message received: ', message);
      this.currentMessage.next(message);
      //.showNotification(message);
    });
  }

  requestPermission() {
    this.afMessaging.requestToken.subscribe(
      (token: any) => {
        console.log('FCM Token Working:');
        localStorage.setItem('fcmFbToken', token)
        console.log('FCM Token:', token);
      },
      (error) => {
        console.error('Error getting permission or token: ', error);
      }
    );
  }

  receiveMessage() {
    this.afMessaging.messages
      .subscribe((payload) => {
        console.log('Message received: ', payload);
        this.currentMessage.next(payload);
        // Handle your notification logic here
      });
  }


  // private showNotification(payload: any) {
  //   const notificationTitle = payload.notification?.title || 'New Notification';
  //   const notificationOptions = {
  //     body: payload.notification?.body,
  //     icon: payload.notification?.icon || '/firebase-logo.png'
  //   };
  
  //   if ('Notification' in window && Notification.permission === 'granted') {
  //     new Notification(notificationTitle, notificationOptions);
  //   }
  // }
  
 

}
