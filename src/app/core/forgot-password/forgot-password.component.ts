import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SharedService } from '../../services/shared.service';
import { ToastrService } from 'ngx-toastr';
import * as countryCodes from 'country-codes-list';
import { ActivatedRoute } from '@angular/router';
import intlTelInput from 'intl-tel-input';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {

  isCoach: boolean = true;
  isPasswordVisible: boolean = false;
  loginForm!: FormGroup;
  countries: { name: string, dialCode: string }[] = [];
  selectedCountryCode: string = '91';
  loading: boolean = false;

  role: string | undefined;

  iti: any;


  constructor(private router: ActivatedRoute, private route: Router, private srevice: SharedService, private toastr: ToastrService) { }

  ngOnInit(): void {

    const input: any = document.querySelector("#phone1");
    this.iti = intlTelInput(input, {
      initialCountry: "gb", // Set UK as the initial country
      separateDialCode: true,
    });

    this.router.paramMap.subscribe(params => {
      this.role = params.get('role') || '';
      console.log(this.role);
      
    });

    if (this.role == 'user') {
      this.isCoach = false;
    }

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
      phone_no: new FormControl('', Validators.required),
      //countryCode: new FormControl(defaultCountry.dialCode, Validators.required),
      countryCode: new FormControl('+44', Validators.required),
    })
  }


  onSubmit() {
    this.loginForm.markAllAsTouched();
    if (this.loginForm.valid) {
      this.loading = true;
      const formURlData = new URLSearchParams();
      const countryCode = this.loginForm.get('countryCode')?.value;
      const mobileNumber = this.loginForm.get('phone_no')?.value;

      const fullNumber = this.iti.selectedCountryData.dialCode;

      const fullMobileNumber = `+${fullNumber}${mobileNumber}`;
      formURlData.set('phone_no', fullMobileNumber);

      this.srevice.resetPassword(this.isCoach ? 'coach/forgetPassword' : 'user/forgetPassword', formURlData.toString()).subscribe({
        next: (resp) => {
          if (resp.success == true) {
            this.toastr.success(resp.message);
            // const data: any = {
            //   'password': this.loginForm.value.full_name,
            // }
            // localStorage.setItem('forgotPassDet', JSON.stringify(data))
            this.loading = false;
            const role = this.isCoach ? 'coach' : 'user'
            this.route.navigateByUrl(`/otp-reset/${fullMobileNumber}/${role}`);
          } else {
            this.toastr.warning(resp.message);
            this.loading = false;
          }
        },
        error: (error) => {
          this.loading = false;
          this.toastr.error(error.error.message);
          console.error('Login error:', error.message);
        }
      });
    }
  }


  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  toggleUser() {
    this.isCoach = !this.isCoach
  }


}
