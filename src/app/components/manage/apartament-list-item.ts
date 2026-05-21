import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-apartament-list-item',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './apartament-list-item.html',
  styleUrls: ['./apartament-list-item.scss']
})
export class ApartamentListItem {
  @Input() city?: string;
  @Input() neighbourhood?: string;
  @Input() address?: string;
  @Input() property_id?: number;
  @Input() property_number?: string;
  @Input() floor?: number;
  @Input() ideal_share?: number;
  @Input() member_amount?: number;
  @Input() pets?: boolean;
  @Input() rent?: boolean;
  @Input() elevator?: boolean;
}
