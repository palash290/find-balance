import { Component } from '@angular/core';
import { SharedService } from '../../services/shared.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketService } from '../../services/socket.service';
import Swal from 'sweetalert2';
import { Location } from '@angular/common';


@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css'
})
export class NotificationComponent {

  isCoach: boolean = true;
  role: string | undefined;

  data: any;

  constructor(private service: SharedService, private route: ActivatedRoute, private socketService: SocketService, private router: Router, private location: Location) { }

  ngOnInit() {

    this.role = this.service.getRole();
    if (this.role == 'USER') {
      this.isCoach = false;
    }
    this.readAllNotification();
    this.getNotification();
  }

  backClicked() {
    this.location.back();
  }


  getNotification() {
    this.service.getApi(this.isCoach ? 'coach/notifications' : 'user/notifications').subscribe({
      next: resp => {
        this.data = resp.data.notifications;
        // debugger
        // this.chatId = resp.data.notifications.data.chatId;
        // console.log('========>', this.chatId);

      },
      error: error => {
        console.log(error.message)
      }
    });
  }

  getChat(chatid: any, type: any) {
    if (type == 'chat') {
      localStorage.setItem('chatIdFb', chatid)
      this.router.navigateByUrl('/user/main/chat')
    }
  }

  readAllNotification() {
    this.service.putApi(this.isCoach ? 'coach/notifications' : 'user/notifications/markAllRead', null).subscribe({
      next: resp => {
        //this.getNotification();
        localStorage.setItem('unreadNotifications', '0');
        this.service.triggerRefresh();
      },
      error: error => {
        console.log(error.message)
      }
    });
  }

  // deleteAllNotification() {
  //   this.service.deleteAcc(this.isCoach ? 'coach/notifications' : 'user/notifications').subscribe({
  //     next: resp => {
  //       this.getNotification();
  //     },
  //     error: error => {
  //       console.log(error.message)
  //     }
  //   });
  // }

  deleteAllNotification() {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this notifications!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.deleteAcc(this.isCoach ? 'coach/notifications' : 'user/notifications').subscribe({
          next: (resp) => {
            if (resp.success) {
              Swal.fire(
                'Deleted!',
                'All notifications has been deleted successfully.',
                'success'
              );
              this.getNotification();
            }
          },
          error: (error) => {
            Swal.fire(
              'Error!',
              'There was an error deleting notifications.',
              'error'
            );
            //this.toastr.error('Error deleting account!');
            console.error('Error deleting account', error);
          }
        });
      }
    });
  }

  cleanNotificationContent(fullName: string, content: string): string {
    const name = fullName.trim();
    const contentTrimmed = content.trim();

    if (contentTrimmed.startsWith(name)) {
      return contentTrimmed.slice(name.length).trim();
    }

    return contentTrimmed;
  }

  acceptLoader: boolean = false;
  notificationId: any;

  acceptTeam(teamId: any, notifId: any){
    this.notificationId = notifId;
    this.acceptLoader = true
    const formURlData = new URLSearchParams();
    formURlData.set('teamId', teamId);
    formURlData.set('notificationId', notifId);
    this.service.postAPI(this.isCoach ? 'coach/team/join' : 'user/login', formURlData.toString()).subscribe({
      next: (resp) => {
        this.acceptLoader = false;
        this.getNotification();
      },
      error: (error) => {
        this.acceptLoader = false;
        console.error('Login error:', error.error.message);
      }
    });
  }

  rejectLoader: boolean = false;
  
  rejectTeam(teamId: any, notifId: any){
    this.notificationId = notifId;
    this.rejectLoader = true
    const formURlData = new URLSearchParams();
    //formURlData.set('teamId', teamId);
    formURlData.set('notificationId', notifId);
    this.service.deleteAcc(this.isCoach ? `coach/notifications/${notifId}` : 'user/login').subscribe({
      next: (resp) => {
        this.rejectLoader = false;
        this.getNotification();
      },
      error: (error) => {
        this.rejectLoader = false
        console.error('Login error:', error.error.message);
      }
    });
  }


}
