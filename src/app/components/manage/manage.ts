import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-manage',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './manage.html',
  styleUrls: ['./manage.scss']
})
export class Manage {
  addresses: any[] = [];
  properties: any[] = [];
}
