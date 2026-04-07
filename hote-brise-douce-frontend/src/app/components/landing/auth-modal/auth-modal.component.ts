import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RoleEnum } from '../../../core/models/user.model';

@Component({
  selector: 'app-auth-modal',
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.css']
})
export class AuthModalComponent {
  visible = false;
  activeTab: 'login' | 'register' = 'login';
  errorMessage = '';

  private authService = inject(AuthService);
  private router = inject(Router);

  // Form Models
  loginData = { username: '', password: '' };
  registerData = { prenom: '', nom: '', email: '', telephone: '', motDePasse: '' };

  open(tab: 'login' | 'register' = 'login') {
    this.activeTab = tab;
    this.visible = true;
    this.errorMessage = '';
  }

  close() { this.visible = false; }

  switchTab(tab: 'login' | 'register') { 
    this.activeTab = tab; 
    this.errorMessage = '';
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as Element).classList.contains('modal-backdrop')) {
      this.close();
    }
  }

  onSubmitLogin() {
    this.errorMessage = '';
    this.authService.login(this.loginData.username, this.loginData.password).subscribe({
      next: () => {
        this.close();
        this.redirectUser();
      },
      error: (err) => {
        this.errorMessage = 'Identifiants incorrects';
        console.error(err);
      }
    });
  }

  onSubmitRegister() {
    this.errorMessage = '';
    this.authService.register(this.registerData).subscribe({
      next: () => {
        // Automatically login after register
        this.authService.login(this.registerData.email, this.registerData.motDePasse).subscribe({
          next: () => {
            this.close();
            this.redirectUser();
          }
        });
      },
      error: (err) => {
        this.errorMessage = err.error?.detail || 'Erreur lors de la création du compte';
        console.error(err);
      }
    });
  }

  private redirectUser() {
    const role = this.authService.getRole();
    if (role === RoleEnum.ADMIN) {
      this.router.navigate(['/admin']);
    } else if (role === RoleEnum.PERSONNEL) {
      this.router.navigate(['/personnel']);
    } else {
      this.router.navigate(['/client']);
    }
  }
}
