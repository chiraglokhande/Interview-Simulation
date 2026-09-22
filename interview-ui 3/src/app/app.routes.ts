import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { RoleComponent } from './components/role/role.component';
import { InterviewComponent } from './components/interview/interview.component';
import { HistoryComponent } from './components/history/history.component';
import { HistoryDetailsComponent } from './components/history-details/history-details.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'roles', component: RoleComponent },
  { path: 'interview', component: InterviewComponent },
 { path:'history', component: HistoryComponent },
 { path:'history-details/:role', component: HistoryDetailsComponent },
  // ✅ fallback (VERY IMPORTANT)
  { path: '**', redirectTo: '' }
];