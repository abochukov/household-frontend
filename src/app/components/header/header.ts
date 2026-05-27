import { Component, OnInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faGear, faBell, faUser } from '@fortawesome/free-solid-svg-icons';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class Header implements OnInit {
  @ViewChild('userDropdownRef') userDropdownRef!: ElementRef;
  @ViewChild('userIconRef') userIconRef!: ElementRef;

  userDropdownVisible = false;
  username: string | null = null;

  // FontAwesome icons
  faGear = faGear;
  faBell = faBell;
  faUser = faUser;

  constructor(
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.username = user.username || user.email || null;
      },
      error: () => {
        this.username = null;
      }
    });
  }

  @HostListener('document:mousedown', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (
      this.userDropdownRef?.nativeElement &&
      this.userIconRef?.nativeElement &&
      !this.userDropdownRef.nativeElement.contains(event.target) &&
      !this.userIconRef.nativeElement.contains(event.target)
    ) {
      this.userDropdownVisible = false;
    }
  }

  handleUserClick() {
    this.userDropdownVisible = !this.userDropdownVisible;
  }

  handleSignOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    this.username = null;
    this.router.navigate(['/login']);
  }
}
