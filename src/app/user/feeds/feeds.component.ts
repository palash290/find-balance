import { Component, ElementRef, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { SharedService } from '../../services/shared.service';
import Swal from 'sweetalert2';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-feeds',
  templateUrl: './feeds.component.html',
  styleUrl: './feeds.component.css'
})
export class FeedsComponent {

  isCoach: boolean = true;
  role: any;
  data: any;
  userId: any;
  isActive: boolean = false;
  categories: any[] = [];

  currentComponent: string = 'suggestedCategories';

  constructor(private visibilityService: SharedService, private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.getPackage();
    this.userId = localStorage.getItem('fbId');
    this.role = this.visibilityService.getRole();
    if (this.role == 'USER') {
      this.isCoach = false;
      this.currentComponent = 'notification'
    }

    this.visibilityService.refreshSidebar$.subscribe(() => {
      this.getProfileData();
      //console.log('wprking ');
    });

    this.visibilityService.getApi('coach/categories').subscribe(response => {
      if (response.success) {
        this.categories = response.data;
      }
    });

    // this.visibilityService.toggleState$.subscribe(state => {
    //   this.isActive = state;
    // });



    this.visibilityService.showComponent$.subscribe(component => {
      this.currentComponent = component;
    });
    if (this.isCoach) {
      this.visibilityService.triggerRefresh();
    }
  }

  userPlan: any;
  plan_expired_at: any;
  canceled_at: any;

  getPackage() {
    this.visibilityService.getApi(this.isCoach ? 'coach/myActivePlan' : 'user/myActivePlan').subscribe({
      next: (resp) => {
        this.userPlan = resp.data.plan.name;
        this.plan_expired_at = resp.data.expired_at;
        this.canceled_at = resp.data.canceled_at;
        localStorage.setItem('findPlan', this.userPlan);
        localStorage.setItem('plan_expired_at', this.plan_expired_at);
        localStorage.setItem('canceled_at', this.canceled_at);
      },
      error: (error) => {
        console.error('Error fetching project list:', error);
      }
    });
  }

  stripeLink: any;
  btnLoaderPay: boolean = false;
  payId: any;

  getAdHocPost(postId: any) {
    this.payId = postId;
    localStorage.setItem('adHocPostId', postId)
    const formURlData = new URLSearchParams();
    formURlData.set('postId', postId);
    this.btnLoaderPay = true;
    this.visibilityService.postAPI(`user/paymentThroughStripeForPost`, formURlData.toString()).subscribe(response => {
      this.stripeLink = response.url;
      window.location.href = this.stripeLink;
      console.log(this.stripeLink);
      this.btnLoaderPay = false;
    });
  }

  ngOnDestroy() {
    localStorage.removeItem('adHocPostId');
  }

  redirect() {
    window.location.href = this.stripeLink;
  }

