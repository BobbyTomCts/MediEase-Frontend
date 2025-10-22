import { Routes } from '@angular/router';
import { Login } from './login/login.component';
import { Register } from './register/register.component';
import { UserHome } from './user-home/user-home.component';
import { AdminDashboard } from './admin-dashboard/admin-dashboard.component';
import { InsuranceSelection } from './insurance-selection/insurance-selection.component';
import { DependantsManagement } from './dependants-management/dependants-management.component';
import { NetworkHospitals } from './network-hospitals/network-hospitals.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'user-dashboard', component: UserHome },
  { path: 'admin-dashboard', component: AdminDashboard },
  { path: 'insurance-selection', component: InsuranceSelection },
  { path: 'dependants-management', component: DependantsManagement },
  { path: 'network-hospitals', component: NetworkHospitals },
  { path: '**', redirectTo: '/login' }
];
