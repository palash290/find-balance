import { Component } from '@angular/core';
import { SharedService } from '../../services/shared.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-post',
  templateUrl: './add-post.component.html',
  styleUrl: './add-post.component.css'
})
export class AddPostComponent {
  isActive: boolean = false

  toggle(type: string) {
    let audioBtn = document.getElementById('ct_audio_btn')
    let videoBtn = document.getElementById('ct_video_btn')
    let audio = document.getElementById('ct_audio')
    let video = document.getElementById('ct_video')

    if (type === 'Video') {
      videoBtn?.classList.add('ct_uploaded_btn_active')
      audioBtn?.classList.remove('ct_uploaded_btn_active')
      audio?.classList.remove('d-block')
      video?.classList.add('d-block')
    } else {
      videoBtn?.classList.remove('ct_uploaded_btn_active')
      audioBtn?.classList.add('ct_uploaded_btn_active')
      audio?.classList.add('d-block')
      video?.classList.remove('d-block')
    }
  }

  avatar_url_fb: any;
  categories: any[] = [];
  communityId: any;
  teamId: any;

  constructor(private route: Router, private service: SharedService, private toastr: ToastrService) { }

  ngOnInit() {
    this.service.getApi('coach/categories').subscribe(response => {
      if (response.success) {
        this.categories = response.data;
      }
      this.avatar_url_fb = localStorage.getItem('avatar_url_fb');

    });


  }

  categoryId: any = '1';
  selectedCategoryName: string | undefined;

  onCategoryChange(event: any): void {
    const selectedId = event.target.value;
    const selectedCategory = this.categories.find(category => category.id == selectedId);

    if (selectedCategory) {
      this.categoryId = selectedCategory.id;
      this.selectedCategoryName = selectedCategory.name;
      console.log('Selected Category ID:', this.categoryId);
      console.log('Selected Category Name:', this.selectedCategoryName);
    }
  }

  postText: any;
  audioFile: File | null = null;
  videoFile: File | null = null;
  readonly MAX_FILE_SIZE_MB = 50;
  videoPreviewUrl: string | null = null;

  onAudioFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files?.length > 0) {
      const file = input.files[0];
      if (this.isFileSizeValid(file)) {
        this.audioFile = file;
      } else {
        this.toastr.warning('Audio file exceeds the maximum size of 50 MB.');
        input.value = ''; // Clear the input
      }
    }
  }

  onVideoFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files?.length > 0) {
      const file = input.files[0];
      if (this.isFileSizeValid(file)) {
        this.videoFile = file;
        this.createVideoPreview(file);
      } else {
        this.toastr.warning('Video file exceeds the maximum size of 50 MB.');
        input.value = ''; // Clear the input
      }
    }
  }

  createVideoPreview(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.videoPreviewUrl = e.target.result;
    };
    reader.readAsDataURL(file);
  }


  btnLoader: boolean = false;
  uploadFiles() {
    this.communityId = localStorage.getItem('communityId');
    this.teamId = localStorage.getItem('teamId');
    const trimmedMessage = this.postText ? this.postText?.trim() : '';

    if (!this.audioFile && !this.videoFile && trimmedMessage == '') {
      return;
    }

    const formData = new FormData();
    if (this.audioFile) {
      formData.append('file', this.audioFile);
      formData.append('type', 'PODCAST');
      if (this.postText) {
        formData.append('text', trimmedMessage);
      }
    }
    if (this.videoFile) {
      formData.append('file', this.videoFile);
      formData.append('type', 'VIDEO');
      if (this.postText) {
        formData.append('text', trimmedMessage);
      }
    }

    if (this.communityId) {
      formData.append('communityId', this.communityId);
    }
    if (this.teamId) {
      formData.append('teamId', this.teamId);
    }

    if (this.postText && !this.audioFile && !this.videoFile) {
      formData.append('text', trimmedMessage);
      formData.append('type', 'ARTICLE');
      // if (trimmedMessage === '') {
      //   return;
      // }
    }

    formData.append('categoryId', this.categoryId);
    let audio = document.getElementById('ct_audio')
    let video = document.getElementById('ct_video')
    this.btnLoader = true;
    this.service.postAPIFormData('coach/post', formData).subscribe({
      next: (response) => {
        this.audioFile = null;
        this.videoFile = null;
        this.videoPreviewUrl = null;
        this.postText = '';
        this.toastr.success(response.message);
        console.log('Upload successful', response);
        audio?.classList.remove('d-block');
        video?.classList.remove('d-block');
        this.btnLoader = false;
        this.service.triggerRefresh();
        //window.location.reload();
      },
      error: (error) => {
        this.btnLoader = false;
        this.toastr.error('Error uploading files!');
        console.error('Upload error', error);
      }
    });
  }

  private isFileSizeValid(file: File): boolean {
    const maxSizeBytes = this.MAX_FILE_SIZE_MB * 1024 * 1024; // Convert MB to bytes
    return file.size <= maxSizeBytes;
  }


}
