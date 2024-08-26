import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FollowCoachesComponent } from './follow-coaches.component';

describe('FollowCoachesComponent', () => {
  let component: FollowCoachesComponent;
  let fixture: ComponentFixture<FollowCoachesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FollowCoachesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FollowCoachesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
