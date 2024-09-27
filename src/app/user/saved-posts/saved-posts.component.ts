import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { SharedService } from '../../services/shared.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-saved-posts',
  templateUrl: './saved-posts.component.html',
  styleUrl: './saved-posts.component.css'
})
export class SavedPostsComponent {

  role: any;
  data: any;
  userId: any;


  constructor(private visibilityService: SharedService, private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.userId = localStorage.getItem('fbId');
    this.getProfileData();
    this.visibilityService.triggerRefresh();
  }


  shortTextLength: number = 100;

  getProfileData() {
    this.visibilityService.getApi('user/post/savedPosts').subscribe({
      next: resp => {
        this.data = resp.data?.map((item: any) => ({ ...item, isExpanded: false }));
      },
      error: error => {
        console.log(error.message)
      }
    });
  }

  toggleContent(index: number): void {
    this.data[index].isExpanded = !this.data[index].isExpanded;
  }

  shouldShowReadMore(text: string): boolean {
    return text?.length > this.shortTextLength;
  }


  btnLoaderCmt: boolean = false;
  deleteId: any;

  deleteComment(cmtId: any, postId: any) {
    this.deleteId = cmtId;
    //this.isLike = !this.isLike;
    this.btnLoaderCmt = true;
    this.visibilityService.deleteAcc(`user/post/comment/${cmtId}`).subscribe({
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

  likePost(postId: any) {
    //this.isLike = !this.isLike;
    this.visibilityService.postAPI(`user/post/react/${postId}`, null).subscribe({
      next: resp => {
        console.log(resp);
        this.getProfileData();
      },
      error: error => {
        console.log(error.message)
      }
    });
  }

  commentText: any;
  btnLoader: boolean = false;

  addComment(feed: any) {
    const trimmedMessage = this.commentText.trim();
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
    this.visibilityService.postAPI(`user/post/comment`, formData.toString()).subscribe({
      next: (response) => {
        console.log(response)
        this.commentText = '';
        this.getPostComments(feed.id);
        this.btnLoader = false;
        //this.getProfileData();
      },
      error: (error) => {
        console.error('Upload error', error);
        this.btnLoader = false;
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

  getPostComments(postId: any) {
    this.visibilityService.getApi(`user/post/comment/${postId}`).subscribe({
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

  likeComment(cmtId: any, postId: any) {
    //this.isLike = !this.isLike;
    this.visibilityService.postAPI(`user/post/comment/react/${cmtId}`, null).subscribe({
      next: resp => {
        console.log(resp);
        this.getPostComments(postId);
      },
      error: error => {
        console.log(error.message)
      }
    });
  }

  bookmarkPost(feed: any) {
    feed.alreadySaved = !feed.alreadySaved;

    const message = feed.alreadySaved ? 'Post Saved' : 'Post Unsaved';

    // Show immediate feedback to the user using MatSnackBar
    this.snackBar.open(message, 'Close', {
      duration: 3000,
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
        console.log(error.message)
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


}
