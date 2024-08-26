import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SharedService } from '../../services/shared.service';
import * as countryCodes from 'country-codes-list';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-signup-user',
  templateUrl: './signup-user.component.html',
  styleUrl: './signup-user.component.css'
})
export class SignupUserComponent {

  isCoach: boolean = false;

  isPasswordVisible: boolean = false;
  loginForm!: FormGroup
  loading: boolean = false;
  countries: { name: string, dialCode: string }[] = [];
  selectedCountryCode: string = '91';


  constructor(private route: Router, private srevice: SharedService, private toster: ToastrService) { }

  ngOnInit(): void {
    const countryList: any = countryCodes.all();

    // Map the list to the format required for the dropdown
    this.countries = Object.keys(countryList).map(key => {
      const country = countryList[key];
      return {
        name: country.countryNameEn,
        dialCode: country.countryCallingCode
      };
    });
    this.initForm();
  }

  initForm() {
    const defaultCountry = this.countries[0];
    this.loginForm = new FormGroup({
      phone_no: new FormControl('', [
        Validators.required,
        Validators.pattern('^[0-9]*$')  // Regex to allow only numbers
      ]),
      email: new FormControl('', [Validators.required, Validators.email]),
      full_name: new FormControl('', Validators.required),
      //categoryId: new FormControl('1', Validators.required),
      password: new FormControl('', Validators.required),
      countryCode: new FormControl('+44', Validators.required),
    })
  }

  login() {
    this.loginForm.markAllAsTouched();
    if (this.loginForm.valid) {
      this.loading = true;
      const formURlData = new URLSearchParams();
      const countryCode = this.loginForm.get('countryCode')?.value;
      const mobileNumber = this.loginForm.get('phone_no')?.value;
      const fullMobileNumber = `${countryCode}${mobileNumber}`;

      formURlData.set('phone_no', fullMobileNumber);
      formURlData.set('email', this.loginForm.value.email);
      formURlData.set('full_name', this.loginForm.value.full_name);
      formURlData.set('password', this.loginForm.value.password);
      //formURlData.set('categoryId', this.loginForm.value.categoryId);
      this.srevice.loginUser('user/signup', formURlData.toString()).subscribe({
        next: (resp) => {
          if (resp.success == true) {
            this.loading = false;
            const data: any = {
              'email': this.loginForm.value.email,
              'full_name': this.loginForm.value.full_name,
              'password': this.loginForm.value.password,
            }
            this.toster.success(resp.message);
            localStorage.setItem('signupDet', JSON.stringify(data))
            // In your login component or wherever you navigate to OTP component
            this.route.navigateByUrl(`/otp/${fullMobileNumber}/user`);
          } else {
            this.toster.warning(resp.message);
            this.loading = false;
          }
        },
        error: (error) => {
          this.loading = false;
          this.toster.error(error.error.message)
          console.error('Login error:', error.message);
        }
      });
    }
  }

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
    this.imageSrc = this.isPasswordVisible ? 'assets/img/open_eye.svg' : 'assets/img/close_eye.svg';
  }

  toggleUser() {
    this.isCoach = !this.isCoach
  }

  imageSrc: string = 'assets/img/close_eye.svg';

}
