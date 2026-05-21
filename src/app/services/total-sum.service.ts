import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

export type MonthColumn =
  | 'january'
  | 'february'
  | 'march'
  | 'april'
  | 'may'
  | 'june'
  | 'july'
  | 'august'
  | 'september'
  | 'october'
  | 'november'
  | 'december';

export interface SaveMonthRow {
  property_id: number;
  property_number: string;
  amount: number;
}

export interface YearlyTotalRow {
  property_id: number;
  property_number: string;
  january: number | null;
  february: number | null;
  march: number | null;
  april: number | null;
  may: number | null;
  june: number | null;
  july: number | null;
  august: number | null;
  september: number | null;
  october: number | null;
  november: number | null;
  december: number | null;
  month_amount: number | null;
  total_sum: number | null;
}

@Injectable({
  providedIn: 'root',
})
export class TotalSumService {
  private apiUrl = `${API_BASE_URL}/api/total-sum`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
    });
  }

  saveMonth(payload: {
    username: string;
    address_id: number;
    year: number;
    month: MonthColumn;
    rows: SaveMonthRow[];
  }): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.apiUrl}/save-month`, payload, {
      headers: this.getHeaders(),
      withCredentials: true,
    });
  }

  getYearly(username: string, address_id: number, year: number): Observable<YearlyTotalRow[]> {
    const url = `${this.apiUrl}/yearly?username=${encodeURIComponent(username)}&address_id=${address_id}&year=${year}`;
    return this.http.get<YearlyTotalRow[]>(url, {
      headers: this.getHeaders(),
      withCredentials: true,
    });
  }
}
