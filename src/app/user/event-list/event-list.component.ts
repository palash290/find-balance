import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from '../../services/shared.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.component.html',
  styleUrl: './event-list.component.css'
})
export class EventListComponent {

  eventData: any;
  isCoach: boolean = true;
  role: any;

  constructor(private router: Router, private visibilityService: SharedService) { }

  ngOnInit() {
    this.role = this.visibilityService.getRole();
    if (this.role == "USER") {
      this.isCoach = false;
    }

    this.getEventData();

  }

  getEventData() {
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


}
