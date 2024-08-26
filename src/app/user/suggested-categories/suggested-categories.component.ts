import { Component } from '@angular/core';
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'app-suggested-categories',
  templateUrl: './suggested-categories.component.html',
  styleUrl: './suggested-categories.component.css'
})
export class SuggestedCategoriesComponent {

  data: any;
  searchQuery = '';
  constructor(private service: SharedService) { }

  ngOnInit() {

    this.getCategories();
    this.gatSuggestedCoaches();
  }

  btnLoader1: boolean = false;
  btnLoader: boolean = false;

  followId: any;

  getCategories() {
    this.service.getApi('user/categories').subscribe({
      next: resp => {
        this.data = resp.data;
        this.updateDisplayedCategories();
      },
      error: error => {
        console.log(error.message);
      }
    });
  }

  displayedCategories: any[] = []; // Categories to display initially
  displayedCount: number = 5;
  updateDisplayedCategories() {
    this.displayedCategories = this.data.slice(0, this.displayedCount);
  }

  followedCategories: Set<number> = new Set<number>();
  followCatg(categoryId: any) {
    this.btnLoader1 = true;
    this.followId = categoryId;

    this.service.postAPI(`user/follow/${categoryId}`, null).subscribe({
      next: resp => {
        //console.log(resp);
        this.followedCategories.add(categoryId);

        // Update displayed categories if all current categories are followed
        if (this.displayedCategories.every(cat => this.followedCategories.has(cat.id))) {
          this.displayedCount += 5;
          this.updateDisplayedCategories();
        }
        this.getCategories()
        this.btnLoader1 = false;
        this.service.triggerRefresh();
      },
      error: error => {
        console.log(error.message);
        this.btnLoader1 = false;
      }
    });
  }

  loadMore() {
    if (this.displayedCount < this.data.length) {
      this.displayedCount += 5;
      this.updateDisplayedCategories();
    }
  }


  coaches: any;

  gatSuggestedCoaches() {
    this.service.getApi('user/coach/suggestedCoaches').subscribe({
      next: resp => {
        this.coaches = resp.data;
        this.updateDisplayedCoaches()
      },
      error: error => {
        console.log(error.message)
      }
    });
  }

  displayedCoaches: any[] = []; // Categories to display initially
  displayedCountCoaches: number = 5;
  updateDisplayedCoaches() {
    //debugger
    this.displayedCoaches = this.coaches.slice(0, this.displayedCountCoaches);
  }


  followedCoaches: Set<number> = new Set<number>();

  followCoach(postId: any) {
    this.btnLoader = true;
    this.followId = postId;
    //this.isLike = !this.isLike;
    this.service.postAPI(`user/coach/follow/${postId}`, null).subscribe({
      next: resp => {
        this.followedCoaches.add(postId);

        // Update displayed categories if all current categories are followed
        if (this.displayedCoaches.every(cat => this.followedCoaches.has(cat.id))) {
          this.displayedCountCoaches += 5;
          this.updateDisplayedCategories();
        }
        this.gatSuggestedCoaches()
        this.btnLoader = false;
        this.service.triggerRefresh();
      },
      error: error => {
        console.log(error.message);
        this.btnLoader = false
      }
    });
  }


}
