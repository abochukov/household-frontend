import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { PropertyService, Property } from '../../services/property.service';
import { AddressService, Address } from '../../services/address.service';
import { UserService } from '../../services/user.service';
import { ToastService } from '../../services/toast.service';
import { HttpClientModule } from '@angular/common/http';
import { AddressListComponent } from '../shared/address-list/address-list';
import { AddressListItem } from '../../shared/models/address-list-item';

@Component({
  selector: 'app-create-property',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, AddressListComponent],
  providers: [PropertyService, AddressService],
  templateUrl: './create-property.html',
  styleUrls: ['./create-property.scss']
})
export class CreateProperty implements OnInit {
  propertyForm!: FormGroup;
  addressControl!: FormControl<number | null>;
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
      address_id: [null, Validators.required],
      property_number: ['', Validators.required],
      floor: ['', Validators.required],
      area: [null, [Validators.required, Validators.min(1)]],
      member_amount: [1, [Validators.required, Validators.min(1)]],
      ideal_share: [null, [Validators.min(0), Validators.max(100)]],
      pets: [false],
      rent: [false],
      elevator: [false]
    });

    this.addressControl = this.propertyForm.get('address_id') as FormControl<number | null>;

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

  handleAddressSelection(address: AddressListItem) {
    this.selectedAddress = this.addresses.find(
      (item) => item.address_id === address.address_id
    ) || null;

    this.propertyForm.patchValue({ address_id: address.address_id });
  }

  submitHandler() {
    if (this.propertyForm.valid) {
      if (!this.currentUserEmail) {
        this.toastService.showError('Моля, влезте отново');
        return;
      }

      const selectedAddressId = this.propertyForm.value.address_id;
      const selectedAddress = this.addresses.find(
        (address) => address.address_id === selectedAddressId
      );

      if (!selectedAddress) {
        this.toastService.showError('Моля, изберете адрес');
        return;
      }

      const formData = {
        ...this.propertyForm.value,
        address_id: selectedAddress.address_id,
        created_by: this.currentUserEmail
      };

      this.loading = true;

      this.propertyService.createProperty(formData).subscribe({
        next: (newProperty) => {
          this.propertyForm.reset({
            address_id: null,
            area: null,
            ideal_share: null,
            elevator: false,
            pets: false,
            rent: false,
            member_amount: 1,
          });
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
      if (this.propertyForm.get('address_id')?.invalid) {
        this.toastService.showError('Моля, изберете адрес');
      } else {
        this.toastService.showError('Моля, попълнете всички задължителни полета');
      }
    }
  }
}
