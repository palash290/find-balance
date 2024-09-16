import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../services/shared.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { Location } from '@angular/common';


@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrl: './setting.component.css'
})
export class SettingComponent implements OnInit {

  userDetails: any;
  role: any;
  isCoach: boolean = true;

  constructor(private srevice: SharedService, private toastr: ToastrService, private route: Router, private location: Location) { }
  ngOnInit(): void {
    this.role = this.srevice.getRole();
    if (this.role == 'USER') {
      this.isCoach = false;
    }
    const jaonData: any = localStorage.getItem('userDetailFb');
    const data = JSON.parse(jaonData)
    this.userDetails = data;
    this.getSettings();
  }

  backClicked() {
    this.location.back();
  }

  chatNotification!: boolean;
  feedNotification!: boolean;

  getSettings(): void {
    this.srevice.getApi(this.isCoach ? 'coach/mySettings' : 'user/mySettings').subscribe((resp: any) => {
      if (resp.success && resp.data) {
        this.chatNotification = resp.data.chatNotification;
        this.feedNotification = resp.data.feedNotification;
      }
    });
  }

  updateChatNotification(): void {

    const chatSettings = {
      chatNotification: this.chatNotification,
      feedNotification: this.feedNotification
    };

    this.srevice.postAPIFormData(this.isCoach ? 'coach/mySettings' : 'user/mySettings', chatSettings).subscribe((resp: any) => {
      if (resp.success) {
        this.toastr.success(resp.message);
        console.log('Chat notification settings updated successfully');
        this.getSettings();
      } else {
        this.toastr.warning(resp.message);
        console.error('Failed to update chat notification settings');
      }
    });
  }

  // updateFeedNotification(): void {
  //   const feedSettings = {
  //     feedNotification: this.feedNotification
  //   };

  //   this.srevice.postAPIFormData(this.isCoach ? 'coach/mySettings' : 'user/mySettings', feedSettings).subscribe((resp: any) => {
  //     if (resp.success) {
  //       this.toastr.success(resp.message);
  //       console.log('Feed notification settings updated successfully');
  //       this.getSettings();
  //     } else {
  //       this.toastr.warning(resp.message);
  //       console.error('Failed to update feed notification settings');
  //     }
  //   });
  // }


  logout() {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to logout!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e58934',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.srevice.logout();
      }
    });
  }

  deleteAccount() {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this account!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e58934',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.srevice.deleteAcc(this.isCoach ? 'coach/deleteAccount' : 'user/deleteAccount').subscribe({
          next: (resp) => {
            if (resp.success) {
              Swal.fire(
                'Deleted!',
                'Your account has been deleted successfully.',
                'success'
              );
              this.route.navigateByUrl('/home')
              this.toastr.success(resp.message);
            } else {
              this.toastr.warning(resp.message);
            }
          },
          error: (error) => {
            Swal.fire(
              'Error!',
              'There was an error deleting your account.',
              'error'
            );
            this.toastr.error('Error deleting account!');
            console.error('Error deleting account', error);
          }
        });
      }
    });
  }


}
