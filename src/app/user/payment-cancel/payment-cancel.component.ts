import { Component } from '@angular/core';
import { SharedService } from '../../services/shared.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment-cancel',
  templateUrl: './payment-cancel.component.html',
  styleUrl: './payment-cancel.component.css'
})
export class PaymentCancelComponent {

  adHocPostId: any;

  adHocEventId: any;

  constructor(private route: Router, private service: SharedService) { }

  ngOnInit() {
    this.adHocPostId = localStorage.getItem('adHocPostId');
    this.adHocEventId = localStorage.getItem('adHocEventId');

    //console.log(`Payment Done successful for ${localStorage.getItem('package')} package!`)
    if(this.adHocPostId){
      this.setSub();
    }
    if(this.adHocEventId){
      this.payForEvent();
    }
  }

  setSub() {
    this.service.postAPI(`user/adhocPayment/${this.adHocPostId}`, null).subscribe({
      next: (resp) => {
        console.log(resp)
      },
      error: error => {
        console.log(error.message)
      }
    })
  }

  payForEvent() {
    this.service.postAPI(`user/event/adhocPayment/${this.adHocEventId}`, null).subscribe({
      next: (resp) => {
        console.log(resp)
      },
      error: error => {
        console.log(error.message)
      }
    })
  }

  ngOnDestroy() {
    localStorage.removeItem('adHocPostId');
    localStorage.removeItem('adHocEventId');
  }

  logout() {
    //this.service.logout();
   
    if(this.adHocPostId){
      this.route.navigateByUrl('/user/main/feeds');
    }
    if(this.adHocEventId){
      this.route.navigateByUrl(`user/main/events/${this.adHocEventId}`);
    }
  }

}
