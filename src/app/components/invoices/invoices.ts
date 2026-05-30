import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { AddressService, Address } from '../../services/address.service';
import { Property, PropertyService } from '../../services/property.service';
import { MonthCharges, MonthColumn, TotalSumService, YearlyTotalRow } from '../../services/total-sum.service';
import { UserService } from '../../services/user.service';
import { ToastService } from '../../services/toast.service';
import { AddressListComponent } from '../shared/address-list/address-list';
import { MonthTabItem, MonthTabsComponent } from '../shared/month-tabs/month-tabs';
import { AddressListItem } from '../../shared/models/address-list-item';

type TabKey =
  | 'january'
  | 'february'
  | 'march'
  | 'april'
  | 'may'
  | 'june'
  | 'july'
  | 'august'
  | 'september'
  | 'october'
  | 'november'
  | 'december'
  | 'total';

type MonthTabKey = Exclude<TabKey, 'total'>;

interface InvoiceRow {
  propertyId: number;
  apartmentNumber: string;
  residents: number;
  usesElevator: boolean;
  cleaner: number;
  elevatorSubscription: number;
  elevatorElectricity: number;
  stairsElectricity: number;
  majorRepair: number;
  total: number;
}

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AddressListComponent, MonthTabsComponent],
  templateUrl: './invoices.html',
  styleUrls: ['./invoices.css'],
})
export class Invoices {
  private totalSumService = inject(TotalSumService);

  addressControl: FormControl<number | null>;
  addresses: Address[] = [];
  selectedAddress: Address | null = null;
  loading = false;
  saving = false;
  loadingTotals = false;
  loadingMonthCharges = false;
  currentUserEmail = '';
  currentYear = new Date().getFullYear();
  allProperties: Property[] = [];
  rows: InvoiceRow[] = [];
  yearlyTotals: YearlyTotalRow[] = [];
  payingPropertyIds = new Set<number>();

  tabs: MonthTabItem[] = [
    { label: 'Януари', value: 'january' },
    { label: 'Февруари', value: 'february' },
    { label: 'Март', value: 'march' },
    { label: 'Април', value: 'april' },
    { label: 'Май', value: 'may' },
    { label: 'Юни', value: 'june' },
    { label: 'Юли', value: 'july' },
    { label: 'Август', value: 'august' },
    { label: 'Септември', value: 'september' },
    { label: 'Октомври', value: 'october' },
    { label: 'Ноември', value: 'november' },
    { label: 'Декември', value: 'december' },
    { label: 'Общо', value: 'total' },
  ];

  activeTab: TabKey = 'january';

  chargesForm;

  constructor(
    private fb: FormBuilder,
    private addressService: AddressService,
    private propertyService: PropertyService,
    private userService: UserService,
    private toastService: ToastService,
  ) {
    this.addressControl = this.fb.control<number | null>(null, Validators.required);

    this.chargesForm = this.fb.group({
      cleaner: [0, [Validators.min(0)]],
      elevatorSubscription: [0, [Validators.min(0)]],
      elevatorElectricity: [0, [Validators.min(0)]],
      stairsElectricity: [0, [Validators.min(0)]],
      majorRepair: [0, [Validators.min(0)]],
    });

    this.chargesForm.valueChanges.subscribe(() => {
      this.rebuildRows();
    });
  }

