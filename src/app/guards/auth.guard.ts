import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { ApiServiceTs } from '../service/api.service.ts';
import { catchError, map, of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const apiService = inject(ApiServiceTs);

  // Проверка дали има активна сесия чрез /me endpoint
  return apiService.getMe().pipe(
    map(() => true),
    catchError(() => {
      router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return of(false);
    })
  );
};
