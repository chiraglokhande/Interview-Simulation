import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl:'./register.component.css'
})
export class RegisterComponent {

  name = '';
  email = '';
  password = '';

  constructor(private auth: AuthService, private router: Router) {}

  register() {
    const data = {
      name: this.name,
      email: this.email,
      password: this.password
    };

    this.auth.register(data).subscribe({
      next: () => {
        alert('Registered Successfully ✅');
        this.router.navigate(['/']); // go to login
      },
      error: (err) => {
        alert('Registration Failed ❌');
        console.error(err);
      }
    });
  }
}