import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InterviewService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getRoles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/roles`);
  }

  createRole(role: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/roles`, role);
  }

startInterview(role: string, difficulty: string): Observable<any> {
  return this.http.post(
    `${this.baseUrl}/question/start`,
    {
      role: role,
      difficulty: difficulty
    },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    }
  );
}
    evaluateAnswer(data: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/answer/evaluate`,
      data
    );
  }
  getQuestionsByInterview(interviewId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/question/interview/${interviewId}`
    );
  }

  getQuestions(role: string, difficulty: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/question/${encodeURIComponent(role)}/questions?difficulty=${encodeURIComponent(difficulty)}`
    );
  }

  submitAnswer(data: any): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/answer/submit`,
      data
    );
  }
getFollowUp(question: string, answer: string): Observable<string> {

  return this.http.post(
    `${this.baseUrl}/question/followup`,
    {
      question: question,
      answer: answer
    },
    {
      responseType: 'text'
    }
  );
}
}