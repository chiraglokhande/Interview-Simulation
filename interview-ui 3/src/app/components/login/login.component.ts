import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  email = '';
  password = '';

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  login() {

    const data = {
      email: this.email,
      password: this.password
    };

    this.auth.login(data).subscribe({

      next: (res: any) => {
        console.log(res);

        /* SAVE TOKEN */
        this.auth.saveToken(res.token);

        /* SAVE USER DATA */
        localStorage.setItem(
          'user',
          JSON.stringify({
            id: res.id,
            name: res.name,
            email: res.email
          })
        );

        alert('Login Successful ✅');

        this.router.navigate(['/dashboard']);
      },

      error: (err) => {
        alert('Invalid credentials ❌');
        console.error(err);
      }

    });
  }

}