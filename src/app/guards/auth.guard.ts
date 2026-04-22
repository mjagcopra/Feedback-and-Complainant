import { Injectable, inject } from '@angular/core';
import {
  CanActivateFn,
  CanActivateChildFn,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * ⚠️ SECURITY: Authentication guard that protects routes from unauthenticated access
 * 
 * This guard ensures that:
 * 1. User is logged in before accessing protected routes
 * 2. User session is valid
 * 3. Unauthenticated users are redirected to /login
 */
@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    return this.checkAuth(state.url);
  }

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    return this.checkAuth(state.url);
  }

  private checkAuth(url: string): boolean {
    const token = this.authService.getToken();
    const currentUser = this.authService.getCurrentUser();
    const isAuthenticated = !!token && !!currentUser;

    if (isAuthenticated) {
      return true;
    }

    // Store the URL to redirect to after login
    console.warn(`Access denied to ${url}. Redirecting to login.`);
    this.router.navigate(['/login'], { queryParams: { returnUrl: url } });
    return false;
  }
}

/**
 * Functional guard for route protection (Angular 16+)
 * Use this in route definitions instead of the class guard
 * 
 * Example:
 * {
 *   path: 'dashboard',
 *   component: Dashboard,
 *   canActivate: [authGuard]
 * }
 */
export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): boolean => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();
  const currentUser = authService.getCurrentUser();
  const isAuthenticated = !!token && !!currentUser;

  if (isAuthenticated) {
    return true;
  }

  // Redirect to login with return URL
  console.warn(`Access denied to ${state.url}. Redirecting to login.`);
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};

/**
 * Functional child guard for protecting child routes
 */
export const authChildGuard: CanActivateChildFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): boolean => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();
  const currentUser = authService.getCurrentUser();
  const isAuthenticated = !!token && !!currentUser;

  if (isAuthenticated) {
    return true;
  }

  console.warn(`Access denied to child route ${state.url}. Redirecting to login.`);
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
