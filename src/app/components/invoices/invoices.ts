import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Property, PropertyService } from '../../services/property.service';
import { UserService } from '../../services/user.service';
import { ToastService } from '../../services/toast.service';
import { MonthTabItem, MonthTabsComponent } from '../shared/month-tabs/month-tabs';

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
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, MonthTabsComponent],
  templateUrl: './invoices.html',
  styleUrls: ['./invoices.css'],
})
export class Invoices {
  loading = false;
  currentUserEmail = '';
  allProperties: Property[] = [];
  rows: InvoiceRow[] = [];

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
    private propertyService: PropertyService,
    private userService: UserService,
    private toastService: ToastService,
  ) {
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
        this.currentUserEmail = user.email;
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

  onTabChange(tabValue: string) {
    if (!this.tabs.some((tab) => tab.value === tabValue)) {
      return;
    }

    this.activeTab = tabValue as TabKey;
    this.rebuildRows();
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

  private rebuildRows() {
    const properties = this.getPropertiesForActiveTab();

    const totalResidents = properties.reduce((sum, p) => sum + Number(p.member_amount || 0), 0);
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

    this.rows = properties.map((property) => {
      const residents = Number(property.member_amount || 0);
      const isElevatorUser = !!property.elevator;

      const cleaner = this.byResidents(cleanerTotal, residents, totalResidents);
      const elevatorSubscription = isElevatorUser
        ? this.byResidents(elevatorSubscriptionTotal, residents, totalElevatorResidents)
        : 0;
      const elevatorElectricity = isElevatorUser
        ? this.byResidents(elevatorElectricityTotal, residents, totalElevatorResidents)
        : 0;
      const stairsElectricity = this.byResidents(stairsElectricityTotal, residents, totalResidents);
      const majorRepair = this.byResidents(majorRepairTotal, residents, totalResidents);

      const total =
        cleaner +
        elevatorSubscription +
        elevatorElectricity +
        stairsElectricity +
        majorRepair;

      return {
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

  private getPropertiesForActiveTab(): Property[] {
    if (this.activeTab === 'total') {
      return this.allProperties;
    }

    const monthTab: MonthTabKey = this.activeTab;
    return this.allProperties.filter((p) => this.isInMonth(p.created_at, monthTab));
  }

  private isInMonth(createdAt: string | undefined, tab: MonthTabKey): boolean {
    if (!createdAt) {
      return false;
    }

    const date = new Date(createdAt);
    if (Number.isNaN(date.getTime())) {
      return false;
    }

    return date.getMonth() === this.monthIndex(tab);
  }

  private monthIndex(tab: MonthTabKey): number {
    const monthMap: Record<MonthTabKey, number> = {
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

  private byResidents(total: number, residents: number, totalResidents: number): number {
    if (!totalResidents) {
      return 0;
    }

    return (total * residents) / totalResidents;
  }

}
