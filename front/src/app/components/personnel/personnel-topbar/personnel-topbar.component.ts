import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { UtilisateurResponse, Notification } from '../../../core/models/user.model';

@Component({ selector: 'app-personnel-topbar', templateUrl: './personnel-topbar.component.html', styleUrls: ['./personnel-topbar.component.css'] })
export class PersonnelTopbarComponent implements OnInit {
    private userService = inject(UserService);
    private authService = inject(AuthService);

    public notificationService = inject(NotificationService);
    currentUser: UtilisateurResponse | null = null;
    isProfileModalVisible = false;
    showNotifications = false;
    selectedNotification: Notification | null = null;
    isNotificationModalVisible = false;

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

    toggleNotifications() {
        this.showNotifications = !this.showNotifications;
    }

    markRead(notif: Notification) {
        if (!notif.lue) {
            this.notificationService.markAsRead(notif.id).subscribe();
        }
        // Ouvrir le popup de détails
        this.selectedNotification = notif;
        this.isNotificationModalVisible = true;
        this.showNotifications = false; // Fermer la liste déroulante
    }

    closeNotification() {
        this.isNotificationModalVisible = false;
        this.selectedNotification = null;
    }

    logout() { 
        this.authService.logout();
    }
}
