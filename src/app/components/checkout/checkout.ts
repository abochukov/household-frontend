import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AddressService, Address } from '../../services/address.service';
import { PropertyService, Property } from '../../services/property.service';
import { UserService } from '../../services/user.service';
import { ToastService } from '../../services/toast.service';
import { AddressListComponent } from '../shared/address-list/address-list';
import { MonthTabItem, MonthTabsComponent } from '../shared/month-tabs/month-tabs';
import { AddressListItem } from '../../shared/models/address-list-item';
import { SmsService } from '../../services/sms.service';

type TabKey = 'january' | 'february' | 'march' | 'april' | 'may' | 'june' | 'july' | 'august' | 'september' | 'october' | 'november' | 'december' | 'total';
interface TableRow {
  name: string;
  value: number;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, AddressListComponent, MonthTabsComponent],
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.scss']
})
export class Checkout {
  addressControl: FormControl<number | null>;
  addresses: Address[] = [];
  selectedAddress: Address | null = null;
  loading = false;
  currentUserEmail = '';
  userProperties: Property[] = [];

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
  tableRows: TableRow[] = [];
  dataCache = new Map<string, TableRow[]>();
  smsSending = false;

  constructor(
    private fb: FormBuilder,
    private addressService: AddressService,
    private propertyService: PropertyService,
    private userService: UserService,
    private smsService: SmsService,
    private toastService: ToastService,
  ) {
    this.addressControl = this.fb.control<number | null>(null, Validators.required);
  }

  ngOnInit() {
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUserEmail = user.email;
        this.loadAddresses();
        this.loadProperties();
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

  loadProperties() {
    if (!this.currentUserEmail) {
      return;
    }

    this.propertyService.getPropertiesForUser(this.currentUserEmail).subscribe({
      next: (properties) => {
        this.userProperties = properties;
        this.dataCache.clear();
        this.updateRowsForSelection();
      },
      error: () => {
        this.toastService.showError('Грешка при зареждане на апартаментите');
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

    this.updateRowsForSelection();
  }

  onTabChange(tabValue: string) {
    if (!this.tabs.some((tab) => tab.value === tabValue)) {
      return;
    }

    this.activeTab = tabValue as TabKey;
    this.updateRowsForSelection();
  }

  private updateRowsForSelection() {
    if (!this.selectedAddress || this.selectedAddress.address_id == null) {
      this.tableRows = [];
      return;
    }

    const cacheKey = `${this.selectedAddress.address_id}:${this.activeTab}`;
    const cached = this.dataCache.get(cacheKey);
    if (cached) {
      this.tableRows = cached;
      return;
    }

    const rows = this.buildRows(this.selectedAddress.address_id, this.activeTab);
    this.dataCache.set(cacheKey, rows);
    this.tableRows = rows;
  }

  private buildRows(addressId: number, tab: TabKey): TableRow[] {
    const byAddress = this.userProperties.filter(
      (property) => property.address_id === addressId,
    );

    const filtered = tab === 'total'
      ? byAddress
      : byAddress.filter((property) => this.isInTabMonth(property.created_at, tab));

    return filtered.map((property) => ({
      name: `ап. ${property.property_number}`,
      // TODO: Replace with billed amount when payment endpoint is available.
      value: Number(property.area ?? 0),
    }));
  }

  private isInTabMonth(createdAt: string | undefined, tab: Exclude<TabKey, 'total'>): boolean {
    if (!createdAt) {
      return false;
    }

    const date = new Date(createdAt);
    if (Number.isNaN(date.getTime())) {
      return false;
    }

    return date.getMonth() === this.monthIndex(tab);
  }

  private monthIndex(tab: Exclude<TabKey, 'total'>): number {
    const monthMap: Record<Exclude<TabKey, 'total'>, number> = {
      january: 0,
      february: 1,
      march: 2,
      april: 3,
      may: 4,
      june: 5,
      july: 6,
      august: 7,
      september: 8,
      october: 9,
      november: 10,
      december: 11,
    };

    return monthMap[tab];
  }

  refreshTableData() {
    this.dataCache.clear();
    this.updateRowsForSelection();
  }

  getNoDataMessage(): string {
    if (!this.selectedAddress) {
      return 'Изберете адрес, за да заредите апартаментите.';
    }

    return 'Няма апартаменти за този период.';
  }

  sendTestSms() {
    this.smsSending = true;

    this.smsService.sendTestSms('Платихте такса за вход - бл.628, вх.Д в размер на 12.12 евро!').subscribe({
      next: () => {
        this.toastService.showSuccess('SMS беше изпратен успешно');
        this.smsSending = false;
      },
      error: (error) => {
        const backendMessage = error?.error?.message;
        this.toastService.showError(backendMessage || 'Неуспешно изпращане на SMS');
        this.smsSending = false;
      },
    });
  }
}
