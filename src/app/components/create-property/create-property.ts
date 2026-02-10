import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-create-property',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-property.html',
  styleUrls: ['./create-property.scss']
})
export class CreateProperty implements OnInit {
  propertyForm!: FormGroup;
  addresses: any[] = [];
  selectedAddress: any = null;
  residents: any[] = [];

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.propertyForm = this.fb.group({
      city: [{value: '', disabled: true}, Validators.required],
      neighbourhood: [{value: '', disabled: true}],
      address: [{value: '', disabled: true}, Validators.required],
      entranceId: [{value: '', disabled: true}, Validators.required],
      propertyNumber: ['', Validators.required],
      floor: [''],
      area: [''],
      memberAmount: [''],
      pets: [false],
      rent: [false],
      isElevatorUsed: [true],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    // TODO: Load addresses from API
    // const username = localStorage.getItem('username');
    // this.apiService.getAddresses(username).subscribe(data => {
    //   this.addresses = data;
    // });
  }

  handleAddressSelection(address: any) {
    this.selectedAddress = address;
    this.propertyForm.patchValue({
      city: address.city,
      neighbourhood: address.neighbourhood,
      address: address.address,
      entranceId: address.entrance
    });
  }

  addResident() {
    if (this.residents.length < 6) {
      this.residents.push({ name: '', birthday: '' });
    }
  }

  handleResidentChange(index: number, field: string, value: string) {
    this.residents[index][field] = value;
  }

  submitHandler() {
    if (this.propertyForm.valid && this.selectedAddress) {
      const username = localStorage.getItem('username');
      const formData = {
        ...this.propertyForm.getRawValue(),
        address_id: this.selectedAddress.address_id,
        created_by: username,
        residents: this.residents
      };

      console.log('Create property:', formData);
      // TODO: API call to create property
    }
  }
}
