import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from '../../services/shared.service';
import { ToastrService } from 'ngx-toastr';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipEditedEvent, MatChipInputEvent } from '@angular/material/chips';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.css'
})
export class EditProfileComponent {

  newForm!: FormGroup;
  role: any;
  isCoach: boolean = true;
  UploadedProfile!: File;
  UploadedBg!: File;
  data: any;
  loading: boolean = false;
  categories: any[] = [];
  filteredCategories: any[] = [];
  imageChanged: boolean = false;
  primaryCategoryId: any;

  constructor(private route: Router, private service: SharedService, private toastr: ToastrService, private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.role = this.service.getRole();
    if (this.role == 'USER') {
      this.isCoach = false;
    }
    this.initForm();
    this.getProfileData();
    this.service.getApi('coach/categories').subscribe(response => {
      if (response.success) {
        this.categories = response.data;
        //debugger
        setTimeout(() => {
          this.filteredCategories = response.data.filter((category: { id: any; }) => category.id !== this.primaryCategoryId);
        }, 1000);
      }
    });
  }

  initForm() {
    this.newForm = new FormGroup({
      full_name: new FormControl('', Validators.required),
      about_me: new FormControl('', Validators.required),
      avatar: new FormControl(null),
      cover: new FormControl(null),
      categoryId: new FormControl(''),
      certificates: new FormControl(''),
      compliments: new FormControl(''),
      exp: new FormControl('', [Validators.pattern(/^\d+(\.\d+)?$/)]),
      email: new FormControl({ value: '', disabled: true }),
      education: new FormControl(''),
      other_categ: new FormControl('',  this.getOtherCategValidators())
    })
  }

  checkForInvalidValue() {
    const expControl = this.newForm.get('exp');
    const expValue = expControl?.value;

    // Check if the value is negative or contains invalid characters
    if (expValue && (parseFloat(expValue) < 0 || !/^\d+(\.\d+)?$/.test(expValue))) {
      expControl?.setErrors({ pattern: true });
    } else {
      expControl?.setErrors(null);
    }
    expControl?.updateValueAndValidity();
  }
  
  

  getOtherCategValidators() {
    // Conditionally return validators based on isCoach value
    return this.isCoach ? [Validators.required] : [];
  }

  getProfileData() {
    this.service.getApi(this.isCoach ? 'coach/myProfile' : 'user/myProfile').subscribe({
      next: resp => {
        if (this.isCoach) {
          this.data = resp.data;
          this.newForm.patchValue({
            full_name: this.data.full_name,
            about_me: this.data.about_me,
            categoryId: this.data.category.id,
            exp: this.data.experience,
            education: this.data.education,
            email: this.data.email
          });

          this.primaryCategoryId = this.data.category.id;
          // Extract the selected category IDs and names
          this.selectedCategoryIds = resp.data.CoachCategory.map((item: { category: { id: any; }; }) => item.category.id);
          this.selectedCategoryNames = resp.data.CoachCategory.map((item: { category: { name: any; }; }) => item.category.name);

          // Update the comma-separated strings
          this.selectedCategoryIdsString = this.selectedCategoryIds.join(', ');
          this.selectedCategoryNamesString = this.selectedCategoryNames.join(', ');

          // Update the input field with the concatenated category names
          this.newForm.get('other_categ')?.setValue(this.selectedCategoryNamesString);

        } else {
          this.data = resp.user;
          this.newForm.patchValue({
            full_name: this.data.full_name,
            about_me: this.data.about_me,
            education: this.data.education,
            email: this.data.email
          })
        }
        this.croppedImage = this.data.cover_photo_url

        // Parse the comma-separated strings into arrays of objects
        this.certificates.update(certificates => this.parseCommaSeparated(this.data.certificates));
        this.compliments.update(accomplishments => this.parseCommaSeparated(this.data.accomplishments));

      },
      error: error => {
        console.log(error.message)
      }
    });
  }

  parseCommaSeparated(value: any): any[] {
    if (!value) return [];
    return value.split(',').map((item: any) => ({ name: item.trim() }));
  }

