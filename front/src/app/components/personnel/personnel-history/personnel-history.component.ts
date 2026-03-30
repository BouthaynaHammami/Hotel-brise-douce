import { Component, OnInit, inject } from '@angular/core';
import { NettoyageMaintenanceService } from '../../../core/services/nettoyage-maintenance.service';
import { PersonnelService } from '../../../core/services/personnel.service';
import { UserService } from '../../../core/services/user.service';
import { NettoyageMaintenance } from '../../../core/models/nettoyage-maintenance.model';
import { Tache, StatutTache } from '../../../core/models/personnel.model';
import { forkJoin } from 'rxjs';

interface HistoryEntry {
    room: string;
    type: string;
    date: string;
    duration: string;
    status: string;
}

interface TaskHistoryEntry {
    titre: string;
    description: string;
    dateDebut: string;
    dateFin: string;
    status: string;
}

interface HistoryEntryWithTime extends HistoryEntry {
    dateTime: number;
}

interface TaskHistoryEntryWithTime extends TaskHistoryEntry {
    dateTime: number;
}

@Component({ selector: 'app-personnel-history', templateUrl: './personnel-history.component.html', styleUrls: ['./personnel-history.component.css'] })
export class PersonnelHistoryComponent implements OnInit {
    private nettoyageService = inject(NettoyageMaintenanceService);
    private personnelService = inject(PersonnelService);
    private userService = inject(UserService);

    isLoading = true;
    entries: HistoryEntry[] = [];
    completedTasks: TaskHistoryEntry[] = [];
    currentEmployeeId: number | null = null;

    ngOnInit(): void {
        this.fetchCurrentUser();
    }

    fetchCurrentUser(): void {
        this.userService.getMe().subscribe({
            next: (user) => {
                this.currentEmployeeId = user.idUtilisateur;
                this.loadHistory();
            },
            error: (err) => {
                console.error('Erreur lors du chargement de l\'utilisateur:', err);
                this.isLoading = false;
            }
        });
    }

    loadHistory(): void {
        if (!this.currentEmployeeId) {
            this.isLoading = false;
            return;
        }

        this.isLoading = true;
        
        // Fetch both interventions and completed tasks in parallel
        forkJoin({
            interventions: this.nettoyageService.getAll(),
            tasks: this.personnelService.getTasksByEmployee(this.currentEmployeeId)
        }).subscribe({
            next: (data) => {
                const entriesWithTime: HistoryEntryWithTime[] = [];

                // Add interventions to history
                if (Array.isArray(data.interventions)) {
                    const interventionEntries = data.interventions
                        .filter(i => i.personnelId === this.currentEmployeeId)
                        .map(i => ({
                            room: i.numeroChambre || i.chambreId?.toString() || '-',
                            type: i.type === 'NETTOYAGE' ? 'Nettoyage' : 'Maintenance',
                            date: i.dateIntervention ? this.formatDate(i.dateIntervention) : '-',
                            duration: i.dateIntervention ? this.calculateDuration(i.dateIntervention) : '-',
                            status: i.status || 'EN_ATTENTE',
                            dateTime: i.dateIntervention ? new Date(i.dateIntervention).getTime() : 0
                        }));
                    entriesWithTime.push(...interventionEntries);
                }

                // Add completed tasks to history - need to fetch all tasks and filter by terminated status
                this.personnelService.getTasks().subscribe({
                    next: (allTasks) => {
                        if (Array.isArray(allTasks)) {
                            this.completedTasks = allTasks
                                .filter(t => {
                                    // Filter by TERMINE status and by current employee
                                    const isTermine = String(t.statut).toUpperCase() === 'TERMINE' 
                                                   || String(t.statut) === String(StatutTache.TERMINE)
                                                   || t.statut === StatutTache.TERMINE;
                                    const isCurrentEmployee = t.idEmploye === this.currentEmployeeId;
                                    return isTermine && isCurrentEmployee;
                                })
                                .map(t => ({
                                    titre: t.titre || 'Sans titre',
                                    description: t.description || '-',
                                    dateDebut: t.dateDebut ? this.formatDate(t.dateDebut) : '-',
                                    dateFin: t.dateFin ? this.formatDate(t.dateFin) : '-',
                                    status: 'TERMINE',
                                    dateTime: t.dateFin ? new Date(t.dateFin).getTime() : (t.dateDebut ? new Date(t.dateDebut).getTime() : 0)
                                } as TaskHistoryEntryWithTime))
                                .sort((a, b) => b.dateTime - a.dateTime)
                                .map(({ dateTime, ...task }) => task as TaskHistoryEntry);
                        }
                        
                        // Sort interventions by date (most recent first) and remove dateTime field
                        this.entries = entriesWithTime
                            .sort((a, b) => b.dateTime - a.dateTime)
                            .map(({ dateTime, ...entry }) => entry as HistoryEntry);

                        this.isLoading = false;
                    },
                    error: (err) => {
                        console.error('Erreur lors du chargement des tâches terminées:', err);
                        this.completedTasks = [];
                        // Still sort what we have
                        this.entries = entriesWithTime
                            .sort((a, b) => b.dateTime - a.dateTime)
                            .map(({ dateTime, ...entry }) => entry as HistoryEntry);
                        this.isLoading = false;
                    }
                });
            },
            error: (err) => {
                console.error('Erreur lors du chargement de l\'historique:', err);
                this.entries = [];
                this.completedTasks = [];
                this.isLoading = false;
            }
        });
    }

    private formatDate(dateString: string): string {
        try {
            const date = new Date(dateString);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${day}/${month}/${year} ${hours}:${minutes}`;
        } catch {
            return dateString;
        }
    }

    private calculateDuration(dateString: string): string {
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffMins = Math.round(diffMs / 60000);
            
            if (diffMins < 60) return diffMins + ' min';
            const hours = Math.floor(diffMins / 60);
            const mins = diffMins % 60;
            return hours + 'h ' + mins + ' min';
        } catch {
            return '-';
        }
    }

    getStatusBadgeClass(status: string): string {
        switch (status) {
            case 'EN_ATTENTE':
                return 'badge-yellow';
            case 'EN_COURS':
                return 'badge-blue';
            case 'TERMINE':
                return 'badge-green';
            default:
                return 'badge-gray';
        }
    }

    getStatusLabel(status: string): string {
        switch (status) {
            case 'EN_ATTENTE':
                return 'En attente';
            case 'EN_COURS':
                return 'En cours';
            case 'TERMINE':
                return 'Terminé';
            default:
                return status;
        }
    }
}
