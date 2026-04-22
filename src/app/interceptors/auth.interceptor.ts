import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

/**
 * ⚠️ SECURITY: Auth Interceptor
 * 
 * This interceptor:
 * 1. Adds JWT token to all HTTP requests
 * 2. Handles token refresh on 401 Unauthorized
 * 3. Prevents multiple refresh requests
 * 4. Redirects to login on auth failure
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private authService = inject(AuthService);
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Skip token injection for certain endpoints
    if (this.shouldBypassToken(request)) {
      return next.handle(request);
    }

    // Add token to request
    const token = this.authService.getToken();
    if (token) {
      request = this.addToken(request, token);
    }

    return next.handle(request).pipe(
      catchError(error => {
        // Handle 401 Unauthorized (token expired or invalid)
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return this.handle401Error(request, next);
        }

        // Handle other errors
        return throwError(() => error);
      })
    );
  }

  /**
   * Add JWT token to request headers
   */
  private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  /**
   * Handle 401 Unauthorized response
   * Attempt to refresh token or redirect to login
   */
  private handle401Error(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      // TODO: Implement token refresh when backend endpoint is ready
      // return this.authService.refreshToken().pipe(
      //   switchMap((response: any) => {
      //     this.isRefreshing = false;
      //     this.refreshTokenSubject.next(response.token);
      //     return next.handle(this.addToken(request, response.token));
      //   }),
      //   catchError((err) => {
      //     this.isRefreshing = false;
      //     this.authService.logout();
      //     return throwError(() => err);
      //   })
      // );

      // For now, just logout
      this.isRefreshing = false;
      this.authService.logout();
      return throwError(() => new Error('Session expired'));
    } else {
      // Wait for token refresh to complete
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(token => {
          return next.handle(this.addToken(request, token!));
        })
      );
    }
  }

  /**
   * Check if request should bypass token injection
   */
  private shouldBypassToken(request: HttpRequest<any>): boolean {
    const bypassUrls = [
      '/auth/login',
      '/auth/register',
      '/auth/reset-password'
    ];
    return bypassUrls.some(url => request.url.includes(url));
  }
}
