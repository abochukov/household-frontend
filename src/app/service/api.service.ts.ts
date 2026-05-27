import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class ApiServiceTs {

  private baseUrl = API_BASE_URL;

  constructor(private http: HttpClient) {}

  signup(data: {
    username: string;
    email: string;
    firstname: string;
    lastname: string;
    password: string;
    phone?: string;
  }) {
    return this.http.post<{
      success: boolean;
      message: string;
      email: string;
      verification_preview_url?: string;
    }>(
      `${this.baseUrl}/auth/signup`,
      data,
      { withCredentials: true }
    );
  }

  getHello(): Observable<string> {
    return this.http.get(this.baseUrl, {responseType: 'text'});
  }
  
  login(data: { email: string; password: string }) {
    return this.http.post(
      `${this.baseUrl}/auth/login`,
      data,
      { withCredentials: true } // 👈 ВАЖНО
    );
  }

  getMe() {
    return this.http.get(
      `${this.baseUrl}/me`,
      { withCredentials: true }
    );
  }

  logout() {
    return this.http.post(
      `${this.baseUrl}/auth/logout`,
      {},
      { withCredentials: true }
    );
  }

}
