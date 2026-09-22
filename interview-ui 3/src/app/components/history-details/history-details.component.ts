import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HistoryService } from '../../services/history.service';

@Component({
  selector: 'app-history-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history-details.component.html',
  styleUrls: ['./history-details.component.css']
})
export class HistoryDetailsComponent implements OnInit {

  role = '';
  data: any[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: HistoryService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    this.role = decodeURIComponent(
      this.route.snapshot.paramMap.get('role') || ''
    );

    const userId =
      Number(localStorage.getItem('userId'));

    this.service
      .getHistory(this.role)
      .subscribe({

        next: (res:any) => {

          console.log("DETAILS =", res);

          this.data = res || [];
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

  goBack() {
    this.router.navigate(['/history']);
  }
}