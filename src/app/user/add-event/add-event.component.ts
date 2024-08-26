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

  initForm() {
    this.newForm = new FormGroup({
      name: new FormControl('', Validators.required),
      about: new FormControl('', Validators.required),
      date: new FormControl('', Validators.required),
      address: new FormControl('', Validators.required),
      cover: new FormControl(null),
    });
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
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

  addEvevt() {
    this.newForm.markAllAsTouched();
    if (this.newForm.valid) {
      this.loading = true;
      const formURlData = new FormData();
      formURlData.set('name', this.newForm.value.name);
      formURlData.set('about', this.newForm.value.about);
      formURlData.set('date', this.newForm.value.date);
      formURlData.set('address', this.newForm.value.address);

      const file = new File([this.cropImgBlob], 'profile_image.png', {
        type: 'image/png'
      })

      if (this.croppedImage) {
        formURlData.append('file', file);
      }
      this.service.postAPIFormData('coach/event', formURlData).subscribe({
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
  croppedImage: SafeUrl | null  = '';
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
