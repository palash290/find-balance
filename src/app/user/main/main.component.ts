import { Component } from '@angular/core';
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent {

  loading: boolean = true;
  showMenu = false;

  onToggleMenu() {
    this.sharedService.toggleMenuVisibility();
  }


  constructor(private sharedService: SharedService) {}

  ngOnInit() {
    this.sharedService.showMenu$.subscribe(visible => {
      this.showMenu = visible;
    });
  }

}
