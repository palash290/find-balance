import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  videos: any[] = [];
  thumbnails: string[] = [];

  selectedFile: File | null = null;

  constructor(private http: HttpClient, private service: SharedService) {}

  ngOnInit(): void {
    //this.getVideoData();
  }

  // getVideoData(): void {
  //   this.http.get<any>('https://gist.githubusercontent.com/poudyalanil/ca84582cbeb4fc123a13290a586da925/raw/14a27bd0bcd0cd323b35ad79cf3b493dddf6216b/videos.json')
  //     .subscribe(data => {
  //       this.videos = data;
  //     this.videos.forEach((video, index) => {
  //       this.generateThumbnail(video.videoUrl, index);
  //     });
  //     });
  // }

  // generateThumbnail(videoUrl: string, index: number): void {
  //   const videoElement = document.createElement('video');
  //   videoElement.src = videoUrl;
  //   videoElement.crossOrigin = 'anonymous';

  //   videoElement.addEventListener('loadeddata', () => {
  //     const canvas = document.createElement('canvas');
  //     const context = canvas.getContext('2d')!;
  //     canvas.width = videoElement.videoWidth;
  //     canvas.height = videoElement.videoHeight;

  //     const randomTime = Math.random() * videoElement.duration;
  //     videoElement.currentTime = randomTime;

  //     videoElement.addEventListener('seeked', () => {
  //       context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  //       this.thumbnails[index] = canvas.toDataURL();
  //     });
  //   });
  // }

  // onThumbnailClick(index: number, event: Event): void {
  //   const video = document.querySelectorAll('video')[index] as HTMLVideoElement;
  //   const thumbnail = event.target as HTMLImageElement;
  //   if (thumbnail) {
  //     thumbnail.style.display = 'none';
  //   }
  //   if (video) {
  //     video.play();
  //   }
  // }


  private readonly token: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb2FjaElkIjo0LCJpYXQiOjE3MjEzODMxMDgsImV4cCI6MTczNTg5ODMwOH0.7KK7KkcCrdoJGZoiWK3k5mXtQpvpMQn-K18h3cgPVKQ';


  onFileChange(event: any) {
    if (event.target.files?.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }
  

  onSubmit() {
    if (!this.selectedFile) {
      console.log('Please select a video file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('text', 'kgkghkhgjh');
    formData.append('file', this.selectedFile);
    formData.append('type', 'VIDEO');


    this.service.postAPI('coach/post', formData)
      .subscribe(
        (res: any) => {
          if (res.success) {
            console.log('Video uploaded successfully.');
          } else {
            console.log('Video upload failed.');
          }
        },
        error => {
          console.log('An error occurred while uploading the video.');
          console.error(error);
        }
      );
  }


}
