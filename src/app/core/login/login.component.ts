import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from '../../services/shared.service';
import { NotificationService } from '../../services/notification.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as countryCodes from 'country-codes-list';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  isCoach: boolean = false;
  
  isPasswordVisible: boolean = false;
  loginForm!: FormGroup
  loading: boolean = false;
  countries: { name: string, dialCode: string, flag: string }[] = [];
  selectedCountryCode: string = '91';

  constructor(private route: Router, private srevice: SharedService, private notifyService: NotificationService, private toster: ToastrService) { }

  ngOnInit(): void {
    const countryList: any = countryCodes.all();

    // Map the list to the format required for the dropdown
    this.countries = Object.keys(countryList).map(key => {
      const country = countryList[key];
      return {
        name: country.countryNameEn,
        dialCode: country.countryCallingCode,
        flag: `flag-icon flag-icon-${country.countryCode.toLowerCase()}`
      };
    });

    this.initForm();
    //this.notifyService.requestPermission();
  }

  initForm() {
    const defaultCountry = this.countries[0];
    this.loginForm = new FormGroup({
      phone_no: new FormControl('', [
        Validators.required,
        Validators.pattern('^[0-9]*$')  // Regex to allow only numbers
      ]),
      password: new FormControl('', Validators.required),
      //countryCode: new FormControl(defaultCountry.dialCode, Validators.required),
      countryCode: new FormControl('+91', Validators.required),
    })
  }

  login() {
    this.loginForm.markAllAsTouched();
    if (this.loginForm.valid) {
      this.loading = true;
      const fcmToken: any = localStorage.getItem('fcmFbToken')
      const formURlData = new URLSearchParams();
      const countryCode = this.loginForm.get('countryCode')?.value;
      const mobileNumber = this.loginForm.get('phone_no')?.value;
      //const fullMobileNumber = `+${countryCode}${mobileNumber}`;
      const fullMobileNumber = `${countryCode}${mobileNumber}`;

      formURlData.set('phone_no', fullMobileNumber);
      formURlData.set('password', this.loginForm.value.password);
      if(fcmToken){
        formURlData.set('fcm_token', fcmToken);
      }
      
      this.srevice.loginUser(this.isCoach ? 'coach/login' : 'user/login', formURlData.toString()).subscribe({
        next: (resp) => {
          if (resp.success == true) {
            //this.route.navigateByUrl("/user/main/dashboard");
            if(resp.data?.coach){
              localStorage.setItem('userDetailFb', JSON.stringify(resp.data?.coach));
              localStorage.setItem('fbRole', JSON.stringify(resp.data?.coach?.role));
              localStorage.setItem('fbId', JSON.stringify(resp.data?.coach?.id));
            } else {
              localStorage.setItem('userDetailFb', JSON.stringify(resp.data?.user));
              localStorage.setItem('fbRole', JSON.stringify(resp.data?.user?.role));
              localStorage.setItem('fbId', JSON.stringify(resp.data?.user?.id));
            }
           
            this.srevice.setToken(resp.data.token);
            this.loading = false;
            this.route.navigateByUrl('/user/main/feeds')
          } else {
            this.loading = false;
            this.toster.warning(resp.message)
          }
        },
        error: (error) => {
          this.loading = false;
          this.toster.error(error.error.message);
          // this.toster.error(error.error.message)
          debugger
          console.error('Login error:', error.error.message);
        }
      });
   }
  }

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
    this.imageSrc = this.isPasswordVisible ? 'assets/img/open_eye.svg' : 'assets/img/close_eye.svg';
  }

  toggleUser(){
    this.isCoach = !this.isCoach
  }

  imageSrc: string = 'assets/img/close_eye.svg';


}
