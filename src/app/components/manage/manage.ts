import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ApartamentListItem } from './apartament-list-item';
import { PropertyService, Property } from '../../services/property.service';
import { UserService } from '../../services/user.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-manage',
  standalone: true,
  imports: [CommonModule, RouterModule, ApartamentListItem],
  providers: [PropertyService],
  templateUrl: './manage.html',
  styleUrls: ['./manage.scss']
})
export class Manage implements OnInit {
  apartaments: Property[] = [];
  loading: boolean = false;
  currentUserEmail: string = '';
  
  constructor(
    private propertyService: PropertyService,
    private userService: UserService,
    private toastService: ToastService,
    private router: Router
  ) {}
  
  ngOnInit() {
    // Get current user from session
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUserEmail = user.email;
        this.loadProperties();
      },
      error: (err) => {
        console.error('Error getting user:', err);
        if (err.status === 401) {
          this.toastService.showError('Моля, влезте в системата');
          this.router.navigate(['/login']);
        } else {
          this.toastService.showError('Грешка при зареждане на потребителя');
        }
      }
    });
  }

  loadProperties() {
    if (this.currentUserEmail) {
      this.loading = true;
      this.propertyService.getPropertiesForUser(this.currentUserEmail).subscribe({
        next: (data) => {
          this.apartaments = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading properties:', err);
          this.toastService.showError('Грешка при зареждане на имотите');
          this.loading = false;
        }
      });
    }
  }
}
