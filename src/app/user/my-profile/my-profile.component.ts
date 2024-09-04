import { Component, ElementRef, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { SharedService } from '../../services/shared.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { Location } from '@angular/common';


@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrl: './my-profile.component.css'
})
export class MyProfileComponent {

  isCoach: boolean = true;
  role: any;

  constructor(private route: ActivatedRoute, private service: SharedService, private location: Location) {
    this.role = this.service.getRole();
    if (this.role == "USER") {
      this.isCoach = false;
    }
  }

  backClicked() {
    this.location.back();
  }

  profileForm!: FormGroup;
  userDet: any;
  userEmail: any;
  name: any;
  cover_photo_url: any;
  avatar_url: any
  category: any;
  accomplishments: any;
  certificates: any;

  userId: any;
  userRole: any;
  loginuserId: any;
  routerole: any;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.userId = params.get('id');
      this.routerole = params.get('role');
    });

    if (this.userId) {
      this.getUserProfile(this.userId);
    } else {
      this.loadUserProfile();
    }

    this.getProfileData();
    this.loginuserId = localStorage.getItem('fbId');
    this.service.triggerRefresh();
  }

  //if coach see coach profile
  isCoachPosts: boolean = false;
  getCoachProfile(userId: any) {
    const url = `coach/getCoachProfile/${userId}`;
    this.service.getApi(url).subscribe({
      next: resp => {

        this.userRole = resp.data.role;
        this.userEmail = resp.data.about_me;
        this.name = resp.data.full_name;
        this.avatar_url = resp.data.avatar_url;
        this.cover_photo_url = resp.data.cover_photo_url;
        this.education = resp.data.education;
        this.category = resp.data.category?.name;

        this.accomplishments = resp.data.accomplishments?.split(',').map((accomplishments: string) => accomplishments.trim());
        this.certificates = resp.data.certificates?.split(',').map((certificate: string) => certificate.trim());
        this.education = resp.data.education;

        this.selectedCategoryNames = resp.data.CoachCategory?.map((item: { category: { name: any; }; }) => item.category.name);

        // if(resp.data?.Post?.length > 0){
        //   this.isCoachPosts = true;
        // }
      },
      error: error => {
        console.log(error.message);
      }
    });
  }

  url: any;
  getUserProfile(userId: any) {
    if(this.routerole == 'COACH'){
      this.url = this.isCoach ? `coach/getCoachProfile/${userId}` : `user/getCoachProfile/${userId}`;
    } else {
      this.url = this.isCoach ? `coach/userProfile/${userId}` : `user/getCoachProfile/${userId}`;
    }
    //const url = this.isCoach ? `coach/userProfile/${userId}` : `user/getCoachProfile/${userId}`;
    this.service.getApi(this.url).subscribe({
      next: resp => {

        this.userRole = resp.data.role;
        this.userEmail = resp.data.about_me;
        this.name = resp.data.full_name;
        this.avatar_url = resp.data.avatar_url;
        this.cover_photo_url = resp.data.cover_photo_url;
        this.education = resp.data.education;
        this.category = resp.data.category?.name;
        this.experience = resp.data.experience;

        this.accomplishments = resp.data.accomplishments?.split(',').map((accomplishments: string) => accomplishments.trim());
        this.certificates = resp.data.certificates?.split(',').map((certificate: string) => certificate.trim());
        this.education = resp.data.education;

        this.selectedCategoryNames = resp.data.CoachCategory?.map((item: { category: { name: any; }; }) => item.category.name);

        if(!this.isCoach){
          this.getSingleCoachPosts(userId);
        }
      },
      error: error => {
        this.getCoachProfile(this.userId);
        console.log(error.message);
      }
    });
  }

  selectedCategoryNames: string[] = [];
  education: any;
  experience: any;

  loadUserProfile() {
    this.service.getApi(this.isCoach ? 'coach/myProfile' : 'user/myProfile').subscribe({
      next: (resp) => {
        if (this.isCoach) {
          this.userEmail = resp.data.about_me;
          this.name = resp.data.full_name;
          this.avatar_url = resp.data.avatar_url;
          this.cover_photo_url = resp.data.cover_photo_url;
          this.category = resp.data.category.name;
          this.accomplishments = resp.data.accomplishments?.split(',').map((accomplishments: string) => accomplishments.trim());
          this.certificates = resp.data.certificates?.split(',').map((certificate: string) => certificate.trim());
          this.education = resp.data.education;
          this.experience = resp.data.experience;
          this.selectedCategoryNames = resp.data.CoachCategory?.map((item: { category: { name: any; }; }) => item.category.name);
          //debugger

          //this.postData = resp.data?.Post?.map((item: any) => ({ ...item, isExpanded: false, isPlaying: false })).reverse();

        } else {
          this.userEmail = resp.user.about_me;
          this.name = resp.user.full_name;
          this.avatar_url = resp.user.avatar_url;
          this.cover_photo_url = resp.user.cover_photo_url;
          this.education = resp.user.education;
        }

      },
      error: (error) => {
        console.log(error.message);
      }
    });
  }


  postData: any;
  shortTextLength: number = 270;

  getSingleCoachPosts(coachId: any) {
    this.service.getApi(`user/allPosts/coach/${coachId}`).subscribe({
      next: resp => {
        this.postData = resp.data?.map((item: any) => ({ ...item, isExpanded: false, isPlaying: false }));
      },
      error: error => {
        console.log(error.message)
      }
    });
  }

  getProfileData() {
    this.service.getApi(this.isCoach ? 'coach/post' : 'user/allPosts').subscribe({
      next: resp => {
        if (this.isCoach) {
          this.postData = resp.data?.map((item: any) => ({ ...item, isExpanded: false, isPlaying: false }));
        }
      },
      error: error => {
        console.log(error.message)
      }
    });
  }

  postComments: any[] = [];
  showCmt: { [key: string]: boolean } = {};
  currentOpenCommentBoxId: number | null = null;

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

  @ViewChild('audioPlayer') audioPlayer!: ElementRef<HTMLAudioElement>;
  isPlaying: boolean = false;

  togglePlayback() {
    const player = this.audioPlayer.nativeElement;
    if (this.isPlaying) {
      player.pause();
    } else {
      player.play();
    }
    this.isPlaying = !this.isPlaying;
  }

  toggleCommentBox(id: number): void {
    if (this.currentOpenCommentBoxId === id) {
      // Toggle off if the same box is clicked again
      this.commentText = '';
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
      this.commentText = '';
    }
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

  bookmarkPost(postId: any) {
    //this.isBookmark = !this.isBookmark;
    this.service.postAPI(`user/post/saveOrUnsave/${postId}`, null).subscribe({
      next: resp => {
        console.log(resp);
        this.getProfileData();
        if(!this.isCoach){
          this.getSingleCoachPosts(this.userId);
        }
      },
      error: error => {
        console.log(error.message)
      }
    });
  }

  //isLike = false;

  likePost(postId: any) {
    //this.isLike = !this.isLike;
    this.service.postAPI(this.isCoach ? `coach/post/react/${postId}` : `user/post/react/${postId}`, null).subscribe({
      next: resp => {
        console.log(resp);
        this.getProfileData();
        if(!this.isCoach){
          this.getSingleCoachPosts(this.userId);
        }
      },
      error: error => {
        console.log(error.message)
      }
    });
  }

  commentText: any;
  btnLoader: boolean = false;

  addComment(id: any) {
    const trimmedMessage = this.commentText?.trim();
    if (trimmedMessage === '') {
      return;
    }
    const formData = new URLSearchParams();
    formData.set('postId', id);
    formData.set('content', this.commentText);
    this.btnLoader = true;
    this.service.postAPI(this.isCoach ? `coach/comment` : `user/post/comment`, formData.toString()).subscribe({
      next: (response) => {
        console.log(response)
        this.commentText = '';
        this.getPostComments(id);
        this.btnLoader = false;
        this.getProfileData();
        if(!this.isCoach){
          this.getSingleCoachPosts(this.userId);
        }
      },
      error: (error) => {
        //this.toastr.error('Error uploading files!');
        console.error('Upload error', error);
        this.btnLoader = false;
      }
    });
  }

  toggleCommentText(index: number): void {
    this.postComments[index].isExpanded = !this.postComments[index].isExpanded;
  }

  loadMoreComments(id: number): void {
    this.commentsToShow[id] += 2; // Load 2 more comments
  }

  toggleContent(index: number): void {
    this.postData[index].isExpanded = !this.postData[index].isExpanded;
  }

  shouldShowLoadMore(id: number): boolean {
    return this.postComments && this.postComments?.length > this.commentsToShow[id];
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
              this.getProfileData();
              if(!this.isCoach){
                this.getSingleCoachPosts(this.userId);
              }
            } else {
              this.getProfileData();
              if(!this.isCoach){
                this.getSingleCoachPosts(this.userId);
              }
            }
          },
          error: (error) => {
            Swal.fire(
              'Error!',
              'There was an error deleting your post.',
              'error'
            );
            this.getProfileData();
            if(!this.isCoach){
              this.getSingleCoachPosts(this.userId);
            }
            //this.toastr.error('Error deleting account!');
            console.error('Error deleting account', error);
          }
        });
      }
    });
  }

  btnLoaderCmt: boolean = false;
  deleteId: any;

  deleteComment(cmtId: any, postId: any) {
    this.deleteId = cmtId;
    //this.isLike = !this.isLike;
    this.btnLoaderCmt = true;
    this.service.deleteAcc(this.isCoach ? `coach/comment/${cmtId}` : `user/post/comment/${cmtId}`).subscribe({
      next: resp => {
        console.log(resp);
        this.getPostComments(postId);
        this.btnLoaderCmt = false;
        this.getProfileData();
        if(!this.isCoach){
          this.getSingleCoachPosts(this.userId);
        }
      },
      error: error => {
        console.log(error.message);
        this.btnLoaderCmt = false;
      }
    });
  }





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


}
