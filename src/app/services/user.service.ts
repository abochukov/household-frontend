import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000/me';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(this.apiUrl, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }
}
