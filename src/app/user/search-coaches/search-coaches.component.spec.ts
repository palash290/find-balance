import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchCoachesComponent } from './search-coaches.component';

describe('SearchCoachesComponent', () => {
  let component: SearchCoachesComponent;
  let fixture: ComponentFixture<SearchCoachesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SearchCoachesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SearchCoachesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