  categoryId: any = '';
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
    this.getProfileData();
  }




  shortTextLength: number = 270;
  durationOrg: any;
  selectedOption: string = '';

  getProfileData() {
    this.visibilityService.getApi(this.isCoach ? `coach/post/allPosts?type=${this.selectedOption}&categoryId=${this.categoryId}` : `user/allPosts?type=${this.selectedOption}&categoryId=${this.categoryId}`).subscribe({
      next: resp => {
        if (this.isCoach) {
          //this.data = resp.data?.map((item: any) => ({ ...item, isExpanded: false, isPlaying: false }));
          this.data = resp.data
            ?.filter((item: any) => !(item.coachId != this.userId && item.isPaid == 1))
            .map((item: any) => ({ ...item, isExpanded: false, isPlaying: false }));
        } else {
          this.data = resp.data?.map((item: any) => ({ ...item, isExpanded: false, isPlaying: false }));
        }

        // setTimeout(() => {
        //   const player: any = document.getElementById('audioPlayer');
        //   this.durationOrg = player.duration;
        //   const minutes = Math.floor(this.durationOrg / 60);
        //   const seconds = Math.floor(this.durationOrg % 60);
        //   const formattedDuration = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        //   this.duration = formattedDuration
        // }, 1000);

      },
      error: error => {
        console.log(error.message)
      }
    });
  }

  @ViewChildren('audioPlayer') audioPlayers!: QueryList<ElementRef>;

  isPlaying: boolean = false;
  currentAudio: HTMLAudioElement | null = null;
  currentAudioTime: number = 0;
  audioDuration: number = 0;

  ///////
  fileName = '';
  formattedTime: any = 0;
  duration: any = 0;
  @ViewChild('audioPlayer') audioPlayer!: ElementRef<HTMLAudioElement>;

  bar: any = 0;
  togglePlayback() {
    const player = this.audioPlayer.nativeElement;
    setInterval(() => {
      if (player.readyState >= 1) {
        const current_time = player.currentTime;
        const minutesC = Math.floor(current_time / 60);
        const secondsC = Math.floor(current_time % 60);
        const formattedDurationCurrent = `${minutesC}:${secondsC < 10 ? '0' : ''}${secondsC}`;
        this.formattedTime = formattedDurationCurrent;
        this.bar = (current_time / this.durationOrg) * 100
        console.log('==>', this.bar)
      }
    }, 1000);

    if (this.isPlaying) {
      player.pause();
    } else {
      player.play();
    }
    this.isPlaying = !this.isPlaying;
  }
  //////// 

  toggleAudio(audioElement: HTMLAudioElement) {
    if (this.currentVideoId) {
      this.currentVideoId.pause();
    }

    if (this.currentAudio && this.currentAudio !== audioElement) {
      this.currentAudio.pause(); // Pause the currently playing audio
      this.isPlaying = false;
    }

    if (audioElement.paused) {
      audioElement.play();
      this.currentAudio = audioElement;
      this.isPlaying = true;
    } else {
      audioElement.pause();
      this.currentAudio = null;
      this.isPlaying = false;
    }
  }

  isAudioPlaying(audioElement: HTMLAudioElement): boolean {
    return audioElement === this.currentAudio && !audioElement.paused;
  }

  onAudioTimeUpdate(audioElement: HTMLAudioElement) {
    if (this.currentAudio === audioElement && !audioElement.paused) {
      const seekBar: HTMLInputElement = document.querySelector('.custom-seekbar')!;
      seekBar.value = (audioElement.currentTime / audioElement.duration * 100).toString();
      this.currentAudioTime = audioElement.currentTime;
      this.setAudioDuration(audioElement);
    }
  }

  setAudioDuration(audioElement: HTMLAudioElement) {
    if (this.currentAudio === audioElement) {
      const seekBar: HTMLInputElement = document.querySelector('.custom-seekbar')!;
      seekBar.max = "100";
      this.audioDuration = audioElement.duration;
    }
  }

  onAudioSeek(event: Event, audioElement: HTMLAudioElement) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    const time = (parseFloat(value) / 100) * audioElement.duration;
    audioElement.currentTime = time;
  }

  // formatTime(time: number): string {
  //   const minutes = Math.floor(time / 60);
  //   const seconds = Math.floor(time % 60);
  //   return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  // }





  toggleContent(index: number): void {
    this.data[index].isExpanded = !this.data[index].isExpanded;
  }

  shouldShowReadMore(text: string): boolean {
    return text?.length > this.shortTextLength;
  }

  isLike = false;

  likePost(postId: any) {
    this.isLike = !this.isLike;
    this.visibilityService.postAPI(this.isCoach ? `coach/post/react/${postId}` : `user/post/react/${postId}`, null).subscribe({
      next: resp => {
        console.log(resp);
        //this.getProfileData();
      },
      error: error => {
        console.log(error.message)
      }
    });
  }

  toggleLike(feed: any) {
    // Immediately toggle the like state locally
    feed.alreadyLiked = !feed.alreadyLiked;
    // Update the like count immediately
    if (feed.alreadyLiked) {
      feed.numberOfLikes++;
    } else {
      feed.numberOfLikes--;
    }

    // Call the API to register the like or unlike, but don't wait for the response to update the UI
    this.visibilityService.postAPI(this.isCoach ? `coach/post/react/${feed.id}` : `user/post/react/${feed.id}`, null)
      .subscribe({
        next: (resp) => {
          //console.log(resp);
        },
        error: (error) => {
          //console.log(error.message);
          // If the API call fails, revert the like state and like count
          feed.alreadyLiked = !feed.alreadyLiked;
          feed.numberOfLikes = feed.alreadyLiked ? feed.numberOfLikes + 1 : feed.numberOfLikes - 1;
        }
      });
  }

  bookmarkPost(feed: any) {

    feed.alreadySaved = !feed.alreadySaved;

    // Show a message based on the new state
    const message = feed.alreadySaved ? 'Post Saved' : 'Post Unsaved';

    // Show immediate feedback to the user using MatSnackBar
    this.snackBar.open(message, 'Close', {
      duration: 9000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['snackbar-success']  // Optional custom styling class
    });

    this.visibilityService.postAPI(`user/post/saveOrUnsave/${feed.id}`, null).subscribe({
      next: resp => {
        console.log(resp);
        //this.getProfileData();
      },
      error: error => {
        feed.alreadySaved = !feed.alreadySaved;
        //feed.numberOfLikes = feed.alreadySaved ? feed.numberOfLikes + 1 : feed.numberOfLikes - 1;
      }
    });
  }


  commentText: any;
  btnLoader: boolean = false;

  addComment(feed: any) {
    const trimmedMessage = this.commentText?.trim();
    if (trimmedMessage === '') {
      return;
    }

    if (feed.numberOfComments >= 0) {
      feed.numberOfComments++;
    } else {
      //feed.numberOfComments--;
    }

    const formData = new URLSearchParams();
    formData.set('postId', feed.id);
    formData.set('content', this.commentText);
    this.btnLoader = true;
    this.visibilityService.postAPI(this.isCoach ? `coach/comment` : `user/post/comment`, formData.toString()).subscribe({
      next: (response) => {
        console.log(response)
        this.commentText = '';
        this.getPostComments(feed.id);
        this.btnLoader = false;
        //this.getProfileData();
      },
      error: (error) => {
        //this.toastr.error('Error uploading files!');
        console.error('Upload error', error);
        this.btnLoader = false;
      }
    });
  }

  btnLoaderCmt: boolean = false;
  deleteId: any;

  deleteComment(cmtId: any, postId: any) {
    this.deleteId = cmtId;
    this.btnLoaderCmt = true;
    this.visibilityService.deleteAcc(this.isCoach ? `coach/comment/${cmtId}` : `user/post/comment/${cmtId}`).subscribe({
      next: resp => {
        console.log(resp);
        this.getPostComments(postId);
        this.btnLoaderCmt = false;
        this.getProfileData();
      },
      error: error => {
        console.log(error.message);
        this.btnLoaderCmt = false;
      }
    });
  }

  postComments: any[] = [];
  showCmt: { [key: string]: boolean } = {};
  currentOpenCommentBoxId: number | null = null;
  // toggleCommentBox(postId: any) {
  //   this.showCmt[postId] = !this.showCmt[postId];
  //   this.getPostComments(postId);
  // }

  toggleCommentBox(id: number): void {
    if (this.currentOpenCommentBoxId === id) {
      this.commentText = '';
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
      this.commentText = '';
    }
  }

  getPostComments(postId: any) {
    this.visibilityService.getApi(this.isCoach ? `coach/comment/${postId}` : `user/post/comment/${postId}`).subscribe({
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

  commentsToShow: { [key: number]: number } = {}; // Track number of comments to show
  readonly defaultCommentsCount = 3;

  loadMoreComments(id: number): void {
    this.commentsToShow[id] += 2; // Load 2 more comments
  }

  toggleCommentText(index: number): void {
    this.postComments[index].isExpanded = !this.postComments[index].isExpanded;
  }

  shouldShowLoadMore(id: number): boolean {
    return this.postComments && this.postComments?.length > this.commentsToShow[id];
  }


  isLikedCmt: boolean = true;
  likeComment(cmtId: any, postId: any) {
    // this.isLikedCmt = true;
    this.visibilityService.postAPI(this.isCoach ? `coach/comment/react/${cmtId}` : `user/post/comment/react/${cmtId}`, null).subscribe({
      next: resp => {
        console.log(resp);
        this.getPostComments(postId);
      },
      error: error => {
        console.log(error.message)
      }
    });
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
        this.visibilityService.deleteAcc(`coach/post/${id}`).subscribe({
          next: (resp) => {
            if (resp.success) {
              Swal.fire(
                'Deleted!',
                'Your post has been deleted successfully.',
                'success'
              );
              this.getProfileData();
              //this.route.navigateByUrl('/home')
              //this.toastr.success(resp.message);
            } else {
              this.getProfileData();
              //this.toastr.warning(resp.message);
            }
          },
          error: (error) => {
            Swal.fire(
              'Error!',
              'There was an error deleting your post.',
              'error'
            );
            this.getProfileData();
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

  toggleVideo(videoElement: HTMLVideoElement, isShown: boolean) {

    if (isShown) {
      if (this.currentAudio) {
        this.currentAudio.pause();
      }

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


  // onTimeUpdate(videoElement: HTMLVideoElement) {
  //   if (this.currentVideoId === videoElement) {
  //     const seekBar: HTMLInputElement = document.querySelector('.custom-seekbar')!;
  //     seekBar.value = (videoElement.currentTime / videoElement.duration * 100).toString();
  //     this.currentTime = videoElement.currentTime;
  //     this.setVideoDuration(videoElement);
  //   }
  // }

  // setVideoDuration(videoElement: HTMLVideoElement) {
  //   //debugger
  //   if (this.currentVideoId === videoElement) {
  //     const seekBar: HTMLInputElement = document.querySelector('.custom-seekbar')!;
  //     seekBar.max = "100";
  //     this.videoDuration = videoElement.duration;
  //   }
  // }

  // onSeek(event: Event, videoElement: HTMLVideoElement) {
  //   const input = event.target as HTMLInputElement;
  //   const value = input.value;
  //   const time = (parseFloat(value) / 100) * videoElement.duration;
  //   videoElement.currentTime = time;
  // }



  //poster="../assets/img/play.png"

}
