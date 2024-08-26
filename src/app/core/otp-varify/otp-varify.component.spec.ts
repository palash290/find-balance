import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtpVarifyComponent } from './otp-varify.component';

describe('OtpVarifyComponent', () => {
  let component: OtpVarifyComponent;
  let fixture: ComponentFixture<OtpVarifyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OtpVarifyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OtpVarifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