  ngOnInit() {
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUserEmail = user.email ?? '';
        this.loadAddresses();
        this.loadProperties();
      },
      error: (err) => {
        if (err.status === 401) {
          this.toastService.showError('Моля, влезте в системата');
          return;
        }

        this.toastService.showError('Грешка при зареждане на потребителя');
      },
    });
  }

  handleAddressSelection(address: AddressListItem) {
    this.selectedAddress = this.addresses.find(
      (item) => item.address_id === address.address_id,
    ) || null;

    this.rebuildRows();
    this.loadYearlyTotals();

    if (this.activeTab !== 'total') {
      this.loadMonthCharges(this.activeTab as MonthTabKey);
    }
  }

  onTabChange(tabValue: string) {
    if (!this.tabs.some((tab) => tab.value === tabValue)) {
      return;
    }

    this.activeTab = tabValue as TabKey;
    if (this.activeTab !== 'total') {
      this.loadMonthCharges(this.activeTab as MonthTabKey);
    }

    this.rebuildRows();

    if (this.yearlyTotals.length === 0 || this.activeTab === 'total') {
      this.loadYearlyTotals();
    }
  }

  private loadProperties() {
    if (!this.currentUserEmail) {
      return;
    }

    this.loading = true;
    this.propertyService.getPropertiesForUser(this.currentUserEmail).subscribe({
      next: (properties) => {
        this.allProperties = properties;
        this.loading = false;
        this.rebuildRows();
      },
      error: () => {
        this.loading = false;
        this.toastService.showError('Грешка при зареждане на апартаментите');
      },
    });
  }

  private loadAddresses() {
    if (!this.currentUserEmail) {
      return;
    }

    this.loading = true;
    this.addressService.getAddressesForUser(this.currentUserEmail).subscribe({
      next: (addresses) => {
        this.addresses = addresses;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastService.showError('Грешка при зареждане на адресите');
      },
    });
  }

  private rebuildRows() {
    if (!this.selectedAddress || this.selectedAddress.address_id == null) {
      this.rows = [];
      this.yearlyTotals = [];
      return;
    }

    if (this.activeTab === 'total') {
      this.rows = [];
      return;
    }

    const properties = this.getPropertiesForSelectedAddress();

    const totalResidents = properties.reduce((sum, p) => sum + Number(p.member_amount || 0), 0);
    const totalIdealShare = properties.reduce((sum, p) => sum + Number(p.ideal_share || 0), 0);
    const elevatorProperties = properties.filter((p) => !!p.elevator);
    const totalElevatorResidents = elevatorProperties.reduce(
      (sum, p) => sum + Number(p.member_amount || 0),
      0,
    );

    const cleanerTotal = Number(this.chargesForm.value.cleaner || 0);
    const elevatorSubscriptionTotal = Number(this.chargesForm.value.elevatorSubscription || 0);
    const elevatorElectricityTotal = Number(this.chargesForm.value.elevatorElectricity || 0);
    const stairsElectricityTotal = Number(this.chargesForm.value.stairsElectricity || 0);
    const majorRepairTotal = Number(this.chargesForm.value.majorRepair || 0);

    this.rows = properties
      .sort((a, b) => this.compareApartmentNumber(a.property_number, b.property_number))
      .map((property) => {
      const residents = Number(property.member_amount || 0);
      const idealShare = Number(property.ideal_share || 0);
      const isElevatorUser = !!property.elevator;

      const cleaner = this.byResidents(cleanerTotal, residents, totalResidents);
      const elevatorSubscription = isElevatorUser
        ? this.byResidents(elevatorSubscriptionTotal, residents, totalElevatorResidents)
        : 0;
      const elevatorElectricity = isElevatorUser
        ? this.byResidents(elevatorElectricityTotal, residents, totalElevatorResidents)
        : 0;
      const stairsElectricity = this.byResidents(stairsElectricityTotal, residents, totalResidents);
      const majorRepair = this.byIdealShare(majorRepairTotal, idealShare, totalIdealShare);

      const total =
        cleaner +
        elevatorSubscription +
        elevatorElectricity +
        stairsElectricity +
        majorRepair;

      return {
        propertyId: Number(property.property_id),
        apartmentNumber: property.property_number,
        residents,
        usesElevator: isElevatorUser,
        cleaner,
        elevatorSubscription,
        elevatorElectricity,
        stairsElectricity,
        majorRepair,
        total,
      };
    });
  }

  private getPropertiesForSelectedAddress(): Property[] {
    if (!this.selectedAddress || this.selectedAddress.address_id == null) {
      return [];
    }

    return this.allProperties.filter(
      (property) => property.address_id === this.selectedAddress?.address_id,
    );
  }

  saveCurrentMonth() {
    if (this.activeTab === 'total') {
      return;
    }

    if (!this.currentUserEmail) {
      this.toastService.showError('Липсва потребителска сесия');
      return;
    }

    if (!this.selectedAddress || this.selectedAddress.address_id == null) {
      this.toastService.showError('Изберете адрес');
      return;
    }

    if (this.rows.length === 0) {
      this.toastService.showError('Няма апартаменти за запис');
      return;
    }

    const month = this.activeTab as MonthTabKey;
    const payloadRows = this.rows.map((row) => ({
      property_id: row.propertyId,
      property_number: row.apartmentNumber,
      amount: Number(row.total.toFixed(2)),
    }));

    this.saving = true;
    this.totalSumService.saveMonth({
      username: this.currentUserEmail,
      address_id: this.selectedAddress.address_id,
      year: this.currentYear,
      month: month as MonthColumn,
      rows: payloadRows,
      charges: this.getCurrentCharges(),
    }).subscribe({
      next: () => {
        this.saving = false;
        this.toastService.showSuccess('Сметките са записани успешно');
        this.loadYearlyTotals();
      },
      error: () => {
        this.saving = false;
        this.toastService.showError('Грешка при запис на сметките');
      },
    });
  }

  getNoDataMessage(): string {
    if (!this.selectedAddress) {
      return 'Изберете адрес, за да заредите апартаментите.';
    }

    if (this.activeTab === 'total') {
      return 'Няма записани суми за текущата година.';
    }

    return 'Няма апартаменти за избрания период.';
  }

  private loadYearlyTotals() {
    if (!this.currentUserEmail || !this.selectedAddress || this.selectedAddress.address_id == null) {
      this.yearlyTotals = [];
      return;
    }

    this.loadingTotals = true;
    this.totalSumService.getYearly(this.currentUserEmail, this.selectedAddress.address_id, this.currentYear).subscribe({
      next: (rows) => {
        this.yearlyTotals = [...rows].sort((a, b) =>
          this.compareApartmentNumber(a.property_number, b.property_number),
        );
        this.loadingTotals = false;
      },
      error: () => {
        this.loadingTotals = false;
        this.yearlyTotals = [];
        this.toastService.showError('Грешка при зареждане на общите суми');
      },
    });
  }

  private loadMonthCharges(month: MonthTabKey) {
    if (!this.currentUserEmail || !this.selectedAddress?.address_id) {
      return;
    }

    this.loadingMonthCharges = true;
    this.totalSumService.getMonthCharges(
      this.currentUserEmail,
      this.selectedAddress.address_id,
      this.currentYear,
      month as MonthColumn,
    ).subscribe({
      next: (charges) => {
        this.loadingMonthCharges = false;
        this.chargesForm.patchValue(charges, { emitEvent: true });
      },
      error: () => {
        this.loadingMonthCharges = false;
        this.toastService.showError('Грешка при зареждане на месечните параметри');
      },
    });
  }

  payForRow(row: InvoiceRow) {
    if (this.activeTab === 'total') {
      return;
    }

    if (!this.currentUserEmail || !this.selectedAddress?.address_id) {
      this.toastService.showError('Изберете адрес и влезте в системата');
      return;
    }

    const month = this.activeTab as MonthTabKey;
    const alreadyPaid = this.isMonthPaidForProperty(row.propertyId, month);

    if (alreadyPaid) {
      this.toastService.showSuccess('Задължението вече е платено');
      return;
    }

    this.payingPropertyIds.add(row.propertyId);
    this.totalSumService.payMonth({
      username: this.currentUserEmail,
      address_id: this.selectedAddress.address_id,
      property_id: row.propertyId,
      year: this.currentYear,
      month: month as MonthColumn,
      paid_by: this.currentUserEmail,
    }).subscribe({
      next: (result) => {
        this.payingPropertyIds.delete(row.propertyId);

        if (result.already_paid) {
          this.toastService.showSuccess('Задължението вече е било платено');
        } else {
          this.toastService.showSuccess('Плащането е записано успешно');
          if (!result.email_sent || !result.sms_sent) {
            this.toastService.showError('Плащането е записано, но част от известията не бяха изпратени');
          }
        }

        this.loadYearlyTotals();
      },
      error: (error) => {
        this.payingPropertyIds.delete(row.propertyId);
        const message = error?.error?.message;
        this.toastService.showError(message || 'Грешка при запис на плащането');
      },
    });
  }

  isPayDisabled(row: InvoiceRow): boolean {
    if (this.activeTab === 'total') {
      return true;
    }

    const month = this.activeTab as MonthTabKey;
    const paid = this.isMonthPaidForProperty(row.propertyId, month);

    if (this.payingPropertyIds.has(row.propertyId)) {
      return true;
    }

    return paid;
  }

  getPayLabel(row: InvoiceRow): string {
    if (this.activeTab === 'total') {
      return 'Плати';
    }

    if (this.payingPropertyIds.has(row.propertyId)) {
      return 'Плащане...';
    }

    const month = this.activeTab as MonthTabKey;
    const paid = this.isMonthPaidForProperty(row.propertyId, month);

    if (paid) {
      return 'Платено';
    }

    return 'Плати';
  }

  isMonthPaidForTotalRow(row: YearlyTotalRow, month: MonthTabKey): boolean {
    const key = `paid_${month}` as keyof YearlyTotalRow;
    const value = row[key];

    return value === true || value === 'true' || value === 't' || value === 1;
  }

  getTotalMonthCellClass(row: YearlyTotalRow, month: MonthTabKey): string {
    const monthAmount = this.getMonthAmountForTotalRow(row, month);

    if (monthAmount === null) {
      return '';
    }

    return this.isMonthPaidForTotalRow(row, month) ? 'paid-cell' : 'unpaid-cell';
  }

  private isMonthPaidForProperty(propertyId: number, month: MonthTabKey): boolean {
    const row = this.yearlyTotals.find((item) => Number(item.property_id) === Number(propertyId));
    return row ? this.isMonthPaidForTotalRow(row, month) : false;
  }

  private getMonthAmountForTotalRow(row: YearlyTotalRow, month: MonthTabKey): number | null {
    const value = row[month];

    if (typeof value === 'number') {
      return Number.isNaN(value) ? null : value;
    }

    if (typeof value === 'string') {
      const parsed = Number(value);
      return Number.isNaN(parsed) ? null : parsed;
    }

    return null;
  }

  private getCurrentCharges(): MonthCharges {
    return {
      cleaner: Number(this.chargesForm.value.cleaner || 0),
      elevatorSubscription: Number(this.chargesForm.value.elevatorSubscription || 0),
      elevatorElectricity: Number(this.chargesForm.value.elevatorElectricity || 0),
      stairsElectricity: Number(this.chargesForm.value.stairsElectricity || 0),
      majorRepair: Number(this.chargesForm.value.majorRepair || 0),
    };
  }

  get isTotalTab(): boolean {
    return this.activeTab === 'total';
  }

  private byResidents(total: number, residents: number, totalResidents: number): number {
    if (!totalResidents) {
      return 0;
    }

    return (total * residents) / totalResidents;
  }

  private byIdealShare(total: number, idealShare: number, totalIdealShare: number): number {
    if (!totalIdealShare) {
      return 0;
    }

    return (total * idealShare) / totalIdealShare;
  }

  private compareApartmentNumber(a: string, b: string): number {
    return String(a ?? '').localeCompare(String(b ?? ''), undefined, { numeric: true, sensitivity: 'base' });
  }

}
