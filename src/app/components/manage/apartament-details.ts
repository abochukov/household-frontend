import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PropertyService, Property } from '../../services/property.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-apartament-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  providers: [PropertyService],
  templateUrl: './apartament-details.html',
  styleUrls: ['./apartament-details.scss']
})
export class ApartamentDetails implements OnInit {
  apartament: Property | null = null;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private propertyService: PropertyService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const propertyId = idParam ? parseInt(idParam, 10) : NaN;

    if (!propertyId) {
      this.toastService.showError('Невалиден идентификатор на имот');
      this.router.navigate(['/manage']);
      return;
    }

    this.loading = true;
    this.propertyService.getPropertyById(propertyId).subscribe({
      next: (property) => {
        this.apartament = property;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 404) {
          this.toastService.showError('Имотът не е намерен');
        } else {
          this.toastService.showError('Грешка при зареждане на имота');
        }
        this.router.navigate(['/manage']);
      },
    });
  }
}
