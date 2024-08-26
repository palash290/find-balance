import { Component } from '@angular/core';
import { SharedService } from '../../services/shared.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrl: './my-profile.component.css'
})
export class MyProfileComponent {

  isCoach: boolean = true;
  role: any;

  constructor(private route: ActivatedRoute, private service: SharedService) {
    this.role = this.service.getRole();
    if (this.role == "USER") {
      this.isCoach = false;
    }
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
  userRole: any

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.userId = params.get('id');
    });

    if (this.userId) {
      this.getUserProfile(this.userId);
    } else {
      this.loadUserProfile();
    }

  }

  getCoachProfile(userId: any){
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

      },
      error: error => {
        console.log(error.message);
      }
    });
  }


  getUserProfile(userId: any) {
    const url = this.isCoach ? `coach/userProfile/${userId}` : `user/getCoachProfile/${userId}`;
    this.service.getApi(url).subscribe({
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


}
