import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'app-payment-success',
  templateUrl: './payment-success.component.html',
  styleUrl: './payment-success.component.css'
})
export class PaymentSuccessComponent {

  package1: any = localStorage.getItem('package')


  constructor(private route: Router, private service: SharedService) { }

  ngOnInit() {
    console.log(`Payment Done successful for ${localStorage.getItem('package')} package!`)
    this.setSub();
  }

  setSub() {
    const formURlData = new URLSearchParams();
    formURlData.set('subscription_plan', this.package1)
    //formURlData.set('subscription_plan', 'Gold')
    console.log('subscription_plan', formURlData)
    this.service.postAPI('/addSubscription', formURlData.toString()).subscribe({
      next: (resp) => {
        console.log(resp)
      },
      error: error => {
        console.log(error.message)
      }
    })
  }

  ngOnDestroy() {
    localStorage.removeItem('package')
  }

  logout() {
    this.service.logout();
  }
  

}
