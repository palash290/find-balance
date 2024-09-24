import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  apiUrl = environment.baseUrl

  constructor(private http: HttpClient, private route: Router) { }

  setToken(token: string) {
    localStorage.setItem('fbToken', token)
  }

  isLogedIn() {
    return this.getToken() !== null;
  }

  getToken() {
    return localStorage.getItem('fbToken')
  }

  getRole() {
    const jaonData: any = localStorage.getItem('fbRole');
    const data = JSON.parse(jaonData)
    return data
  }

  loginUser(url: any, params: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    return this.http.post<any>(this.apiUrl + url, params, { headers: headers });
  }

  resetPassword(url: any, params: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    return this.http.post<any>(this.apiUrl + url, params, { headers: headers });
  }

  getApi(url: any): Observable<any> {
    const authToken = localStorage.getItem('fbToken');
    const headers = new HttpHeaders({

      'Authorization': `Bearer ${authToken}`
    });
    return this.http.get(this.apiUrl + url, { headers: headers })
  };

  putApi(url: any, params: any): Observable<any> {
    const authToken = localStorage.getItem('fbToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${authToken}`
    });
    return this.http.put(this.apiUrl + url, params, { headers: headers })
  };

  postAPI(url: any, data: any): Observable<any> {
    const authToken = localStorage.getItem('fbToken');
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${authToken}`
    });
    return this.http.post(this.apiUrl + url, data, { headers: headers })
  };

  postAPIFormData(url: any, data: any): Observable<any> {
    const authToken = localStorage.getItem('fbToken');
    const headers = new HttpHeaders({
      //'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${authToken}`
    });
    return this.http.post(this.apiUrl + url, data, { headers: headers })
  };

  postAPIFormDataPatch(url: any, data: any): Observable<any> {
    const authToken = localStorage.getItem('fbToken');
    const headers = new HttpHeaders({
      //'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${authToken}`
    });
    return this.http.patch(this.apiUrl + url, data, { headers: headers })
  };

 

  logout() {
    localStorage.removeItem('fbToken');
    localStorage.removeItem('userDetailFb');
    //localStorage.removeItem('fcmFbToken');
    localStorage.removeItem('fbRole');
    this.route.navigateByUrl('/login');
    localStorage.removeItem('unreadNotifications');
    localStorage.removeItem('fbId');
    localStorage.removeItem('avatar_url_fb');
    localStorage.removeItem('findPlan');
    localStorage.removeItem('plan_expired_at');
    localStorage.removeItem('adHocPostId');
    localStorage.removeItem('adHocEventId');
  }

  deleteAcc(url: any): Observable<any> {
    const authToken = localStorage.getItem('fbToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${authToken}`
    });
    return this.http.delete(this.apiUrl + url, { headers: headers })
  };


  private refreshSidebarSource = new BehaviorSubject<void | null>(null);
  refreshSidebar$ = this.refreshSidebarSource.asObservable();

  triggerRefresh() {
    this.refreshSidebarSource.next(null);
  }
  

  private showComponentSubject = new BehaviorSubject<string>('suggestedCategories'); // Default component
  showComponent$ = this.showComponentSubject.asObservable();

  toggleComponent() {
    this.showComponentSubject.next(
      this.showComponentSubject.value === 'suggestedCategories' ? 'notification' : 'suggestedCategories'
    );
  }


  //for responsive toggle button
  private showMenuSubject = new BehaviorSubject<boolean>(false);
  showMenu$ = this.showMenuSubject.asObservable();

  toggleMenuVisibility() {
    this.showMenuSubject.next(!this.showMenuSubject.value);
  }

  //toggle notification
  // private toggleState = new BehaviorSubject<boolean>(false);
  // toggleState$ = this.toggleState.asObservable();

  // toggle() {
  //   const currentState = this.toggleState.value;
  //   this.toggleState.next(!currentState);
  // }


  //private pageSize = 2;

  // getVideos(page: number): Observable<any[]> {
  //   return this.http.get<any[]>(this.apiUrl1).pipe(
  //     map(videos => {
  //       const start = page * this.pageSize;
  //       const end = start + this.pageSize;
  //       return videos.slice(start, end);
  //     })
  //   );
  // }


}
