import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {

  userDetails: any;
  isCoach: boolean = true;
  role: any;
  eventData: any;
  isMenuVisible: boolean = false;

  constructor(private router: Router, private visibilityService: SharedService) {

  }

  onToggleMenu() {
    this.visibilityService.toggleMenuVisibility();
  }

  // toggleClass() {
  //   this.visibilityService.toggle();  // Directly call the toggle method
  // }

  unreadNotifications: any;

  ngOnInit() {
    this.role = this.visibilityService.getRole();
    if (this.role == "USER") {
      this.isCoach = false;
    }

    this.visibilityService.refreshSidebar$.subscribe(() => {
      this.getEventData();
      this.loadUserProfile();
      this.getNotification();
    });
    //this.toggleClass();
    // this.getEventData();
    // this.loadUserProfile();
  }

  about_me: any;
  name: any;
  avatar_url: any
  totalPosts: any;
  totalFollowers: any;
  category: any;
  isExpanded: boolean = false;
  numberOfFollowings: any;

  loadUserProfile() {
    this.visibilityService.getApi(this.isCoach ? 'coach/myProfile' : 'user/myProfile').subscribe({
      next: (resp) => {
        if (this.isCoach) {
          this.about_me = resp.data.about_me;
          this.name = resp.data.full_name;
          this.avatar_url = resp.data.avatar_url;
          localStorage.setItem('avatar_url_fb', this.avatar_url ? this.avatar_url : '')
          this.totalPosts = resp.data.numberOfPosts;
          this.totalFollowers = resp.data.numberOfFollower;
          this.category = resp.data.category.name;
          this.numberOfFollowings = resp.data.numberOfFollowings
        } else {
          this.about_me = resp.user.about_me;
          this.name = resp.user.full_name;
          this.avatar_url = resp.user.avatar_url;
          localStorage.setItem('avatar_url_fb', this.avatar_url ? this.avatar_url : '')
          this.totalPosts = resp.user.numberOfPosts;
          this.totalFollowers = resp.user.numberOfFollower;
        }

      },
      error: (error) => {
        console.log(error.message);
      }
    });
  }

  toggleText() {
    this.isExpanded = !this.isExpanded;
  }

  shouldShowReadMore() {
    return this.about_me?.length > 100; // Adjust the length as needed
  }

  isActive(route: string): boolean {
    return this.router.isActive(route, true);
  }


  toggleComponent() {
    this.visibilityService.toggleComponent();
    const currentRoute = this.router.url
    if (currentRoute != '/user/main/feeds') {
      this.router.navigateByUrl('/user/main/feeds')
    }
  }

  getEventData() {
    //debugger
    this.visibilityService.getApi(this.isCoach ? 'coach/event' : 'user/event/allEvents').subscribe({
      next: resp => {
        if (this.isCoach) {
          this.eventData = resp.data.events;
        } else {
          this.eventData = resp.data;
        }
      },
      error: error => {
        console.log(error.message)
      }
    });
  }

  getEventId(eventId: any) {
    this.router.navigateByUrl(`user/main/events/${eventId}`)
  }

  getNotification() {
    this.visibilityService.getApi(this.isCoach ? 'coach/notifications' : 'user/notifications').subscribe({
      next: resp => {
        this.unreadNotifications = resp.data.unRead;
        localStorage.setItem('unreadNotifications', resp.data.unRead);
      },
      error: error => {
        console.log(error.message)
      }
    });
  }


}
