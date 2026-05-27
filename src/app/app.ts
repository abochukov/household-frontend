import { Component, signal } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { Sidebar } from './components/sidebar/sidebar';
import { Header } from './components/header/header';
import { CommonModule } from '@angular/common';
import { catchError, filter, map, of, startWith, switchMap } from 'rxjs';
import { ToastModule } from 'primeng/toast';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Sidebar, Header, CommonModule, ToastModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('household-angular');
  showAppShell = false;

  private readonly publicPaths = new Set<string>(['/', '/login']);

  constructor(
    private router: Router,
    private userService: UserService
  ) {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        startWith(null),
        switchMap(() => {
          const currentPath = this.router.url.split('?')[0];

          if (this.publicPaths.has(currentPath)) {
            return of(false);
          }

          return this.userService.getCurrentUser().pipe(
            map(() => true),
            catchError(() => of(false))
          );
        })
      )
      .subscribe((isAuthenticated) => {
        this.showAppShell = isAuthenticated;
      });
  }
}
