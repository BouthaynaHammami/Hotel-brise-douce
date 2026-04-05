import { Component, OnInit, inject } from '@angular/core';
import { UserService } from '../../../core/services/user.service';
import { PersonnelService } from '../../../core/services/personnel.service';
import { UtilisateurResponse } from '../../../core/models/user.model';

@Component({ selector: 'app-personnel-profile', templateUrl: './personnel-profile.component.html', styleUrls: ['./personnel-profile.component.css'] })
export class PersonnelProfileComponent implements OnInit {
    private userService = inject(UserService);
    private personnelService = inject(PersonnelService);

    isLoading = true;
    user: UtilisateurResponse | null = null;
    
    nom = '';
    prenom = '';
    email = '';
    telephone = '';
    matricule = '';
    poste = '';
    dateEmbauche = '';
    
    newPassword = '';
    confirmPassword = '';

    stats = [
        { value: '0', color: '', label: 'Tâches réalisées au total', style: 'color:var(--navy)' },
        { value: '0%', color: 'text-green-500', label: 'Taux de satisfaction', style: '' },
        { value: '0★', color: '', label: 'Note moyenne', style: 'color:var(--gold)' }
    ];

    ngOnInit(): void {
        this.loadUserProfile();
    }

    loadUserProfile(): void {
        this.isLoading = true;
        this.userService.getMe().subscribe({
            next: (user) => {
                this.user = user;
                this.nom = user.nom;
                this.prenom = user.prenom;
                this.email = user.email;
                this.telephone = user.telephone;
                this.matricule = user.matricule || '';
                this.poste = user.poste || '';
                this.dateEmbauche = user.dateEmbauche || '';
                
                // Load task count for stats
                this.loadTaskStats();
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Erreur lors du chargement du profil:', err);
                this.isLoading = false;
            }
        });
    }

    loadTaskStats(): void {
        if (!this.user) return;
        
        this.personnelService.getTasks().subscribe({
            next: (tasks) => {
                if (Array.isArray(tasks)) {
                    const completedTasks = tasks.filter(t => t.statut === 'TERMINE').length;
                    this.stats[0].value = completedTasks.toString();
                    // Calculate completion percentage
                    const completionPercentage = tasks.length > 0 
                        ? Math.round((completedTasks / tasks.length) * 100) 
                        : 0;
                    this.stats[1].value = completionPercentage + '%';
                    // Mock rating for now (would come from feedback system)
                    this.stats[2].value = '4.8★';
                }
            },
            error: (err) => {
                console.error('Erreur lors du chargement des statistiques:', err);
            }
        });
    }

    save(): void {
        if (!this.user) return;
        
        const updatedProfile = {
            nom: this.nom,
            prenom: this.prenom,
            telephone: this.telephone
        };
        
        this.userService.updateMyProfile(updatedProfile).subscribe({
            next: () => {
                alert('Profil mis à jour avec succès!');
                this.loadUserProfile();
            },
            error: (err) => {
                console.error('Erreur lors de la mise à jour:', err);
                alert('Erreur lors de la mise à jour du profil');
            }
        });
    }
}
