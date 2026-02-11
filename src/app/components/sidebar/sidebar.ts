import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MenuModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss']
})
export class Sidebar {
  menuItems: MenuItem[] = [];

  constructor() {
    this.menuItems = [
      {
        label: 'Начало',
        icon: 'pi pi-home',
        routerLink: '/home'
      },
      {
        label: 'Нов адрес',
        icon: 'pi pi-map-marker',
        routerLink: '/create-address'
      },
      {
        label: 'Нов обект',
        icon: 'pi pi-building',
        routerLink: '/create-property'
      },
      {
        label: 'Управление',
        icon: 'pi pi-cog',
        routerLink: '/manage'
      },
      {
        label: 'Каса',
        icon: 'pi pi-wallet',
        routerLink: '/checkout'
      }
    ];
  }
}
