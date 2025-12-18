import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiServiceTs } from '../../service/api.service.ts';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class Home implements OnInit {
  username: string | null = null;

  constructor(
    private router: Router,
    private apiService: ApiServiceTs
  ) {}

  ngOnInit() {
    // Вземи user info от session
    this.apiService.getMe().subscribe({
      next: (user: any) => {
        this.username = user.email;
      },
      error: () => {
        this.router.navigate(['/login']);
      }
    });
  }
}
