import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedService } from '../../services/shared.service';
import * as countryCodes from 'country-codes-list';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent {

  isCoach: boolean = true;

  loginForm!: FormGroup
  loading: boolean = false;
  fullMobileNumber: any | undefined;
  role: string | undefined;
  passwordMismatch = false;

  constructor(private route: ActivatedRoute, private router: Router, private srevice: SharedService, private toster: ToastrService) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.fullMobileNumber = params.get('fullMobileNumber') || '';
      this.role = params.get('role') || '';
    });

    if (this.role == 'user') {
      this.isCoach = false;
    }
    this.initForm();
  }

  initForm() {
    this.loginForm = new FormGroup({
      //current_password: new FormControl('', Validators.required),
      new_password: new FormControl('', [Validators.required, Validators.minLength(8)]),
      confirm_password: new FormControl('', Validators.required),
    });

    this.loginForm.get('confirm_password')?.setValidators([
      Validators.required,
      this.passwordMatchValidator()
    ]);
  }

  login() {
    this.loginForm.markAllAsTouched();
    if (this.loginForm.valid) {
      this.loading = true;
      const formURlData = new URLSearchParams();

      formURlData.set('phone_no', this.fullMobileNumber);
    
      formURlData.set('password', this.loginForm.value.new_password);
      
      this.srevice.loginUser(this.isCoach ? 'coach/resetPassword' : 'user/resetPassword', formURlData.toString()).subscribe({
        next: (resp) => {
          if (resp.success == true) {
            this.loading = false;
            this.toster.success(resp.message);
            this.router.navigateByUrl('/login')
          } else {
            this.toster.warning(resp.message);
            this.loading = false;
          }
        },
        error: (error) => {
          this.loading = false;
          this.toster.error('Something went wrong!')
          console.error('Login error:', error);
        }
      });
    }
  }

  passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const password = this.loginForm.get('new_password')?.value;
      const confirmPassword = control.value;
      if (password !== confirmPassword) {
        this.passwordMismatch = true;
        return { passwordMismatch: true };
      } else {
        this.passwordMismatch = false;
        return null;
      }
    };
  }

  // isPasswordVisible1: boolean = false;

  // togglePasswordVisibility1() {
  //   this.isPasswordVisible1 = !this.isPasswordVisible1;
  //   this.imageSrc = this.isPasswordVisible1 ? 'assets/img/open_eye.svg' : 'assets/img/close_eye.svg';
  // }
  imageSrc2: string = 'assets/img/close_eye.svg';
  imageSrc3: string = 'assets/img/close_eye.svg';

  isPasswordVisible2: boolean = false;

  togglePasswordVisibility2() {
    this.isPasswordVisible2 = !this.isPasswordVisible2;
    this.imageSrc2 = this.isPasswordVisible2 ? 'assets/img/open_eye.svg' : 'assets/img/close_eye.svg';
  }

  isPasswordVisible3: boolean = false;

  togglePasswordVisibility3() {
    this.isPasswordVisible3 = !this.isPasswordVisible3;
    this.imageSrc3 = this.isPasswordVisible3 ? 'assets/img/open_eye.svg' : 'assets/img/close_eye.svg';
  }

  toggleUser(){
    this.isCoach = !this.isCoach
  }



}
