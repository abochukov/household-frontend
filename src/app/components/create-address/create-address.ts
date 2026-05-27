import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AddressService, Address } from '../../services/address.service';
import { UserService } from '../../services/user.service';
import { HttpClientModule } from '@angular/common/http';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-create-address',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  providers: [AddressService],
  templateUrl: './create-address.html',
  styleUrls: ['./create-address.scss']
})
export class CreateAddress implements OnInit {
  addressForm!: FormGroup;
  addresses: Address[] = [];
  selectedAddress: Address | null = null;
  loading: boolean = false;
  currentUserEmail: string = '';

  constructor(
    private fb: FormBuilder,
    private addressService: AddressService,
    private userService: UserService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit() {
    this.addressForm = this.fb.group({
      city: ['', Validators.required],
      neighbourhood: [''],
      address: ['', Validators.required],
      entranceId: ['', Validators.required],
      floors: ['', Validators.required]
    });

    // Get current user from session
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUserEmail = user.email ?? '';
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
    console.log('loadAddresses called, currentUserEmail:', this.currentUserEmail);
    if (this.currentUserEmail) {
      this.loading = true;
      console.log('About to call addressService.getAddressesForUser');
      this.addressService.getAddressesForUser(this.currentUserEmail).subscribe({
        next: (data) => {
          console.log('Frontend received data:', data);
          this.addresses = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Frontend error loading addresses:', err);
          console.error('Error status:', err.status);
          console.error('Error message:', err.message);
          this.toastService.showError('Грешка при зареждане на адресите');
          this.loading = false;
        }
      });
    } else {
      console.log('⚠️ No currentUserEmail, skipping loadAddresses');
    }
  }

  submitHandler() {
    if (this.addressForm.valid) {
      if (!this.currentUserEmail) {
        this.toastService.showError('Моля, влезте отново');
        return;
      }

      const formData = {
        ...this.addressForm.value,
        created_by: this.currentUserEmail
      };

      this.loading = true;

      if (this.selectedAddress) {
        // Update address
        this.addressService.updateAddress(this.selectedAddress.address_id!, formData).subscribe({
          next: (data) => {
            this.loadAddresses();
            this.addressForm.reset();
            this.selectedAddress = null;
            this.loading = false;
            this.toastService.showSuccess('Адресът е актуализиран успешно!');
          },
          error: (err) => {
            console.error('Error updating address:', err);
            this.toastService.showError('Грешка при актуализация на адреса');
            this.loading = false;
          }
        });
      } else {
        // Create new address
        this.addressService.createAddress(formData).subscribe({
          next: (data) => {
            this.loadAddresses();
            this.addressForm.reset();
            this.loading = false;
            this.toastService.showSuccess('Адресът е създаден успешно!');
          },
          error: (err) => {
            console.error('Error creating address:', err);
            this.toastService.showError(err.error?.message || 'Грешка при създаване на адреса');
            this.loading = false;
          }
        });
      }
    }
  }

  handleEdit(address: Address) {
    this.selectedAddress = address;
    this.addressForm.patchValue({
      city: address.city,
      neighbourhood: address.neighbourhood,
      address: address.address,
      entranceId: address.entrance,
      floors: address.floors
    });
  }

  handleDelete(addressId: number) {
    if (confirm('Сигурни ли сте, че искате да изтриете този адрес?')) {
      this.loading = true;
      this.addressService.deleteAddress(addressId).subscribe({
        next: () => {
          this.loadAddresses();
          this.loading = false;
          this.toastService.showSuccess('Адресът е изтрит успешно!');
        },
        error: (err) => {
          console.error('Error deleting address:', err);
          this.toastService.showError('Грешка при изтриване на адреса');
          this.loading = false;
        }
      });
    }
  }
}
