import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface UserNotification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'resolved' | 'deleted' | 'in_review' | 'info';
  is_read: 0 | 1;
  related_complaint_id: number | null;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/api/notifications';

  getNotifications(): Observable<UserNotification[]> {
    return this.http.get<UserNotification[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  markAsRead(notificationId: number): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.apiUrl}/${notificationId}/read`, {}).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const message = error.error?.message || `Error Code: ${error.status} Message: ${error.message}`;
    return throwError(() => new Error(message));
  }
}
