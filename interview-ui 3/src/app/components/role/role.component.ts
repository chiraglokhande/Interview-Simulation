import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InterviewService } from '../../services/interview.service';
import { Location } from '@angular/common';
interface Role {
  id: number;
  name: string;
}

@Component({
  selector: 'app-role',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css']
})
export class RoleComponent implements OnInit {

  roles: Role[] = [];
  search = '';
  loading = false;

  hoveredRole: Role | null = null;

  constructor(
    private interviewService: InterviewService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.loadRoles();
  }

  goBack() {
  this.location.back();
}
  // ================= LOAD ROLES =================
  loadRoles() {
    this.loading = true;

    this.interviewService.getRoles().subscribe({
      next: (res: Role[]) => {
        this.roles = (res || []).filter(r => r?.name);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err:any) => {
        console.error("Error loading roles:", err);
        this.loading = false;
      }
    });
  }

  // ================= ENTER KEY =================
handleEnter() {

  console.log('ENTER PRESSED'); // 🔥 DEBUG

  const roleName = this.search.trim();
  if (!roleName) return;

  // check existing
  const existing = this.roles.find(
    r => r.name.toLowerCase() === roleName.toLowerCase()
  );

  if (existing) {
    console.log('Role exists → starting interview');
    this.startInterview(existing, 'easy');
    return;
  }

  console.log('Creating role:', roleName);

  this.loading = true;

  this.interviewService.createRole({ name: roleName }).subscribe({

    next: (res: any) => {

      console.log('API RESPONSE:', res);

      // 🔥 ALWAYS CREATE SAFE OBJECT
      const newRole: Role = {
        id: res?.id || Date.now(),
        name: roleName
      };

      // update UI
      this.roles = [...this.roles, newRole];

      console.log('Starting interview...');
      this.startInterview(newRole, 'easy');

      this.search = '';
      this.loading = false;
    },

    error: (err:any) => {
      console.error('❌ CREATE ROLE FAILED:', err);
      this.loading = false;
    }

  });
}
  startInterview(role: Role, difficulty: string) {

  if (!role?.name || !difficulty) {
    console.error('Invalid role or difficulty');
    return;
  }

  this.loading = true;

  this.interviewService.startInterview(role.name, difficulty).subscribe({

    next: (res: any) => {

      console.log('Interview started:', res);

      this.loading = false;

      this.router.navigate(['/interview'], {
        queryParams: {
          role: role.name,
          difficulty: difficulty,
          interviewId: res?.id
        }
      });

    },
    error: (err:any) => {
      console.error('Start interview error:', err);
      this.loading = false;
    }

  });
}
  // ================= FILTER =================
  get filteredRoles(): Role[] {
    if (!this.search) return this.roles;

    return this.roles.filter(r =>
      r.name.toLowerCase().includes(this.search.toLowerCase())
    );
  }

  // ================= TRACK =================
  trackById(index: number, role: Role) {
    return role.id;
  }
}