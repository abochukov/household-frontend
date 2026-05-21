import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface SmsResponse {
  success: boolean;
  sid: string;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class SmsService {
  private apiUrl = 'http://localhost:3000/api/sms';

  constructor(private http: HttpClient) {}

  sendTestSms(message?: string): Observable<SmsResponse> {
    return this.http.post<SmsResponse>(
      `${this.apiUrl}/test`,
      { message },
      { withCredentials: true },
    );
  }
}
