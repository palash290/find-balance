import { Component } from '@angular/core';
import { SharedService } from '../../services/shared.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-follow-users',
  templateUrl: './follow-users.component.html',
  styleUrl: './follow-users.component.css'
})
export class FollowUsersComponent {

  searchQuery: string = '';
  avatar_url_fb: any;

  constructor(private router: Router, private service: SharedService) { }

  ngOnInit() {
    this.avatar_url_fb = localStorage.getItem('avatar_url_fb');
    this.searchFollowUsersList();
  }

  data: any;

  searchFollowUsersList() {
    const url = `coach/myFollowers?search=${this.searchQuery}`;
    this.service.getApi(url).subscribe({
      next: resp => {
        //this.followersVisible = !this.followersVisible;
        this.data = resp.data || [];
      },
      error: error => {
        console.log(error.message);
      }
    });
  }

  btnLoader: boolean = false;

  followId: any;

  // removeUser(postId: any) {
  //   //this.isLike = !this.isLike;
  //   this.followId = postId;
  //   this.btnLoader = true

  //   this.service.postAPI(`coach/follow/unfollow/${postId}`, null).subscribe({
  //     next: resp => {
  //       console.log(resp);
  //       this.searchFollowUsersList();
  //       this.btnLoader = false;
  //     },
  //     error: error => {
  //       this.btnLoader = false
  //       console.log(error.message)
  //     }
  //   });
  // }

  unfollowCoach(postId: any) {
    //this.isLike = !this.isLike;
    this.followId = postId;
    this.btnLoader = true

    this.service.postAPI(`coach/follow/unfollow/${postId}`, null).subscribe({
      next: resp => {
        console.log(resp);
        this.searchFollowUsersList();
        this.btnLoader = false;
      },
      error: error => {
        this.btnLoader = false
        console.log(error.message)
      }
    });
  }

  followCoach(postId: any) {
    //this.isLike = !this.isLike;
    this.followId = postId;
    this.btnLoader = true

    this.service.postAPI(`coach/follow/${postId}`, null).subscribe({
      next: resp => {
        console.log(resp);
        this.searchFollowUsersList();
        this.btnLoader = false;
      },
      error: error => {
        this.btnLoader = false
        console.log(error.message)
      }
    });
  }


  getUserId(uderId: any, role:any) {
    this.router.navigateByUrl(`user/main/my-profile/${uderId}/${role}`)
  }


}
