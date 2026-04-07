import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { UtilisateurResponse } from '../../../core/models/user.model';

@Component({ selector: 'app-personnel-topbar', templateUrl: './personnel-topbar.component.html', styleUrls: ['./personnel-topbar.component.css'] })
export class PersonnelTopbarComponent implements OnInit {
    private userService = inject(UserService);
    private authService = inject(AuthService);

    currentUser: UtilisateurResponse | null = null;
    isProfileModalVisible = false;

    constructor(private router: Router) { }

    ngOnInit() {
        this.userService.getMe().subscribe(user => {
            this.currentUser = user;
        });
    }

    getInitials(): string {
        if (!this.currentUser) return '..';
        return ((this.currentUser.prenom[0] || '') + (this.currentUser.nom[0] || '')).toUpperCase();
    }

    openProfile() {
        this.isProfileModalVisible = true;
    }

    closeProfile() {
        this.isProfileModalVisible = false;
    }

    onProfileUpdated(updatedUser: UtilisateurResponse) {
        this.currentUser = updatedUser;
    }

    logout() { 
        this.authService.logout();
    }
}
