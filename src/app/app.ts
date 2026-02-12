import { Component, signal } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { Sidebar } from './components/sidebar/sidebar';
import { Header } from './components/header/header';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Sidebar, Header, CommonModule, ToastModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('household-angular');
  isLoginPage = false;

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.isLoginPage = event.url === '/login' || event.url === '/';
      });
  }
}
