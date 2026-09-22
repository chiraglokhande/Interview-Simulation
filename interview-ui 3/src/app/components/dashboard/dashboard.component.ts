// dashboard.component.ts

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  constructor(private router: Router) {}

  goToRoles() {
    this.router.navigate(['/roles']);
  }

  goToHistory() {
    this.router.navigate(['/history']);
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/']);
  }
}