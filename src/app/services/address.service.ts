import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Address {
  address_id?: number;
  city: string;
  neighbourhood?: string;
  address: string;
  entrance: string;
  floors?: number;
  created_at?: string;
  created_by?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private apiUrl = 'http://localhost:3000/api/address';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  createAddress(data: {
    city: string;
    neighbourhood?: string;
    address: string;
    entranceId: string;
    floors?: number;
    created_by: string;
  }): Observable<Address> {
    return this.http.post<Address>(`${this.apiUrl}/create`, data, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  getAddressesForUser(username: string): Observable<Address[]> {
    const url = `${this.apiUrl}/user?username=${username}`;
    console.log('Calling backend URL:', url);
    return this.http.get<Address[]>(url, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  updateAddress(id: number, data: {
    city: string;
    neighbourhood?: string;
    address: string;
    entranceId: string;
    floors?: number;
  }): Observable<Address> {
    return this.http.put<Address>(`${this.apiUrl}/${id}`, data, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  deleteAddress(id: number): Observable<Address> {
    return this.http.delete<Address>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }
}
