import { Component } from '@angular/core';
import { SharedService } from '../../services/shared.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search-coaches',
  templateUrl: './search-coaches.component.html',
  styleUrl: './search-coaches.component.css'
})
export class SearchCoachesComponent {

  data: any;
  searchQuery: string = '';
  isFollowing: { [key: number | string]: boolean } = {};
  avatar_url_fb: any;
  role: any;
  isCoach: boolean = true;

  constructor(private router: Router, private service: SharedService) { }

  ngOnInit() {

    this.role = this.service.getRole();
    if (this.role == 'USER') {
      this.isCoach = false;
    }

    this.service.getApi('coach/categories').subscribe(response => {
      if (response.success) {
        this.categories = response.data;
      }
    });
    this.service.triggerRefresh();
    this.getAllCoaches();
  }

  // getAllCoaches() {
  //   this.service.getApi('user/coach/followedCoaches').subscribe({
  //     next: resp => {
  //       this.data = resp.data;
  //     },
  //     error: error => {
  //       console.log(error.message)
  //     }
  //   });
  // }

  experience: any = '';

  getAllCoaches() {
    const url = this.isCoach ? `coach/follow/allCoaches?search=${this.searchQuery}` : `user/allCoaches?categoryId=${this.categoryId}&experience=${this.experience}&search=${this.searchQuery}`;
    this.service.getApi(url).subscribe({
      next: resp => {
        this.data = resp.data || [];
        // Reset follow state for each category if needed
        // this.data.forEach((category: { following: { id: string | number; }; isFollowing: any; }) => {
        //   this.isFollowing[category.following.id] = category.isFollowing;
        // });
      },
      error: error => {
        console.log(error.message);
      }
    });
  }


  btnLoader: boolean = false;

  followId: any;

  followCoach(coachId: any) {
    //this.isLike = !this.isLike;
    this.followId = coachId;
    this.btnLoader = true

    this.service.postAPI(this.isCoach ? `coach/follow/${coachId}` : `user/coach/follow/${coachId}`, null).subscribe({
      next: resp => {
        console.log(resp);
        this.getAllCoaches();
        this.btnLoader = false;
        this.service.triggerRefresh();
      },
      error: error => {
        this.btnLoader = false
        console.log(error.message)
      }
    });
    this.avatar_url_fb = localStorage.getItem('avatar_url_fb');
  }


  categoryId: any = '';
  selectedCategoryName: string | undefined;
  categories: any[] = [];

  onCategoryChange(event: any): void {
    const selectedId = event.target.value;
    const selectedCategory = this.categories.find(category => category.id == selectedId);

    if (selectedCategory) {
      this.categoryId = selectedCategory.id;
      this.selectedCategoryName = selectedCategory.name;
      console.log('Selected Category ID:', this.categoryId);
      console.log('Selected Category Name:', this.selectedCategoryName);
    }
    this.getAllCoaches()
  }

  getCoachId(uderId: any, role: any) {
    this.router.navigateByUrl(`user/main/my-profile/${uderId}/${role}`)
  }


}
