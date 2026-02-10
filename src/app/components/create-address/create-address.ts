import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-create-address',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-address.html',
  styleUrls: ['./create-address.scss']
})
export class CreateAddress implements OnInit {
  addressForm!: FormGroup;
  addresses: any[] = [];
  selectedAddress: any = null;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.addressForm = this.fb.group({
      city: ['', Validators.required],
      neighbourhood: [''],
      address: ['', Validators.required],
      entranceId: ['', Validators.required],
      floors: ['', Validators.required]
    });

    // TODO: Load addresses from API
    // const username = localStorage.getItem('username');
    // this.apiService.getAddresses(username).subscribe(data => {
    //   this.addresses = data;
    // });
  }

  submitHandler() {
    if (this.addressForm.valid) {
      const username = localStorage.getItem('username');
      const formData = {
        ...this.addressForm.value,
        created_by: username
      };

      if (this.selectedAddress) {
        // Update address
        console.log('Update address:', formData);
        // TODO: API call to update
      } else {
        // Create new address
        console.log('Create address:', formData);
        // TODO: API call to create
      }
    }
  }

  handleEdit(address: any) {
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
      // TODO: API call to delete
      console.log('Delete address:', addressId);
    }
  }
}
