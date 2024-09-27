import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from '../../services/shared.service';
import { ToastrService } from 'ngx-toastr';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ImageCroppedEvent, LoadedImage } from 'ngx-image-cropper';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { numberRangeValidator } from '../../services/validators';


@Component({
  selector: 'app-add-event',
  templateUrl: './add-event.component.html',
  styleUrl: './add-event.component.css'
})
export class AddEventComponent {

  newForm!: FormGroup;
  loading: boolean = false;
  minDate: any;
  followedUsers: any[] = [];
  filteredUsers: any[] = [];
  selectedUsersIds: number[] = [];
  selectedCategoryNames: string[] = [];
  selectedCategoryIdsString: string = '';
  primaryCategoryId: any;
  userPlan: any;

  constructor(private route: Router, private service: SharedService, private toastr: ToastrService, private sanitizer: DomSanitizer) { }

  ngOnInit(): void {

    this.userPlan = localStorage.getItem('findPlan');
    this.initForm();

    this.service.getApi(`coach/myFollowers`).subscribe(response => {
      if (response.success) {
        this.followedUsers = response.data;
        //debugger
        setTimeout(() => {
          this.filteredUsers = response.data.filter((category: { id: any; }) => category.id !== this.primaryCategoryId);
        }, 1000);
      }
    });


  }

  showLimitError = false;

  onCategoryChange(event: any, category: any): void {
    if (event.target.checked) {
      // Check if more than 2 members are selected
      if (this.selectedUsersIds.length >= 20) {
        this.showLimitError = true; // Display an error message
        event.target.checked = false; // Uncheck the checkbox
        return;
      } else {
        this.showLimitError = false; // Hide the error message
      }

      // Add selected user ID and name
      this.selectedUsersIds.push(category.follower.id);
      this.selectedCategoryNames.push(category.follower.full_name);
    } else {
      // Remove user ID and name
      const indexId = this.selectedUsersIds.indexOf(category.follower.id);
      if (indexId > -1) {
        this.selectedUsersIds.splice(indexId, 1);
      }

      const indexName = this.selectedCategoryNames.indexOf(category.follower.full_name);
      if (indexName > -1) {
        this.selectedCategoryNames.splice(indexName, 1);
      }

      this.showLimitError = false; // Reset error message on deselection
    }

    this.selectedCategoryIdsString = this.selectedUsersIds.join(', ');
    // Update the form control value with the concatenated category names
    this.newForm.get('other_categ')?.setValue(this.selectedCategoryNames.join(', '));
  }


  // onCategoryChange(event: any, category: any): void {
  //   debugger
  //   if (event.target.checked) {
  //     this.selectedUsersIds.push(category.follower.id);
  //     this.selectedCategoryNames.push(category.follower.full_name);
  //   } else {
  //     const indexId = this.selectedUsersIds.indexOf(category.follower.id);
  //     if (indexId > -1) {
  //       this.selectedUsersIds.splice(indexId, 1);
  //     }

  //     const indexName = this.selectedCategoryNames.indexOf(category.follower.full_name);
  //     if (indexName > -1) {
  //       this.selectedCategoryNames.splice(indexName, 1);
  //     }
  //   }

  //   this.selectedCategoryIdsString = this.selectedUsersIds.join(', ');
  //   // Update the form control value with the concatenated category names
  //   this.newForm.get('other_categ')?.setValue(this.selectedCategoryNames.join(', '));
  // }

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
      eventType: new FormControl('', Validators.required), // Default to LIVE_EVENT
      //eventType: new FormControl('0', [Validators.required, this.eventTypeValidator]), 
      address: new FormControl(''), // For Live-event
      //code: new FormControl(''), // For Live-event
      webinarUrl: new FormControl(''), // For Webinar
      isPaid: new FormControl({ value: 0, disabled: this.userPlan != 'Premium' }), // Default to '0' (No)
      price: new FormControl('', [Validators.required,
      Validators.min(0),        // Ensure price is not negative
      Validators.max(99999)]), // Conditionally required if isPaid is '1'
      other_categ: new FormControl('')
    });

    // Set minDate for date field
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];

    // Listen to changes in the eventType field
    this.newForm.get('eventType')?.valueChanges.subscribe((eventType) => {
      if (eventType === 'LIVE_EVENT') {
        this.newForm.get('address')?.setValidators(Validators.required);
        //this.newForm.get('code')?.setValidators(Validators.required);
        this.newForm.get('webinarUrl')?.clearValidators();
      } else if (eventType === 'WEBINAR') {
        this.newForm.get('webinarUrl')?.setValidators(Validators.required);
        this.newForm.get('address')?.clearValidators();
        //this.newForm.get('code')?.clearValidators();
      }
      // Update the validators for the fields
      this.newForm.get('address')?.updateValueAndValidity();
      //this.newForm.get('code')?.updateValueAndValidity();
      this.newForm.get('webinarUrl')?.updateValueAndValidity();
    });

    // Listen to changes in isPaid and update price validators accordingly
    this.newForm.get('isPaid')?.valueChanges.subscribe(value => {
      if (value == '1') {
        this.newForm.get('price')?.setValidators([Validators.required,
        Validators.min(1),          // Ensure price is positive
        Validators.max(99999)]);
      } else {
        this.newForm.get('price')?.clearValidators();
      }
      this.newForm.get('price')?.updateValueAndValidity();
    });

    // const today = new Date();
    // this.minDate = today.toISOString().split('T')[0];

  }

  readonly MAX_FILE_SIZE_MB = 50;

  private isFileSizeValid(file: File): boolean {
    const maxSizeBytes = this.MAX_FILE_SIZE_MB * 1024 * 1024; // Convert MB to bytes
    return file.size <= maxSizeBytes;
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
      if (this.userPlan == 'Premium') {
        formData.set('isPaid', this.newForm.value.isPaid);
      } else {
        formData.set('isPaid', '0');
      }

      if (this.newForm.value.eventType === 'LIVE_EVENT') {
        formData.set('address', this.newForm.value.address);
        //formData.set('code', this.newForm.value.code);
      } else if (this.newForm.value.eventType === 'WEBINAR') {
        formData.set('webinar_url', this.newForm.value.webinarUrl);
      }

      if (this.newForm.value.isPaid == '1') {
        formData.set('adhocPrice', this.newForm.value.price);
      }

      const file = new File([this.cropImgBlob], 'profile_image.png', {
        type: 'image/png'
      })

      if (this.croppedImage) {
        formData.set('file', file);
      }

      if (this.selectedCategoryIdsString && this.newForm.value.isPaid == '1') {
        formData.set('receiverIds', this.selectedCategoryIdsString);
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
            this.route.navigateByUrl('/user/main/event-list')
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
