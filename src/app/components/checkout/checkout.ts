import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.scss']
})
export class Checkout {
  totalAmount = 0;
  items: any[] = [];

  calculateTotal() {
    this.totalAmount = this.items.reduce((sum, item) => sum + item.price, 0);
  }
}
