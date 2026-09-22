import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HistoryService } from '../../services/history.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {

  roles: string[] = [];
  loading = true;

  constructor(
    private service: HistoryService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    this.service.getRolesHistory()
      .subscribe({

        next: (res:any) => {

          console.log("Roles =", res);

          this.roles = res || [];
          this.loading = false;

          this.cdr.detectChanges();

        },

        error: (err:any) => {

          console.log(err);
          this.loading = false;

          this.cdr.detectChanges();
        }

      });
  }

  openDetails(role:string) {

    this.router.navigate([
      '/history-details',
      encodeURIComponent(role)
    ]);
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}