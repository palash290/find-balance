import { Component, EventEmitter, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedService } from '../../services/shared.service';
import Swal from 'sweetalert2';
import { Location } from '@angular/common';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrl: './events.component.css'
})
export class EventsComponent {

  eventId: any;
  isCoach: boolean = true;
  role: any;

  constructor(private route: ActivatedRoute, private service: SharedService, private router: Router, private location: Location) { }

  ngOnInit(): void {
    this.role = this.service.getRole();
    if (this.role == 'USER') {
      this.isCoach = false;
    }

    this.route.paramMap.subscribe(params => {
      this.eventId = params.get('eventId');
      console.log('Event ID:', this.eventId);
      this.getEventData(this.eventId);
    });
   
  }

  eventData: any;

  getEventData(id: any) {
    this.service.getApi(this.isCoach ? `coach/event/${id}` : `user/event/allEvents/${id}`).subscribe({
      next: (resp) => {
        this.eventData = resp.data;
        this.getEventListData();
        //this.data = resp.data?.map((item: any) => ({ ...item, isExpanded: false })).reverse();
      },
      error: error => {
        console.log(error.message)
      }
    });
  }

  eventListData: any;

  getEventListData() {
    this.service.getApi(this.isCoach ? 'coach/event' : 'user/event/allEvents').subscribe({
      next: resp => {
        
        this.eventListData = this.isCoach ? resp.data.events : resp.data;
        if (this.eventData) {
          this.eventListData = this.eventListData.filter((event: { id: any; }) => event.id !== this.eventData.id);
        }
        
        //this.data = resp.data?.map((item: any) => ({ ...item, isExpanded: false })).reverse();
      },
      error: error => {
        console.log(error.message)
      }
    });
  }

  getEventId(eventId: any) {
    this.router.navigateByUrl(`user/main/events/${eventId}`)
  }

  getEventEditId(eventId: any) {
    this.router.navigateByUrl(`user/main/edit-event/${eventId}`)
  }

  userIntrested(id: any) {
    this.service.postAPI(`user/event/register/${id}`, null).subscribe({
      next: (resp) => {
        console.log(resp);
        this.getEventListData();
        this.getEventData(id);
        this.service.triggerRefresh();
      },
      error: error => {
        console.log(error.message)
      }
    });
  }

  userNotIntrested(id: any) {
    this.service.postAPI(`user/event/unRegister/${id}`, null).subscribe({
      next: (resp) => {
        console.log(resp);
        this.getEventListData();
        this.getEventData(id);
        this.service.triggerRefresh();
      },
      error: error => {
        console.log(error.message)
      }
    });
  }

  deleteEvent(id: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this event!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e58934',
      cancelButtonColor: '#949296 ',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.deleteAcc(`coach/event/${id}`).subscribe({
          next: (resp) => {
            if (resp.success) {
              this.service.triggerRefresh();
              this.router.navigateByUrl('/user/main/add-event')
              //this.location.back();
            } else {
              this.getEventListData();
            }
          },
          error: (error) => {
            this.getEventListData();
            //this.toastr.error('Error deleting account!');
            console.error('Error deleting account', error);
          }
        });
      }
    });
  }


}
