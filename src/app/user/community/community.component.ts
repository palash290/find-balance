import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SharedService } from '../../services/shared.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-community',
  templateUrl: './community.component.html',
  styleUrl: './community.component.css'
})
export class CommunityComponent {

  @ViewChild('closeModal') closeModal!: ElementRef;
  @ViewChild('closeModal2') closeModal2!: ElementRef;
  newForm!: FormGroup;
  updateForm!: FormGroup
  role: any;
  isCoach: boolean = true;
  data: any;
  loading: boolean = false;
  UploadedFile!: File;
  updateDet: any;
  updateId: any;

  constructor(private route: Router, private service: SharedService, private toastr: ToastrService) { }


  ngOnInit(): void {
    this.role = this.service.getRole();
    if (this.role == 'USER') {
      this.isCoach = false;
    }
    this.getCommunityData();
    this.initForm();
    this.initUpdateForm();
  }

  initForm() {
    this.newForm = new FormGroup({
      title: new FormControl('', Validators.required),
      about: new FormControl('', Validators.required),
      image: new FormControl(null)
    })
  }

  initUpdateForm() {
    this.updateForm = new FormGroup({
      title: new FormControl(this.updateDet?.title, Validators.required),
      about: new FormControl(this.updateDet?.about, Validators.required),
      image: new FormControl(null),
    })
  }

  getCommunityData() {
    this.service.getApi('user/coach/followedCoaches').subscribe({
      next: resp => {
        this.data = resp.data;
      },
      error: error => {
        console.log(error.message)
      }
    });
  }

  addCommunity() {
    this.newForm.markAllAsTouched();
    if (this.newForm.valid) {
      const formURlData = new FormData();
      formURlData.set('title', this.newForm.value.title)
      formURlData.append('image', this.UploadedFile);
      formURlData.set('about', this.newForm.value.about);
      this.service.postAPIFormData('/admin/addEvent', formURlData).subscribe({
        next: (resp) => {
          if (resp.success === true) {
            this.closeModal.nativeElement.click();
            this.getCommunityData();
          }
          this.newForm.reset();
          this.toastr.success(resp.message);
        },
        error: error => {
          this.toastr.warning('Something went wrong.');
          console.log(error.message)
        }
      })
    }
  }

  patchUpdate(details: any) {
    this.updateDet = details;
    this.updateId = details.id;
    this.initUpdateForm();
  }

  handleCommittedFileInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files.length > 0) {
      this.UploadedFile = inputElement.files[0];
    }
  }

  onUpdate() {
    this.updateForm.markAllAsTouched();
    if (this.updateForm.valid) {
      const formURlData = new FormData();
      formURlData.set('title', this.updateForm.value.title)
      formURlData.set('about', this.updateForm.value.about)
      if(this.UploadedFile){
        formURlData.append('image', this.UploadedFile);
      }
      //formURlData.append('image', this.UploadedFile);
      
      formURlData.set('eventId', this.updateId)
      this.service.postAPIFormData('/admin/editEvent', formURlData).subscribe({
        next: (resp) => {
          if (resp.success === true) {
            this.closeModal2.nativeElement.click();
            // this.toastr.success(resp.message);
            this.toastr.success('Update successful!');
            this.getCommunityData()
          } else {
            this.toastr.warning(resp.message);
          }
          //this.newForm.reset();  
        },
        error: error => {
          this.toastr.error('Something went wrong.');
          console.log(error.message)
        }
      })
    }
  }

  deleteField(id: any) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger"
      },
    });

    swalWithBootstrapButtons.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
      reverseButtons: true,
      confirmButtonColor: "#b92525",
    })
      .then((result) => {
        if (result.isConfirmed) {
          const formURlData = new URLSearchParams();
          formURlData.set('id', id);
          this.service.deleteAcc(`/admin/event/${id}`).subscribe({
            next: resp => {
              console.log(resp)
              this.toastr.success(resp.message)
              this.getCommunityData();
            },
            error: error => {
              console.log(error.message)
            }
          });
        }
      });
  }

  handleFileInput(event: any) {
    const file = event.target.files[0];
    const img = document.getElementById('blah') as HTMLImageElement;

    if (img && file) {
      img.style.display = 'block';
      const reader = new FileReader();
      reader.onload = (e: any) => {
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }

    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files.length > 0) {
      this.UploadedFile = inputElement.files[0];
    }

  }


}
