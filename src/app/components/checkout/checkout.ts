import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AddressService, Address } from '../../services/address.service';
import { UserService } from '../../services/user.service';
import { ToastService } from '../../services/toast.service';
import { AddressListComponent } from '../shared/address-list/address-list';
import { AddressListItem } from '../../shared/models/address-list-item';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, AddressListComponent],
  providers: [AddressService],
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.scss']
})
export class Checkout {
  addressControl: FormControl<number | null>;
  addresses: Address[] = [];
  selectedAddress: Address | null = null;
  loading = false;
  currentUserEmail = '';

  constructor(
    private fb: FormBuilder,
    private addressService: AddressService,
    private userService: UserService,
    private toastService: ToastService
  ) {
    this.addressControl = this.fb.control<number | null>(null, Validators.required);
  }

  ngOnInit() {
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUserEmail = user.email;
        this.loadAddresses();
      },
      error: (err) => {
        if (err.status === 401) {
          this.toastService.showError('Моля, влезте в системата');
          return;
        }

        this.toastService.showError('Грешка при зареждане на потребителя');
      }
    });
  }

  loadAddresses() {
    if (!this.currentUserEmail) {
      return;
    }

    this.loading = true;
    this.addressService.getAddressesForUser(this.currentUserEmail).subscribe({
      next: (data) => {
        this.addresses = data;
        this.loading = false;
      },
      error: () => {
        this.toastService.showError('Грешка при зареждане на адресите');
        this.loading = false;
      }
    });
  }

  handleAddressSelection(address: AddressListItem) {
    this.selectedAddress = this.addresses.find(
      (item) => item.address_id === address.address_id
    ) || null;
  }
}
