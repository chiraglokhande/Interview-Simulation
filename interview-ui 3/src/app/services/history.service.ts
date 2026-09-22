import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {

  private baseUrl = `${environment.apiUrl}/question`;

  constructor(
    private http: HttpClient
  ) {}

  // Logged-in user history roles
  getRolesHistory(): Observable<any[]> {

    return this.http.get<any[]>(
      `${this.baseUrl}/history/roles`
    );
  }

  // Logged-in user details by role
  getHistory(role:string): Observable<any[]> {

    return this.http.get<any[]>(
      `${this.baseUrl}/history/${encodeURIComponent(role)}`
    );
  }
}