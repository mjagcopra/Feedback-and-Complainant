import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

export interface User {
  id?: string | number;
  email: string;
  name: string;
  role: string;
  department?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  usertype: string;
  department: string;
  role?: 'user' | 'admin';
}

export interface ForgotPasswordResponse {
  message: string;
  resetToken?: string;
}

export interface ForgotPasswordDirectRequest {
  emailOrUsername: string;
  fullname: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ForgotPasswordDirectResponse {
  message: string;
}

type BackendAuthPayload = {
  id?: string | number;
  token: string;
  email: string;
  name: string;
  role: string;
  message?: string;
};

type TokenPayload = {
  id?: string | number;
  name?: string;
  email?: string;
  role?: string;
  exp?: number;
  iat?: number;
};

export interface AuthResponse {
  token: string;
  user: User;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/api/auth';
  private readonly tokenStorageKey = 'auth_token';
  private readonly userStorageKey = 'current_user';

  readonly isAuthenticated = signal(false);
  readonly currentUser = signal<User | null>(null);

  constructor() {
    const token = this.getToken();
    const user = this.getCurrentUser();
    if (token && user) {
      this.currentUser.set(user);
      this.isAuthenticated.set(true);
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    const loginData: LoginRequest = { email, password };
    return this.http.post<BackendAuthPayload>(`${this.apiUrl}/login`, loginData).pipe(
      map((response) => this.normalizeAuthResponse(response)),
      tap((response) => {
        this.setCurrentUser(response.user, response.token);
      }),
      catchError(this.handleError)
    );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<BackendAuthPayload>(`${this.apiUrl}/register`, userData).pipe(
      map((response) => this.normalizeAuthResponse(response)),
      tap((response) => {
        this.setCurrentUser(response.user, response.token);
      }),
      catchError(this.handleError)
    );
  }

  requestPasswordReset(email: string): Observable<ForgotPasswordResponse> {
    return this.http.post<ForgotPasswordResponse>(`${this.apiUrl}/forgot-password`, { email }).pipe(
      catchError(this.handleError)
    );
  }

  forgotPasswordDirect(payload: ForgotPasswordDirectRequest): Observable<ForgotPasswordDirectResponse> {
    return this.http.post<ForgotPasswordDirectResponse>(`${this.apiUrl}/forgot-password-direct`, payload).pipe(
      catchError(this.handleError)
    );
  }

  resetPassword(token: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/reset-password`, { token, newPassword }).pipe(
      catchError(this.handleError)
    );
  }

  logout(): void {
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    localStorage.removeItem(this.tokenStorageKey);
    localStorage.removeItem(this.userStorageKey);
    sessionStorage.removeItem(this.tokenStorageKey);
    sessionStorage.removeItem(this.userStorageKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenStorageKey) ?? sessionStorage.getItem(this.tokenStorageKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user ? user.role || null : null;
  }

  getCurrentUser(): User | null {
    const userJson = localStorage.getItem(this.userStorageKey) ?? sessionStorage.getItem(this.userStorageKey);

    if (!userJson) {
      return null;
    }

    try {
      return JSON.parse(userJson) as User;
    } catch {
      this.logout();
      return null;
    }
  }

  private normalizeAuthResponse(response: BackendAuthPayload): AuthResponse {
    const tokenPayload = this.decodeToken(response.token);

    return {
      token: response.token,
      user: {
        id: response.id ?? tokenPayload?.id,
        email: response.email,
        name: response.name,
        role: response.role,
      },
      message: response.message,
    };
  }

  private decodeToken(token: string): TokenPayload | null {
    try {
      const payload = token.split('.')[1];

      if (!payload) {
        return null;
      }

      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const padding = base64.length % 4;
      const normalized = padding ? `${base64}${'='.repeat(4 - padding)}` : base64;
      return JSON.parse(atob(normalized)) as TokenPayload;
    } catch {
      return null;
    }
  }

  private setCurrentUser(user: User, token: string): void {
    this.currentUser.set(user);
    this.isAuthenticated.set(true);
    localStorage.setItem(this.tokenStorageKey, token);
    localStorage.setItem(this.userStorageKey, JSON.stringify(user));
    sessionStorage.setItem(this.tokenStorageKey, token);
    sessionStorage.setItem(this.userStorageKey, JSON.stringify(user));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = error.error?.message || `Error Code: ${error.status}\nMessage: ${error.message}`;
    }

    return throwError(() => new Error(errorMessage));
  }
}
