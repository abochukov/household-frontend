import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PropertyService, Property } from '../../services/property.service';
import { AddressService, Address } from '../../services/address.service';
import { UserService } from '../../services/user.service';
import { ToastService } from '../../services/toast.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-create-property',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  providers: [PropertyService, AddressService],
  templateUrl: './create-property.html',
  styleUrls: ['./create-property.scss']
})
export class CreateProperty implements OnInit {
  propertyForm!: FormGroup;
  addresses: Address[] = [];
  selectedAddress: Address | null = null;
  loading: boolean = false;
  currentUserEmail: string = '';

  constructor(
    private fb: FormBuilder,
    private propertyService: PropertyService,
    private addressService: AddressService,
    private userService: UserService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit() {
    this.propertyForm = this.fb.group({
      property_number: ['', Validators.required],
      floor: ['', Validators.required],
      member_amount: [1, [Validators.required, Validators.min(1)]],
      elevator: [false]
    });

    // Get current user from session
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUserEmail = user.email;
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

  loadAddresses() {
    if (this.currentUserEmail) {
      this.loading = true;
      this.addressService.getAddressesForUser(this.currentUserEmail).subscribe({
        next: (data) => {
          this.addresses = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading addresses:', err);
          this.toastService.showError('Грешка при зареждане на адресите');
          this.loading = false;
        }
      });
    }
  }

  handleAddressSelection(address: Address) {
    this.selectedAddress = address;
  }

  submitHandler() {
    if (this.propertyForm.valid && this.selectedAddress) {
      if (!this.currentUserEmail) {
        this.toastService.showError('Моля, влезте отново');
        return;
      }

      const formData = {
        ...this.propertyForm.value,
        address_id: this.selectedAddress.address_id,
        created_by: this.currentUserEmail
      };

      this.loading = true;

      this.propertyService.createProperty(formData).subscribe({
        next: (newProperty) => {
          this.propertyForm.reset({ elevator: false, member_amount: 1 });
          this.selectedAddress = null;
          this.loading = false;
          this.toastService.showSuccess('Имотът е създаден успешно!');
          // Redirect to manage page
          this.router.navigate(['/manage']);
        },
        error: (err) => {
          console.error('Error creating property:', err);
          this.toastService.showError(err.error?.message || 'Грешка при създаване на имота');
          this.loading = false;
        }
      });
    } else {
      if (!this.selectedAddress) {
        this.toastService.showError('Моля, изберете адрес');
      } else {
        this.toastService.showError('Моля, попълнете всички задължителни полета');
      }
    }
  }
}
