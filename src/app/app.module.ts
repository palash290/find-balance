import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AngularFireModule } from '@angular/fire/compat';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { environment } from '../environments/environment';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './core/login/login.component';
import { ForgotPasswordComponent } from './core/forgot-password/forgot-password.component';
import { HomeComponent } from './core/home/home.component';
import { ToastrModule } from 'ngx-toastr';
import { SignupComponent } from './core/signup/signup.component';
import { VideoComponent } from './core/video/video.component';
import { SocketIoConfig, SocketIoModule } from 'ngx-socket-io';
import { SocketService } from './services/socket.service';
import { OtpVarifyComponent } from './core/otp-varify/otp-varify.component';
import { SignupUserComponent } from './core/signup-user/signup-user.component';
import { ResetPasswordComponent } from './core/reset-password/reset-password.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { OtpResetComponent } from './core/otp-reset/otp-reset.component';
import { initializeApp } from 'firebase/app';
import { AngularFireMessagingModule } from '@angular/fire/compat/messaging';
initializeApp(environment.firebaseConfig)

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ForgotPasswordComponent,
    HomeComponent,
    SignupComponent,
    VideoComponent,
    OtpVarifyComponent,
    SignupUserComponent,
    ResetPasswordComponent,
    OtpResetComponent,

  ],
  imports: [
    AngularFireModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireMessagingModule,
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ToastrModule.forRoot({
      timeOut: 5000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      progressBar: true
    }),
    
    // NgxLoadingModule.forRoot({
    //   animationType: ngxLoadingAnimationTypes.threeBounce,
    //   //backdropBackgroundColour: '#f5f2f0',
    //   backdropBorderRadius: "4px",
    //   primaryColour: "#4B3D15",
    //   secondaryColour: "#4B3D15",
    //   tertiaryColour: "#4B3D15",
    // }),
    //SocketIoModule.forRoot(config)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
