import { Component, EventEmitter, Output, OnInit, inject } from '@angular/core';
import { UserService } from '../../../core/services/user.service';
import { UtilisateurResponse } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/auth.service';

export interface NavItem {
    id: string;
    icon: string;
    label: string;
}

@Component({
    selector: 'app-admin-sidebar',
    templateUrl: './admin-sidebar.component.html',
    styleUrls: ['./admin-sidebar.component.css']
})
export class AdminSidebarComponent implements OnInit {
    @Output() sectionChange = new EventEmitter<string>();

    activeSection = 'dashboard';

    navItems: NavItem[] = [
        { id: 'dashboard', icon: '📊', label: 'Tableau de bord' },
        { id: 'clients', icon: '👤', label: 'Clients' },
        { id: 'chambres', icon: '🛏', label: 'Chambres' },
        { id: 'reservations', icon: '📅', label: 'Réservations' },
        { id: 'nettoyage', icon: '🧹', label: 'Nettoyage & Maintenance' },
        { id: 'personnel', icon: '👥', label: 'Personnel' },
        { id: 'reclamations', icon: '📋', label: 'Réclamations' },
        { id: 'utilisateurs', icon: '🔐', label: 'Utilisateurs' }
    ];

    navigate(id: string) {
        this.activeSection = id;
        this.sectionChange.emit(id);
    }

    private userService = inject(UserService);
    currentUser: UtilisateurResponse | null = null;
    isProfileModalVisible = false;

private authService = inject(AuthService);


ngOnInit() {
    if (this.authService.isAuthenticated()) {
        this.userService.getMe().subscribe({
            next: (user) => { this.currentUser = user; },
            error: (err) => { console.error('Could not load profile', err); }
        });
    }
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

    getInitials(): string {
        if (!this.currentUser) return 'AD';
        return ((this.currentUser.prenom[0] || '') + (this.currentUser.nom[0] || '')).toUpperCase();
    }
}
