import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ApartamentListItem } from './apartament-list-item';
import { PropertyService, Property } from '../../services/property.service';
import { AddressService, Address } from '../../services/address.service';
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
  addresses: Address[] = [];
  loading: boolean = false;
  currentUserEmail: string = '';
  selectedAddressId: number | null = null;
  
  constructor(
    private propertyService: PropertyService,
    private addressService: AddressService,
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
        this.loadAddresses();
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

  loadAddresses() {
    if (this.currentUserEmail) {
      this.addressService.getAddressesForUser(this.currentUserEmail).subscribe({
        next: (data) => {
          this.addresses = data;
        },
        error: (err) => {
          console.error('Error loading addresses:', err);
          this.toastService.showError('Грешка при зареждане на адресите');
        }
      });
    }
  }

  onAddressFilterChange(value: string) {
    const parsed = Number(value);
    this.selectedAddressId = Number.isNaN(parsed) ? null : parsed;
  }

  clearFilters() {
    this.selectedAddressId = null;
  }

  get filteredApartaments(): Property[] {
    const filtered = this.selectedAddressId == null
      ? this.apartaments
      : this.apartaments.filter(
        (apartament) => apartament.address_id === this.selectedAddressId,
      );

    return [...filtered].sort((a, b) => this.compareApartmentNumber(a.property_number, b.property_number));
  }

  private compareApartmentNumber(a: string, b: string): number {
    return String(a ?? '').localeCompare(String(b ?? ''), undefined, {
      numeric: true,
      sensitivity: 'base'
    });
  }
}
