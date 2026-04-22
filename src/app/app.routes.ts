import { Routes } from '@angular/router';
import { HomepageComponent } from './components/homepage/homepage.component';
import { ComplaintFormComponent } from './components/complaint-form/complaint-form.component';
import { LoginComponent } from './components/auth/login.component';
import { RegisterComponent } from './components/auth/register.component';
import { ForgotPassword } from './components/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/auth/reset-password/reset-password.component';
import { Dashboard } from './Admin/dashboard.component';
import { AdminDashboardComponent } from './Admin/admin-dashboard.component';
import { ComplaintListComponent } from './components/complaint-list/complaint-list.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: HomepageComponent
  },
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard]
  },
  {
    path: 'complaints',
    component: ComplaintListComponent,
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [authGuard]
  },
  {
    path: 'admin-dashboard',
    redirectTo: 'admin'
  },
  {
    path: 'complaint-form',
    component: ComplaintFormComponent,
    canActivate: [authGuard]
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'forgot-password',
    component: ForgotPassword
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
