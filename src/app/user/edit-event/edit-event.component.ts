import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedService } from '../../services/shared.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Location } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-edit-event',
  templateUrl: './edit-event.component.html',
  styleUrl: './edit-event.component.css'
})
export class EditEventComponent {

  eventId: any;
  newForm!: FormGroup;
  loading: boolean = false;
  minDate: any;

  constructor(private route: ActivatedRoute, private service: SharedService, private router: Router, private toastr: ToastrService, private location: Location, private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.initForm();
    this.route.paramMap.subscribe(params => {
      this.eventId = params.get('eventId');
      console.log('Event ID:', this.eventId);
      this.getEventData(this.eventId)
    });
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
  }

  initForm() {
    this.newForm = new FormGroup({
      name: new FormControl('', Validators.required),
      about: new FormControl('', Validators.required),
      date: new FormControl('', Validators.required),
      cover: new FormControl(null),
      eventType: new FormControl({ value: '', disabled: true }),
      address: new FormControl(''), // For Live-event
      webinarUrl: new FormControl(''), // For Webinar
      isPaid: new FormControl({ value: 0, disabled: true }), // Default to '0' (No)
      price: new FormControl({ value: '', disabled: true }), // Conditionally required if isPaid is '1'
    })
  }

  data: any;
  isPaidValue: any;
  eventType: any;

  getEventData(id: any) {
    this.service.getApi(`coach/event/${id}`).subscribe({
      next: resp => {
        this.data = resp.data;
        const formattedDate = this.formatDate(this.data.date);
        this.newForm.patchValue({
          name: this.data.name,
          about: this.data.about,
          date: formattedDate,
          address: this.data.address,
          eventType: this.data.type,
          webinarUrl: this.data.webinar_url,
          isPaid: this.data.isPaid,
          price: this.data.adhocPrice, 
        })
        debugger
        this.croppedImage = this.data.mediaUrl;
        this.isPaidValue = this.data.isPaid;
        this.eventType = this.data.type;
      },
      error: error => {
        console.log(error.message)
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2); // Months are zero-based
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
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

  convertToISO(date: string): string {
    const [year, month, day] = date.split('-').map(num => parseInt(num, 10));
    const isoDate = new Date(year, month - 1, day).toISOString(); // Months are 0-based in JavaScript Date
    return isoDate;
  }

  editEvevt() {
    this.newForm.markAllAsTouched();
    if (this.newForm.valid) {
      this.loading = true;
      const isoDateString = this.convertToISO(this.newForm.value.date);
      const formURlData = new FormData();
      formURlData.set('name', this.newForm.value.name);
      formURlData.set('about', this.newForm.value.about);
      formURlData.set('date', isoDateString);
      //formURlData.set('address', this.newForm.value.address);
      formURlData.set('id', this.eventId);
      // if (this.UploadedBg) {
      //   formURlData.append('file', this.UploadedBg);
      // }

      if (this.eventType == 'LIVE_EVENT') {
        formURlData.set('address', this.newForm.value.address);
        //formData.set('code', this.newForm.value.code);
      } else if (this.eventType == 'WEBINAR') {
        formURlData.set('webinar_url', this.newForm.value.webinarUrl);
      }

      const file = new File([this.cropImgBlob], 'profile_image.png', {
        type: 'image/png'
      })

      if (this.croppedImage) {
        formURlData.append('file', file);
      }
      this.service.postAPIFormDataPatch('coach/event', formURlData).subscribe({
        next: (resp) => {
          if (resp.success === true) {
            this.toastr.success(resp.message);
            this.service.triggerRefresh();
            this.location.back();
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
