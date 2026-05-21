import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { RadioButtonModule } from 'primeng/radiobutton';
import { AddressListItem } from '../../../shared/models/address-list-item';

@Component({
  selector: 'app-address-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RadioButtonModule],
  templateUrl: './address-list.html',
  styleUrls: ['./address-list.scss']
})
export class AddressListComponent {
  @Input() addresses: AddressListItem[] = [];
  @Input() loading = false;
  @Input() control!: FormControl<number | null>;
  @Input() label = 'Изберете адрес';
  @Input() required = false;
  @Input() validationMessage = 'Моля, изберете адрес';
  @Input() emptyMessage = 'Няма налични адреси. Моля, създайте адрес първо.';

  @Output() addressSelected = new EventEmitter<AddressListItem>();

  onAddressClick(address: AddressListItem) {
    this.addressSelected.emit(address);
  }

  get shouldShowValidationError(): boolean {
    return !!this.control && this.control.invalid && this.control.touched;
  }
}
