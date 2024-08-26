import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyIntrestComponent } from './my-intrest.component';

describe('MyIntrestComponent', () => {
  let component: MyIntrestComponent;
  let fixture: ComponentFixture<MyIntrestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MyIntrestComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MyIntrestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
