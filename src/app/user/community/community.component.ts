import { Component, ElementRef, QueryList, ViewChild, ViewChildren } from '@angular/core';
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
  @ViewChild('closeModal1') closeModal1!: ElementRef;
  newForm!: FormGroup;
  updateForm!: FormGroup
  role: any;
  isCoach: boolean = true;
  communityData: any;
  loading: boolean = false;
  UploadedFile!: File;
  UploadedEditFile!: File;
  updateDet: any;
  updateId: any;
  searchQueryFilter = '';

  constructor(private route: Router, private service: SharedService, private toastr: ToastrService) { }

  toSee: boolean = true
  seeGroupMembesr() {
    this.toSee = !this.toSee
  }

  userId: any;

  ngOnInit(): void {
    this.role = this.service.getRole();
    if (this.role == 'USER') {
      this.isCoach = false;
    }
    this.getCommunityData();
    this.initForm();
    this.initUpdateForm();
    this.userId = localStorage.getItem('fbId');
    this.service.refreshSidebar$.subscribe(() => {
      this.getCommunityPosts();
    });
  }

  initForm() {
    this.newForm = new FormGroup({
      title: new FormControl('', Validators.required),
      about: new FormControl(''),
      image: new FormControl(null)
    })
  }

  initUpdateForm() {
    this.updateForm = new FormGroup({
      title: new FormControl('', Validators.required),
      about: new FormControl(''),
      image: new FormControl(null)
    })
  }


  eventImage: any;
  communityId: any;

  communityName: any;
  communityImg: any;
  numberOfParticipant: any;
  numberOfPosts: any;
  isParticipant: boolean = false;
  isAdmin: boolean = false;
  communityParticipants: any;
  communityAdminName: any;
  communityAdminImg: any;
  communityAdminid: any;
  communityAdminRole: any;
  selectedCommunityId: number | null = null;

  getCommunityData() {
    this.service.getApi(this.isCoach ? 'coach/communtiy' : 'user/communtiy').subscribe({
      next: resp => {
        this.communityData = resp.data;
      },
      error: error => {
        console.log(error.message)
      }
    });
  }

  getCommunityProfileData(cId: any, participantCheck: boolean, isAdmin: boolean) {

    this.isAdmin = isAdmin
    if (participantCheck || isAdmin) {
      this.communityId = cId;
      this.selectedCommunityId = cId;

      localStorage.setItem('communityId', this.communityId)
      this.service.getApi(this.isCoach ? `coach/communtiy/${cId}` : `user/communtiy/${cId}`).subscribe({
        next: resp => {
          if (this.isCoach) {
            this.updateForm.patchValue({
              title: resp.data.title,
              about: resp.data.description,
            });
          }

          this.eventImage = resp.data.mediaUrl;
          this.communityName = resp.data.title;
          this.numberOfParticipant = resp.data.numberOfParticipant;
          this.numberOfPosts = resp.data.numberOfPosts;
          this.isParticipant = resp.data.isParticipant;
          //this.isAdmin = resp.data.isAdmin;
          this.communityImg = resp.data.mediaUrl;
          //debugger
          this.communityParticipants = resp.data.Participant;

          this.communityAdminid = resp.data.admin.id;
          this.communityAdminName = resp.data.admin.full_name;
          this.communityAdminImg = resp.data.admin.avatar_url;
          this.communityAdminRole = resp.data.admin.role;

          // this.communityParticipants = resp.data.Participant.filter(
          //   (participant: any) => participant.id !== this.communityAdminid
          // );

          this.getCommunityPosts();

        },
        error: error => {
          console.log(error.message)
        }
      });
    } else {
      this.toastr.warning('Please join community first.')
    }
  }

  btnLoader: boolean = false;
  followId1: any;

  joinCommunity(communityId: any) {
    this.followId1 = communityId;
    const formURlData = new URLSearchParams();
    formURlData.set('communityId', communityId);
    this.btnLoader = true;
    this.service.postAPI(this.isCoach ? 'coach/communtiy/join' : 'user/communtiy/join', formURlData.toString()).subscribe({
      next: (response) => {
        this.btnLoader = false;
        this.getCommunityProfileData(communityId, true, false);
        this.getCommunityData();
      },
      error: (error) => {
        this.btnLoader = false;
        console.error('Upload error', error);
      }
    });
  }

  btnLoader1: boolean = false;
  followId: any;


  leaveCommunity(communityId: any) {
    this.followId = communityId;
    const formURlData = new URLSearchParams();
    formURlData.set('communityId', communityId);
    this.btnLoader1 = true;
    this.service.postAPI(this.isCoach ? 'coach/communtiy/leave' : 'user/communtiy/leave', formURlData.toString()).subscribe({
      next: (response) => {
        this.btnLoader1 = false;
        //this.getCommunityProfileData(this.communityId, false);
        this.getCommunityData();
        this.communityName = '';
      },
      error: (error) => {
        this.btnLoader1 = false;
        console.error('Upload error', error);
      }
    });
  }

  btnLoaderCreate: boolean = false;


  createCommunity() {
    this.newForm.markAllAsTouched();
    if (this.newForm.valid) {
      this.btnLoaderCreate = true;
      const formURlData = new FormData();
      formURlData.set('title', this.newForm.value.title);
      if (this.UploadedFile) {
        formURlData.append('file', this.UploadedFile);
      }
      if (this.newForm.value.about) {
        formURlData.set('description', this.newForm.value.about);
      }
      this.service.postAPIFormData('coach/communtiy', formURlData).subscribe({
        next: (resp) => {
          if (resp.success === true) {
            this.closeModal.nativeElement.click();
            this.getCommunityData();
          }
          this.btnLoaderCreate = false;
          this.newForm.reset();
          this.toastr.success(resp.message);
        },
        error: error => {
          this.btnLoaderCreate = false;
          this.toastr.warning('Something went wrong.');
          console.log(error.message)
        }
      })
    }
  }

  btnLoaderEdit: boolean = false;

  editCommunity() {
    this.updateForm.markAllAsTouched();
    if (this.updateForm.valid) {
      this.btnLoaderEdit = true;
      const formURlData = new FormData();
      formURlData.set('title', this.updateForm.value.title)
      if (this.UploadedEditFile) {
        formURlData.append('file', this.UploadedEditFile);
      }
      formURlData.set('description', this.updateForm.value.about);
      formURlData.set('communityId', this.communityId);
      this.service.postAPIFormDataPatch('coach/communtiy', formURlData).subscribe({
        next: (resp) => {
          if (resp.success === true) {
            this.closeModal1.nativeElement.click();
            this.toastr.success(resp.message);
            this.btnLoaderEdit = false;
            this.getCommunityData();
          } else {
            this.toastr.warning(resp.message);
            this.btnLoaderEdit = false;
          }
          //this.newForm.reset();  
        },
        error: error => {
          this.btnLoaderEdit = false;
          this.toastr.error('Something went wrong.');
          console.log(error.statusText)
        }
      })
    }
  }



  croppedImage: any | ArrayBuffer | null = null;

  handleCommittedFileInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files.length > 0) {
      this.UploadedFile = inputElement.files[0];
      this.previewImage(this.UploadedFile);
    }
  }

  previewImage(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      this.croppedImage = e.target?.result;
    };
    reader.readAsDataURL(file);
  }

  handleCommittedFileInput1(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files.length > 0) {
      this.UploadedEditFile = inputElement.files[0];
      this.previewImage1(this.UploadedEditFile);
    }
  }

  previewImage1(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      this.eventImage = e.target?.result;
    };
    reader.readAsDataURL(file);
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


  ///////////////feeds///////////////
  communityFeeds: any;

  getCommunityPosts() {
    this.service.getApi(this.isCoach ? `coach/communtiy/allPosts/${this.communityId}` : `user/allPosts?communityId=${this.communityId}`).subscribe({
      next: resp => {
        if (this.isCoach) {
          this.communityFeeds = resp.data?.map((item: any) => ({ ...item, isExpanded: false, isPlaying: false }));
        } else {
          this.communityFeeds = resp.data?.map((item: any) => ({ ...item, isExpanded: false, isPlaying: false }));
        }
      },
      error: error => {
        console.log(error.message)
      }
    });
  }

  shortTextLength: number = 270;

  toggleContent(index: number): void {
    this.communityFeeds[index].isExpanded = !this.communityFeeds[index].isExpanded;
  }

  shouldShowReadMore(text: string): boolean {
    return text?.length > this.shortTextLength;
  }

  deletePost(id: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this post!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.deleteAcc(`coach/post/${id}`).subscribe({
          next: (resp) => {
            if (resp.success) {
              Swal.fire(
                'Deleted!',
                'Your post has been deleted successfully.',
                'success'
              );
              this.getCommunityPosts();
              //this.route.navigateByUrl('/home')
              //this.toastr.success(resp.message);
            } else {
              this.getCommunityPosts();
              //this.toastr.warning(resp.message);
            }
          },
          error: (error) => {
            Swal.fire(
              'Error!',
              'There was an error deleting your post.',
              'error'
            );
            this.getCommunityPosts();
            //this.toastr.error('Error deleting account!');
            console.error('Error deleting account', error);
          }
        });
      }
    });
  }

  //For video
  @ViewChildren('videoPlayer') videoPlayers!: QueryList<ElementRef>;

  currentVideoId: any | null = null;
  currentTime: number = 0;
  videoDuration: number = 0;

  toggleVideo(videoElement: HTMLVideoElement) {

    // if (this.currentAudio) {
    //   this.currentAudio.pause();
    // }

    if (this.currentVideoId && this.currentVideoId !== videoElement) {
      this.currentVideoId.pause(); // Pause the currently playing video
    }

    if (videoElement.paused) {
      videoElement.play();
      this.currentVideoId = videoElement;
    } else {
      videoElement.pause();
      this.currentVideoId = null;
    }
  }

  isVideoPlaying(videoElement: HTMLVideoElement): boolean {
    return videoElement === this.currentVideoId && !videoElement.paused;
  }

  onTimeUpdate(videoElement: HTMLVideoElement) {
    if (this.isVideoPlaying(videoElement)) {
      const seekBar: HTMLInputElement = document.querySelector('.custom-seekbar')!;
      seekBar.value = (videoElement.currentTime / videoElement.duration * 100).toString();
      this.currentTime = videoElement.currentTime;
      this.setVideoDuration(videoElement);
    }
  }

  setVideoDuration(videoElement: HTMLVideoElement) {
    if (this.isVideoPlaying(videoElement)) {
      const seekBar: HTMLInputElement = document.querySelector('.custom-seekbar')!;
      seekBar.max = "100";
      this.videoDuration = videoElement.duration;
    }
  }

  onSeek(event: Event, videoElement: HTMLVideoElement) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    const time = (parseFloat(value) / 100) * videoElement.duration;
    videoElement.currentTime = time;
  }

  formatTime(time: number): string {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  likePost(postId: any) {
    //this.isLike = !this.isLike;
    this.service.postAPI(this.isCoach ? `coach/post/react/${postId}` : `user/post/react/${postId}`, null).subscribe({
      next: resp => {
        console.log(resp);
        this.getCommunityPosts();
      },
      error: error => {
        console.log(error.message)
      }
    });
  }

  postComments: any[] = [];
  showCmt: { [key: string]: boolean } = {};
  currentOpenCommentBoxId: number | null = null;

  toggleCommentBox(id: number): void {
    if (this.currentOpenCommentBoxId === id) {
      // Toggle off if the same box is clicked again
      this.showCmt[id] = !this.showCmt[id];
      if (!this.showCmt[id]) {
        this.currentOpenCommentBoxId = null;
      }
    } else {
      // Close any previously open box and open the new one
      this.showCmt[this.currentOpenCommentBoxId || -1] = false;
      this.currentOpenCommentBoxId = id;
      this.showCmt[id] = true;
      this.getPostComments(id);
    }
  }

  commentsToShow: { [key: number]: number } = {}; // Track number of comments to show
  readonly defaultCommentsCount = 3;

  getPostComments(postId: any) {
    this.service.getApi(this.isCoach ? `coach/comment/${postId}` : `user/post/comment/${postId}`).subscribe({
      next: resp => {
        this.postComments = resp.data?.map((item: any) => ({ ...item, isExpanded: false }));
        //this.postComments = [...tempData, ...this.postComments]
        //console.log('========>', this.postComments)
        this.commentsToShow[postId] = this.defaultCommentsCount;
      },
      error: error => {
        console.log(error.message)
      }
    });
  }

  bookmarkPost(postId: any) {
    //this.isBookmark = !this.isBookmark;
    this.service.postAPI(`user/post/saveOrUnsave/${postId}`, null).subscribe({
      next: resp => {
        console.log(resp);
        this.getCommunityPosts();
      },
      error: error => {
        console.log(error.message)
      }
    });
  }

  commentText: any;
  btnLoaderCmt: boolean = false;

  addComment(id: any) {
    const trimmedMessage = this.commentText?.trim();
    if (trimmedMessage === '') {
      return;
    }
    const formData = new URLSearchParams();
    formData.set('postId', id);
    formData.set('content', this.commentText);
    this.btnLoaderCmt = true;
    this.service.postAPI(this.isCoach ? `coach/comment` : `user/post/comment`, formData.toString()).subscribe({
      next: (response) => {
        console.log(response)
        this.commentText = '';
        this.getPostComments(id);
        this.btnLoaderCmt = false;
        this.getCommunityPosts();
      },
      error: (error) => {
        //this.toastr.error('Error uploading files!');
        console.error('Upload error', error);
        this.btnLoaderCmt = false;
      }
    });
  }

  toggleCommentText(index: number): void {
    this.postComments[index].isExpanded = !this.postComments[index].isExpanded;
  }

  btnLoaderCmtDel: boolean = false;
  deleteId: any;

  deleteComment(cmtId: any, postId: any) {
    this.deleteId = cmtId;
    //this.isLike = !this.isLike;
    this.btnLoaderCmtDel = true;
    this.service.deleteAcc(this.isCoach ? `coach/comment/${cmtId}` : `user/post/comment/${cmtId}`).subscribe({
      next: resp => {
        console.log(resp);
        this.getPostComments(postId);
        this.btnLoaderCmtDel = false;
        this.getCommunityPosts();
      },
      error: error => {
        console.log(error.message);
        this.btnLoaderCmtDel = false;
      }
    });
  }

  likeComment(cmtId: any, postId: any) {
    //this.isLike = !this.isLike;
    this.service.postAPI(this.isCoach ? `coach/comment/react/${cmtId}` : `user/post/comment/react/${cmtId}`, null).subscribe({
      next: resp => {
        console.log(resp);
        this.getPostComments(postId);
      },
      error: error => {
        console.log(error.message)
      }
    });
  }

  shouldShowLoadMore(id: number): boolean {
    return this.postComments && this.postComments?.length > this.commentsToShow[id];
  }

  loadMoreComments(id: number): void {
    this.commentsToShow[id] += 2; // Load 2 more comments
  }

  ngOnDestroy() {
    this.communityId = ''
    localStorage.setItem('communityId', this.communityId)
  }
  //ngOnDestroy(){}


  isChatActive = false;

  //responsive hide/show
  openChat() {
    this.isChatActive = true;
  }
  closeChat() {
    this.isChatActive = false;
  }

  deleteCommunity() {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this community!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.deleteAcc(`coach/communtiy/${this.communityId}`).subscribe({
          next: (resp) => {
            if (resp.success) {
              Swal.fire(
                'Deleted!',
                'Your community has been deleted successfully.',
                'success'
              );
              this.getCommunityData();
              this.communityName = '';
            } else {
              this.getCommunityData();
            }
          },
          error: (error) => {
            Swal.fire(
              'Error!',
              'There was an error deleting your community.',
              'error'
            );
            this.getCommunityData();
            console.error('Error deleting account', error);
          }
        });
      }
    });
  }

  getCoachId(uderId: any, role: any) {
    if (uderId == this.userId) {
      this.route.navigateByUrl('/user/main/my-profile')
    } else {
      this.route.navigateByUrl(`user/main/my-profile/${uderId}/${role}`);
    }
  }


}
