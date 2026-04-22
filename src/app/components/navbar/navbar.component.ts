import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="navbar">
      <div class="navbar-container">
        <a class="navbar-brand" (click)="navigateHome()">
          <svg class="navbar-logo" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M5 12l-2 0l9 -9l9 9l-2 0" />
            <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7" />
            <path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6" />
          </svg>
          <span class="navbar-title">ICT Feedback & Complaint Management System</span>
        </a>

        <div class="navbar-buttons">
          @if (!auth.isAuthenticated()) {
            <button class="btn btn-outline" (click)="navigateTo('/login')">Login</button>
            <button class="btn btn-solid" (click)="navigateTo('/register')">Register</button>
          } @else {
            <span class="user-greeting">Welcome, {{ getFirstWord(auth.currentUser()?.name) }}</span>
            <button class="btn btn-solid" (click)="logout()">Logout</button>
          }
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background: linear-gradient(90deg, #8B0000 0%, #C41E3A 100%);
      padding: 1rem 2rem;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }

    .navbar-container {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: white;
      font-weight: 600;
      font-size: 1.1rem;
      text-decoration: none;
    }

    .navbar-logo {
      width: 2.5rem;
      height: 2.5rem;
      display: block;
      border-radius: 0.35rem;
      transition: transform 0.3s ease;
    }

    .navbar-logo:hover {
      transform: scale(1.04);
    }

    .navbar-title {
      line-height: 1.1;
    }

    .navbar-buttons {
      display: flex;
      gap: 1rem;
      align-items: center;
      flex-wrap: wrap;
    }

    .btn {
      padding: 0.6rem 1.5rem;
      border: none;
      border-radius: 0.5rem;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-outline {
      background: transparent;
      border: 2px solid white;
      color: white;
      
      &:hover {
        background: rgba(255, 255, 255, 0.1);
        transform: translateY(-2px);
      }
    }

    .btn-solid {
      background: white;
      color: #8B0000;
      
      &:hover {
        background: #f0f0f0;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      }
    }

    .user-greeting {
      color: white;
      font-weight: 500;
    }

    @media (max-width: 600px) {
      .navbar {
        padding: 1rem;
      }

      .navbar-container {
        flex-direction: column;
        gap: 0.75rem;
      }

      .navbar-brand {
        width: 100%;
        justify-content: center;
      }

      .navbar-logo {
        width: 2rem;
        height: 2rem;
      }

      .navbar-buttons {
        width: 100%;
        justify-content: center;
      }

      .btn {
        padding: 0.5rem 1rem;
        font-size: 0.9rem;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent {
  private router = inject(Router);

  constructor(readonly auth: AuthService) {}

  navigateHome(): void {
    const currentUser = this.auth.getCurrentUser();

    if (!currentUser) {
      void this.router.navigate(['/']);
      return;
    }

    const targetRoute = currentUser.role === 'admin' ? '/admin-dashboard' : '/dashboard';
    void this.router.navigate([targetRoute]);
  }

  navigateTo(route: string): void {
    void this.router.navigate([route]);
  }

  getFirstWord(name?: string): string {
    const trimmed = (name ?? '').trim();
    if (!trimmed) {
      return '';
    }

    return trimmed.split(/\s+/)[0];
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }
}
