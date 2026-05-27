import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

export interface UserProfile {
  email: string | null;
  username?: string;
  firstname?: string | null;
  lastname?: string | null;
  phone?: string | null;
  created_at?: string | null;
}

export interface LogoutResponse {
  success: boolean;
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

  getCurrentUser(): Observable<UserProfile> {
    return this.http.get<UserProfile>(this.apiUrl, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  logout(): Observable<LogoutResponse> {
    return this.http.post<LogoutResponse>(`${this.baseUrl}/auth/logout`, {}, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }
}
