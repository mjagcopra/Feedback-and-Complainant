import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export type AdminComplaintStatus = 'pending' | 'in_progress' | 'resolved';

export interface DailySubmittedEntry {
  date: string;
  count: number;
}

export interface AdminComplaint {
  id: number;
  user_id: number;
  category_id: number;
  title: string;
  description: string;
  status: AdminComplaintStatus;
  created_at: string;
  user_name: string;
  user_email: string;
  user_department?: string;
  category_name: string;
  admin_response?: string;
}

export interface DashboardData {
  totalComplaints: number;
  pendingComplaints: number;
  inProgressComplaints: number;
  resolvedComplaints: number;
  categories: { [key: string]: number };
  recentComplaints: any[];
  // Add other dashboard fields as needed
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private dashboardUrl = 'http://localhost:5000/api/admin/dashboard';
  private complaintsUrl = 'http://localhost:5000/api/admin/complaints';

  getDashboard(): Observable<DashboardData> {
    return this.http.get<DashboardData>(this.dashboardUrl).pipe(
      catchError(this.handleError)
    );
  }

  getDailySubmitted(): Observable<DailySubmittedEntry[]> {
    return this.http
      .get<DailySubmittedEntry[]>(`${this.complaintsUrl}/daily-submitted`)
      .pipe(catchError(this.handleError));
  }

  getComplaints(status: 'all' | AdminComplaintStatus = 'all'): Observable<AdminComplaint[]> {
    const query = status === 'all' ? '' : `?status=${status}`;
    return this.http.get<AdminComplaint[]>(`${this.complaintsUrl}${query}`).pipe(
      catchError(this.handleError)
    );
  }

  updateComplaintStatus(complaintId: number, status: AdminComplaintStatus): Observable<AdminComplaint> {
    return this.http.patch<AdminComplaint>(`${this.complaintsUrl}/${complaintId}/status`, { status }).pipe(
      catchError(this.handleError)
    );
  }

  deleteComplaint(complaintId: number): Observable<{ message: string; userNotification?: string }> {
    return this.http.delete<{ message: string; userNotification?: string }>(`${this.complaintsUrl}/${complaintId}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = error.error?.message || `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}
