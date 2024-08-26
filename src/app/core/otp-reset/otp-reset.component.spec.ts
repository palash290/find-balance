import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtpResetComponent } from './otp-reset.component';

describe('OtpResetComponent', () => {
  let component: OtpResetComponent;
  let fixture: ComponentFixture<OtpResetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OtpResetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OtpResetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
