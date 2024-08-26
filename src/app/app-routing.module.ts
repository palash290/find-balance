import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './core/login/login.component';
import { ForgotPasswordComponent } from './core/forgot-password/forgot-password.component';
import { HomeComponent } from './core/home/home.component';
import { VideoComponent } from './core/video/video.component';
import { SignupComponent } from './core/signup/signup.component';
import { OtpVarifyComponent } from './core/otp-varify/otp-varify.component';
import { SignupUserComponent } from './core/signup-user/signup-user.component';
import { ResetPasswordComponent } from './core/reset-password/reset-password.component';
import { OtpResetComponent } from './core/otp-reset/otp-reset.component';
import { AuthGuard } from './services/auth.guard';
import { HomeGuard } from './services/home.guard';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/home'
  },
  {
    path: "login",
    component: LoginComponent, canActivate: [HomeGuard]
  },
  {
    path: "forgot-password",
    component: ForgotPasswordComponent, canActivate: [HomeGuard]
  },
  {
    path: "video",
    component: VideoComponent, 
  },
  {
    path: "home",
    component: HomeComponent, canActivate: [HomeGuard]
  },
  {
    path: "signup",
    component: SignupComponent, canActivate: [HomeGuard]
  },
  {
    path: "signup-user",
    component: SignupUserComponent, canActivate: [HomeGuard]
  },
  {
    path: "reset-password/:fullMobileNumber/:role",
    component: ResetPasswordComponent, canActivate: [HomeGuard]
  },
  {
    path: "otp/:fullMobileNumber/:role",
    component: OtpVarifyComponent, canActivate: [HomeGuard]
  },
  {
    path: "otp-reset/:fullMobileNumber/:role",
    component: OtpResetComponent, canActivate: [HomeGuard]
  },
  {
    path: 'user', canActivate: [AuthGuard],
    loadChildren: () => import('./user/user.module').then(m => m.UserModule)
  },
  { path: '**', redirectTo: '/home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
