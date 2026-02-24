import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Property {
  property_id?: number;
  address_id: number;
  property_number: string;
  floor: number;
  member_amount: number;
  elevator: boolean;
  created_at?: string;
  created_by?: string;
  // Address fields (from join)
  city?: string;
  neighbourhood?: string;
  address?: string;
  entrance?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  private apiUrl = 'http://localhost:3000/api/property';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  createProperty(data: {
    address_id: number;
    property_number: string;
    floor: number;
    member_amount: number;
    elevator: boolean;
    created_by: string;
  }): Observable<Property> {
    return this.http.post<Property>(`${this.apiUrl}/create`, data, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  getPropertiesForUser(username: string): Observable<Property[]> {
    const url = `${this.apiUrl}/user?username=${username}`;
    console.log('Calling backend URL:', url);
    return this.http.get<Property[]>(url, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  getPropertyById(id: number): Observable<Property> {
    return this.http.get<Property>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  updateProperty(id: number, data: Partial<Property>): Observable<Property> {
    return this.http.put<Property>(`${this.apiUrl}/${id}`, data, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  deleteProperty(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }
}
