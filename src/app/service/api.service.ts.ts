import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiServiceTs {

  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

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
