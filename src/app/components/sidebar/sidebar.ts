import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faHouse, 
  faWrench, 
  faHouseFire, 
  faMoneyBill, 
  faUser, 
  faRightFromBracket, 
  faBarsProgress, 
  faBars 
} from '@fortawesome/free-solid-svg-icons';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss']
})
export class Sidebar implements OnInit {
  isOpen = false;

  // FontAwesome icons
  faHouse = faHouse;
  faWrench = faWrench;
  faHouseFire = faHouseFire;
  faBarsProgress = faBarsProgress;
  faMoneyBill = faMoneyBill;
  faUser = faUser;
  faRightFromBracket = faRightFromBracket;
  faBars = faBars;

  constructor(private router: Router) {}

  ngOnInit() {
    // Close sidebar on route change to login/signup/home
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      if (
        event.url === '/login' ||
        event.url === '/signup' ||
        event.url === '/'
      ) {
        this.isOpen = false;
      }
    });
  }

  toggleSidebar() {
    this.isOpen = !this.isOpen;
  }

  closeSidebar() {
    this.isOpen = false;
  }
}
