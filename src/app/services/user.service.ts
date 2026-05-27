import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

export interface User {
  email: string;
  username?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = API_BASE_URL;
  private apiUrl = `${this.baseUrl}/me`;

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
