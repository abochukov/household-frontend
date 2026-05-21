import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface MonthTabItem {
  label: string;
  value: string;
}

@Component({
  selector: 'app-month-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './month-tabs.html',
  styleUrl: './month-tabs.css',
})
export class MonthTabsComponent {
  @Input() tabs: MonthTabItem[] = [];
  @Input() activeTab = '';
  @Output() tabChange = new EventEmitter<string>();

  selectTab(value: string) {
    this.tabChange.emit(value);
  }
}