  handleFileInput2(event: any) {
    const file = event.target.files[0];
    const img = document.getElementById('blah2') as HTMLImageElement;

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
      this.UploadedProfile = inputElement.files[0];
    }
  }

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

  onUpdate() {

    this.newForm.markAllAsTouched();

    if (this.newForm.valid) {
      this.loading = true;

      const formURlData = new FormData();

      formURlData.set('full_name', this.newForm.value.full_name);

      if (this.newForm.value.about_me) {
        formURlData.set('about_me', this.newForm.value.about_me);
      }

      if (this.newForm.value.education) {
        formURlData.set('education', this.newForm.value.education);
      } else {
        formURlData.set('education', '');
      }

     
      if (this.UploadedProfile) {
        formURlData.append('avatar', this.UploadedProfile);
      }

      if (this.isCoach) {
        const certificatesString = this.getCertificatesString();
        const compString = this.getComplimentsString();
        if (compString) {
          formURlData.set('accomplishments', compString);
        } else {
          formURlData.set('accomplishments', '');
        }
        if (this.selectedCategoryIdsString) {
          formURlData.set('secondCategories', this.selectedCategoryIdsString);
        }

        if (certificatesString) {
          formURlData.append('certificates', certificatesString);
        } else{
          formURlData.append('certificates', '');
        }
        if (this.newForm.value.exp) {
          formURlData.set('experience', this.newForm.value.exp);
        } else{
          formURlData.set('experience', '');
        }
      
        if (this.newForm.value.categoryId) {
          formURlData.append('categoryId', this.newForm.value.categoryId);
        }
      }


      // if (this.UploadedBg) {
      //   formURlData.append('cover', this.UploadedBg);
      // }
      // Append the cropped image if it has changed
      if (this.imageChanged && this.cropImgBlob) {
        const file = new File([this.cropImgBlob], 'profile_image.png', {
          type: 'image/png'
        });
        formURlData.append('cover', file);
      }
      // const file = new File([this.cropImgBlob], 'profile_image.png', {
      //   type: 'image/png'
      // })

      // if (file) {
      //   formURlData.append('cover', file);
      // }
      //formURlData.append('image', this.UploadedFile);
      this.service.postAPIFormData(this.isCoach ? 'coach/editProfile' : 'user/editProfile', formURlData).subscribe({
        next: (resp) => {
          if (resp.success === true) {
            this.toastr.success(resp.message);
            this.route.navigateByUrl('user/main/my-profile');
            this.loading = false;
            this.service.triggerRefresh();
            this.croppedImage = null;
            this.cropImgBlob = null;
            this.imageChanged = false;
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


  selectedCategoryIds: number[] = [];
  selectedCategoryNames: string[] = [];

  selectedCategoryIdsString: string = '';
  selectedCategoryNamesString: string = '';

  onCategoryChange(event: any, category: any): void {
    if (event.target.checked) {
      this.selectedCategoryIds.push(category.id);
      this.selectedCategoryNames.push(category.name);
    } else {
      const indexId = this.selectedCategoryIds.indexOf(category.id);
      if (indexId > -1) {
        this.selectedCategoryIds.splice(indexId, 1);
      }

      const indexName = this.selectedCategoryNames.indexOf(category.name);
      if (indexName > -1) {
        this.selectedCategoryNames.splice(indexName, 1);
      }
    }

    this.selectedCategoryIdsString = this.selectedCategoryIds.join(', ');
    // Update the form control value with the concatenated category names
    this.newForm.get('other_categ')?.setValue(this.selectedCategoryNames.join(', '));
  }




  imageChangedEvent: Event | null = null;
  croppedImage: SafeUrl | null = '';
  cropImgBlob: any

  @ViewChild('closeModal') closeModal!: ElementRef;

  fileChangeEvent(event: Event): void {
    // if (!this.croppedImage) {
    //   this.closeModal.nativeElement.click();
    // }
    this.imageChangedEvent = event;
  }
  imageCropped(event: any) {
    this.croppedImage = this.sanitizer.bypassSecurityTrustUrl(event.objectUrl);
    this.cropImgBlob = event.blob;
    this.imageChanged = true;
    // event.blob can be used to upload the cropped image
  }







  addOnBlur = true;
  separatorKeysCodes = [ENTER, COMMA] as const;

  certificates = signal<any[]>([]);

  compliments = signal<any[]>([]);

  announcer = inject(LiveAnnouncer);

  addCertificate(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    if (value) {
      this.certificates.update(certificates => [...certificates, { name: value }]);
    }

    event.chipInput!.clear();
  }

  removeCertificate(certificate: any): void {
    this.certificates.update(certificates => {
      const index = certificates.indexOf(certificate);
      if (index >= 0) {
        certificates.splice(index, 1);
        this.announcer.announce(`Removed ${certificate.name}`);
        return [...certificates];
      }
      return certificates;
    });
  }

  editCertificate(certificate: any, event: MatChipEditedEvent): void {
    const value = event.value.trim();

    if (!value) {
      this.removeCertificate(certificate);
      return;
    }

    this.certificates.update(certificates => {
      const index = certificates.indexOf(certificate);
      if (index >= 0) {
        certificates[index].name = value;
        return [...certificates];
      }
      return certificates;
    });
  }

  addCompliment(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    if (value) {
      this.compliments.update(compliments => [...compliments, { name: value }]);
    }

    event.chipInput!.clear();
  }

  removeCompliment(compliment: any): void {
    this.compliments.update(compliments => {
      const index = compliments.indexOf(compliment);
      if (index >= 0) {
        compliments.splice(index, 1);
        this.announcer.announce(`Removed ${compliment.name}`);
        return [...compliments];
      }
      return compliments;
    });
  }

  editCompliment(compliment: any, event: MatChipEditedEvent): void {
    const value = event.value.trim();

    if (!value) {
      this.removeCompliment(compliment);
      return;
    }

    this.compliments.update(compliments => {
      const index = compliments.indexOf(compliment);
      if (index >= 0) {
        compliments[index].name = value;
        return [...compliments];
      }
      return compliments;
    });
  }

  // Method to get certificates as a comma-separated string
  getCertificatesString(): string {
    return this.certificates().map(cert => cert.name).join(', ');
  }

  // Method to get compliments as a comma-separated string
  getComplimentsString(): string {
    return this.compliments().map(comp => comp.name).join(', ');
  }


}
