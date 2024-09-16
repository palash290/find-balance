import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from '../../services/shared.service';
import { ToastrService } from 'ngx-toastr';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ImageCroppedEvent, LoadedImage } from 'ngx-image-cropper';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-add-event',
  templateUrl: './add-event.component.html',
  styleUrl: './add-event.component.css'
})
export class AddEventComponent {

  newForm!: FormGroup;
  loading: boolean = false;
  minDate: any;

  constructor(private route: Router, private service: SharedService, private toastr: ToastrService, private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.initForm();
  }

  // initForm() {
  //   this.newForm = new FormGroup({
  //     name: new FormControl('', Validators.required),
  //     about: new FormControl('', Validators.required),
  //     date: new FormControl('', Validators.required),
  //     address: new FormControl('', Validators.required),
  //     cover: new FormControl(null),
  //   });
  //   const today = new Date();
  //   this.minDate = today.toISOString().split('T')[0];
  // }
  initForm() {
    this.newForm = new FormGroup({
      name: new FormControl('', Validators.required),
      about: new FormControl('', Validators.required),
      date: new FormControl('', Validators.required),
      cover: new FormControl(null),
      eventType: new FormControl('LIVE_EVENT', Validators.required), // Default to LIVE_EVENT
      address: new FormControl(''), // For Live-event
      code: new FormControl(''), // For Live-event
      webinarUrl: new FormControl(''), // For Webinar
      isPaid: new FormControl(0, Validators.required), // Default to '0' (No)
      price: new FormControl('') // Conditionally required if isPaid is '1'
    });

    // Set minDate for date field
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];

    // Listen to changes in the eventType field
    this.newForm.get('eventType')?.valueChanges.subscribe((eventType) => {
      if (eventType === 'LIVE_EVENT') {
        this.newForm.get('address')?.setValidators(Validators.required);
        this.newForm.get('code')?.setValidators(Validators.required);
        this.newForm.get('webinarUrl')?.clearValidators();
      } else if (eventType === 'WEBINAR') {
        this.newForm.get('webinarUrl')?.setValidators(Validators.required);
        this.newForm.get('address')?.clearValidators();
        this.newForm.get('code')?.clearValidators();
      }
      // Update the validators for the fields
      this.newForm.get('address')?.updateValueAndValidity();
      this.newForm.get('code')?.updateValueAndValidity();
      this.newForm.get('webinarUrl')?.updateValueAndValidity();
    });

    // Listen to changes in the isPaid field
    this.newForm.get('isPaid')?.valueChanges.subscribe((isPaid) => {
      if (isPaid === 1) {
        this.newForm.get('price')?.setValidators(Validators.required);
      } else if (isPaid === 0) {
        this.newForm.get('price')?.clearValidators();
      }
      // Update the validators for the price field
      this.newForm.get('price')?.updateValueAndValidity();
    });
  }



  UploadedBg!: File;

  handleFileInput1(event: any) {
    const file = event.target.files[0];
    const img = document.getElementById('blah1') as HTMLImageElement;

    if (img && file) {
      img.style.display = 'block';
      const reader = new FileReader();
      reader.onload = (e: any) => {
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }

    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files?.length > 0) {
      this.UploadedBg = inputElement.files[0];
    }
  }

  // addEvent() {
  //   this.newForm.markAllAsTouched();
  //   if (this.newForm.valid) {
  //     this.loading = true;
  //     const formURlData = new FormData();
  //     formURlData.set('name', this.newForm.value.name);
  //     formURlData.set('about', this.newForm.value.about);
  //     formURlData.set('date', this.newForm.value.date);
  //     formURlData.set('address', this.newForm.value.address);

  //     const file = new File([this.cropImgBlob], 'profile_image.png', {
  //       type: 'image/png'
  //     })

  //     if (this.croppedImage) {
  //       formURlData.append('file', file);
  //     }
  //     this.service.postAPIFormData('coach/event', formURlData).subscribe({
  //       next: (resp) => {
  //         if (resp.success === true) {
  //           this.toastr.success(resp.message);
  //           this.service.triggerRefresh();
  //           this.newForm.reset();
  //           //this.getEventData()
  //           this.croppedImage = null
  //           this.loading = false;
  //         } else {
  //           this.toastr.warning(resp.message);
  //           this.loading = false;
  //         }
  //         //this.newForm.reset();  
  //       },
  //       error: error => {
  //         this.loading = false;
  //         this.toastr.error('Something went wrong.');
  //         console.log(error.statusText)
  //       }
  //     })
  //   }
  // }

  addEvent() {
    this.newForm.markAllAsTouched();
    if (this.newForm.valid) {
      this.loading = true;
      const formData = new FormData();
      formData.set('name', this.newForm.value.name);
      formData.set('about', this.newForm.value.about);
      formData.set('date', this.newForm.value.date);
      formData.set('type', this.newForm.value.eventType);
      formData.set('isPaid', this.newForm.value.isPaid);

      if (this.newForm.value.eventType === 'live') {
        formData.set('address', this.newForm.value.address);
        formData.set('code', this.newForm.value.code);
      } else if (this.newForm.value.eventType === 'webinar') {
        formData.set('webinarUrl', this.newForm.value.webinarUrl);
      }

      if (this.newForm.value.isPaid === 'yes') {
        formData.set('adhocPrice', this.newForm.value.price);
      }
      const file = new File([this.cropImgBlob], 'profile_image.png', {
        type: 'image/png'
      })

      if (this.croppedImage) {
        formData.set('file', file);
      }

      // Handle the file upload and API request as you are doing currently
      // this.service.postAPIFormData('your-endpoint', formData)
      //   .subscribe(response => {
      //     // Handle response
      //   });

      this.service.postAPIFormData('coach/event', formData).subscribe({
        next: (resp) => {
          if (resp.success === true) {
            this.toastr.success(resp.message);
            this.service.triggerRefresh();
            this.newForm.reset();
            //this.getEventData()
            this.croppedImage = null
            this.loading = false;
          } else {
            this.toastr.warning(resp.message);
            this.loading = false;
          }
          //this.newForm.reset();  
        },
        error: error => {
          this.loading = false;
          this.toastr.error('Something went wrong.');
          console.log(error.statusText)
        }
      })
    }
  }










  imageChangedEvent: Event | null = null;
  croppedImage: SafeUrl | null = '';
  cropImgBlob: any



  fileChangeEvent(event: Event): void {
    this.imageChangedEvent = event;
  }
  imageCropped(event: any) {
    this.croppedImage = this.sanitizer.bypassSecurityTrustUrl(event.objectUrl);
    this.cropImgBlob = event.blob;
    // event.blob can be used to upload the cropped image
  }


}
