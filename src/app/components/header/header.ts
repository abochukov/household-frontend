import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiServiceTs } from '../../service/api.service.ts';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class Header implements OnInit {
  userDropdownVisible = false;
  username: string | null = null;

  constructor(
    private router: Router,
    private apiService: ApiServiceTs
  ) {}

  ngOnInit() {
    // Вземи user info от сесията
    this.apiService.getMe().subscribe({
      next: (user: any) => {
        this.username = user.email || 'User';
      },
      error: () => {
        this.username = null;
      }
    });
  }

  handleUserClick() {
    this.userDropdownVisible = !this.userDropdownVisible;
  }

  handleSignOut() {
    this.apiService.logout().subscribe({
      next: () => {
        this.username = null;
        this.router.navigate(['/login']);
      }
    });
  }
}
