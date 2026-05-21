import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

interface SmsResponse {
  success: boolean;
  sid: string;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class SmsService {
  private apiUrl = `${API_BASE_URL}/api/sms`;

  constructor(private http: HttpClient) {}

  sendTestSms(message?: string): Observable<SmsResponse> {
    return this.http.post<SmsResponse>(
      `${this.apiUrl}/test`,
      { message },
      { withCredentials: true },
    );
  }
}
