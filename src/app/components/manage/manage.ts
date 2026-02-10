import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApartamentListItem } from './apartament-list-item';

@Component({
  selector: 'app-manage',
  standalone: true,
  imports: [CommonModule, RouterModule, ApartamentListItem],
  templateUrl: './manage.html',
  styleUrls: ['./manage.scss']
})
export class Manage {
  apartaments: any[] = [];
  
  ngOnInit() {
    // TODO: Зареждане на апартаменти от API
    // const username = localStorage.getItem('username');
    // this.apiService.getProperties(username).subscribe(data => {
    //   this.apartaments = data;
    // });
  }
}
