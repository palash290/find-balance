import { Component } from '@angular/core';
import { SharedService } from '../../services/shared.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-my-intrest',
  templateUrl: './my-intrest.component.html',
  styleUrl: './my-intrest.component.css'
})
export class MyIntrestComponent {

  data: any;
  searchQuery: string = '';
  isFollowing: { [key: number | string]: boolean } = {};
  avatar_url_fb: any;

  isCoach: boolean = true;
  role: string | undefined;

  constructor(private service: SharedService, private location: Location) {
    // this.role = this.service.getRole();
    // if (this.role == 'USER') {
    //   this.isCoach = false;
    // }
    // if(!this.isCoach){
    //   this.location.back();
    //   return
    // }
   }

   backClicked() {
    this.location.back();
  }

  ngOnInit() {
    this.service.refreshSidebar$.subscribe(() => {
      this.searchCategories();
    });
    this.avatar_url_fb = localStorage.getItem('avatar_url_fb');
    //this.getCategories();
    // this.searchCategories();
    this.service.triggerRefresh();
  }

  getCategories() {
    this.service.getApi('user/interestedCategories').subscribe({
      next: resp => {
        this.data = resp.data
      },
      error: error => {
        console.log(error.message)
      }
    });
  }

  searchCategories() {
    const url = `user/interestedCategories?search=${this.searchQuery}`;
    this.service.getApi(url).subscribe({
      next: resp => {
        this.data = resp.data || [];
        // Reset follow state for each category if needed
        this.data.forEach((category: { category: { id: string | number; }; isFollowing: any; }) => {
          this.isFollowing[category.category.id] = category.isFollowing;
        });
      },
      error: error => {
        console.log(error.message);
      }
    });
  }


  btnLoader: boolean = false;
  
  followId: any;

  unfollowCatg(postId: any) {
    //this.isLike = !this.isLike;
    this.followId = postId;
    this.btnLoader = true
    
    this.service.postAPI(`user/unfollow/${postId}`, null).subscribe({
      next: resp => {
        console.log(resp);
        this.getCategories();
        this.btnLoader = false;
      },
      error: error => {
        this.btnLoader = false
        console.log(error.message)
      }
    });
  }


}
