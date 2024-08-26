import { Component } from '@angular/core';
import { getMessaging, getToken } from 'firebase/messaging'
import { environment } from '../environments/environment';
import { NotificationService } from './services/notification.service';
import { SocketService } from './services/socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {

  message = '';
  messages: string[] = [];
  private messageSubscription!: Subscription;

  constructor(private notificationService: NotificationService, private socketService: SocketService) { }

  ngOnInit() {
    this.notificationService.requestPermission();
    //this.notificationService.receiveMessage();

    // this.notificationService.currentMessage.subscribe((message) => {
    //   if (message) {
    //     console.log('Foreground message received: ', message);
    //   }
    // });
   // this.requestPermission();
    //console.log(this.notificationService.requestPermission())
    
    // this.messageSubscription = this.socketService.getMessage().subscribe((message: any) => {
    //   this.messages.push(message);
    // });
  }

  requestPermission() {
    console.log('tokehuyiyiiuiuin');
    const messaging = getMessaging();
    getToken(messaging, { vapidKey: environment.firebaseConfig.vapidKey }).then(
      (currentToken) => {
        if (currentToken) {
          console.log('tokehuyiyiiuiuin');
          console.log('==> currentToken',currentToken);
          localStorage.setItem('fcmFbToken', currentToken)
        } else {
          console.log('tokehuyiyiiuiuin');
        }
      }
    )
  }

  // sendMessage() {
  //   if (this.message.trim()) {
  //     this.socketService.sendMessage(this.message);
  //     this.message = '';
  //   }
  // }

  // ngOnDestroy() {
  //   if (this.messageSubscription) {
  //     this.messageSubscription.unsubscribe();
  //   }
  //   this.socketService.disconnect();
  // }


}
