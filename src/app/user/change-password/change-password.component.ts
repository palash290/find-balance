import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SharedService } from '../../services/shared.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css'
})
export class ChangePasswordComponent {

  form!: FormGroup;
  passwordMismatch = false;
  loading: boolean = false;

  constructor(private route: Router, private service: SharedService, private toastr: ToastrService) { }

  ngOnInit() {
    this.initForm()
  }

  initForm() {
    this.form = new FormGroup({
      current_password: new FormControl('', Validators.required),
      new_password: new FormControl('', [Validators.required, Validators.minLength(8)]),
      confirm_password: new FormControl('', Validators.required),
    });

    this.form.get('confirm_password')?.setValidators([
      Validators.required,
      this.passwordMatchValidator()
    ]);
  }

  submitForm() {
    this.form.markAllAsTouched();
    this.loading = true;
    if (this.form.valid && !this.passwordMismatch) {
      const formURlData = new URLSearchParams();
      //console.log()
      formURlData.set('current_password', this.form.value.current_password);
      formURlData.set('new_password', this.form.value.new_password);
      //formURlData.set('confirm_password', this.form.value.confirm_password);
      this.service.postAPI('user/changePassword', formURlData).subscribe({
        next: (resp) => {
          if (resp.status == 200) {
            this.toastr.success(resp.message);
            console.log(resp.message)
            this.form.reset();
            this.loading = false;
            //this.closeModal.nativeElement.click();
          } else {
            this.loading = false;
            this.toastr.warning(resp.message);
          }
        },
        error: (error) => {
          this.loading = false;
          this.toastr.warning('Current password is incorrect.');
          console.error('Login error:', error.message);
        }
      });
    }
  }

  passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const password = this.form.get('new_password')?.value;
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

  isPasswordVisible1: boolean = false;
  imageSrc1: string = 'assets/img/close_eye.svg';
  togglePasswordVisibility1() {
    this.isPasswordVisible1 = !this.isPasswordVisible1;
    this.imageSrc1 = this.isPasswordVisible1 ? 'assets/img/open_eye.svg' : 'assets/img/close_eye.svg';
  }

  isPasswordVisible2: boolean = false;
  imageSrc2: string = 'assets/img/close_eye.svg';
  togglePasswordVisibility2() {
    this.isPasswordVisible2 = !this.isPasswordVisible2;
    this.imageSrc2 = this.isPasswordVisible2 ? 'assets/img/open_eye.svg' : 'assets/img/close_eye.svg';
  }

  isPasswordVisible3: boolean = false;
  imageSrc3: string = 'assets/img/close_eye.svg';
  togglePasswordVisibility3() {
    this.isPasswordVisible3 = !this.isPasswordVisible3;
    this.imageSrc3 = this.isPasswordVisible3 ? 'assets/img/open_eye.svg' : 'assets/img/close_eye.svg';
  }

}
