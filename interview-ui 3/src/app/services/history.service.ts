import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {

  private baseUrl =
    'http://localhost:8080/question';

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