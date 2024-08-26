import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrl: './video.component.css'
})
export class VideoComponent {

  @ViewChild('audioPlayer') audioPlayer!: ElementRef<HTMLAudioElement>;
  audioUrl: string | null = null;

  onFileSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files?.length > 0) {
      const file = fileInput.files[0];
      console.log('=====>', file)
      this.audioUrl = URL.createObjectURL(file);
      this.audioPlayer.nativeElement.src = this.audioUrl;
    }
  }

  playAudio(): void {
    this.audioPlayer.nativeElement.play();
  }

  pauseAudio(): void {
    this.audioPlayer.nativeElement.pause();
  }

  stopAudio(): void {
    const audio = this.audioPlayer.nativeElement;
    audio.pause();
    audio.currentTime = 0;
  }


}

  
      //src: ['https://orarum.com/agestas/music/song.mp3'],
      