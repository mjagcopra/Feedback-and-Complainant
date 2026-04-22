import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface Complaint {
  id?: string;
  userId: string;
  name?: string;
  email?: string;
  department?: string;
  category: string;
  message: string;
  title?: string;
  status?: 'Pending' | 'In Review' | 'Resolved';
  adminResponse?: string;
  timestamp?: Date;
}

export interface ComplaintRequest {
  name: string;
  email: string;
  department?: string;
  category: string;
  message: string;
}

type BackendComplaint = {
  id: number;
  user_id: number;
  category_id: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'resolved';
  created_at: string;
  user_name: string;
  user_email: string;
  user_department?: string;
  category_name: string;
  admin_response?: string;
};

type BackendCreateComplaintRequest = {
  category_id: number;
  title: string;
  description: string;
};

@Injectable({
  providedIn: 'root'
})
export class ComplaintService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = 'http://localhost:5000/api/complaints';

  getComplaints(): Observable<Complaint[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<BackendComplaint[]>(this.apiUrl, { headers }).pipe(
      map((complaints) => complaints.map((complaint) => this.mapBackendComplaint(complaint))),
      catchError(this.handleError)
    );
  }

  submitComplaint(complaintData: ComplaintRequest): Observable<Complaint> {
    const headers = this.getAuthHeaders();
    return this.http.post<BackendComplaint>(this.apiUrl, this.toBackendCreatePayload(complaintData), { headers }).pipe(
      map((complaint) => this.mapBackendComplaint(complaint)),
      catchError(this.handleError)
    );
  }

  private toBackendCreatePayload(complaintData: ComplaintRequest): BackendCreateComplaintRequest {
    const numericCategoryId = Number(complaintData.category);
    const categoryId = Number.isFinite(numericCategoryId) && numericCategoryId > 0 ? numericCategoryId : 6;
    const trimmedMessage = complaintData.message.trim();

    return {
      category_id: categoryId,
      title: this.buildComplaintTitle(trimmedMessage),
      description: trimmedMessage,
    };
  }

  private buildComplaintTitle(message: string): string {
    const normalizedMessage = message.replace(/\s+/g, ' ').trim();

    if (normalizedMessage.length <= 60) {
      return normalizedMessage;
    }

    return `${normalizedMessage.slice(0, 57).trimEnd()}...`;
  }

  private mapBackendComplaint(complaint: BackendComplaint): Complaint {
    return {
      id: String(complaint.id),
      userId: String(complaint.user_id),
      name: complaint.user_name,
      email: complaint.user_email,
      department: complaint.user_department,
      category: complaint.category_name,
      message: complaint.description,
      title: complaint.title,
      status: this.mapStatus(complaint.status),
      adminResponse: complaint.admin_response,
      timestamp: new Date(complaint.created_at),
    };
  }

  private mapStatus(status: BackendComplaint['status']): 'Pending' | 'In Review' | 'Resolved' {
    switch (status) {
      case 'in_progress':
        return 'In Review';
      case 'resolved':
        return 'Resolved';
      default:
        return 'Pending';
    }
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
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
