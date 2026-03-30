import { Component, OnInit, inject } from '@angular/core';
import { PersonnelService } from '../../../core/services/personnel.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { Tache, StatutTache } from '../../../core/models/personnel.model';

export interface Task {
    id: string;
    icon: string;
    title: string;
    room: string;
    type: string;
    assignedBy: string;
    assignedAt: string;
    description: string;
    location: string;
    deadline: string;
    status: 'cours' | 'attente' | 'done';
    badge: string;
    badgeClass: string;
    opacity?: boolean;
    backendTache?: Tache;
}

@Component({ selector: 'app-personnel-tasks', templateUrl: './personnel-tasks.component.html', styleUrls: ['./personnel-tasks.component.css'] })
export class PersonnelTasksComponent implements OnInit {
    filter: string = 'all';
    modalOpen = false;
    selectedTask: Task | null = null;
    tasks: Task[] = [];
    isLoading = true;
    currentEmployeeId: number | null = null;

    stats = [
        { value: '0', color: 'text-yellow-500', label: 'En attente' },
        { value: '0', color: 'text-blue-500', label: 'En cours' },
        { value: '0', color: 'text-green-500', label: 'Terminées' },
        { value: '0', color: 'text-navy', label: 'Total' }
    ];

    private personnelService = inject(PersonnelService);
    private authService = inject(AuthService);
    private userService = inject(UserService);

    ngOnInit(): void {
        this.fetchCurrentEmployeeId();
    }

    fetchCurrentEmployeeId(): void {
        // Try to get the current user's profile to retrieve their ID
        const currentUser = this.authService.getUserFromToken();
        if (!currentUser?.sub) {
            this.isLoading = false;
            return;
        }

        // Fetch current user profile to get their ID
        this.userService.getMe().subscribe({
            next: (user) => {
                this.currentEmployeeId = user.idUtilisateur;
                this.fetchEmployeeTasks();
            },
            error: (err) => {
                console.error('Error fetching current user:', err);
                // Fallback: try to get all tasks and filter client-side
                this.fetchAllTasksAndFilter();
            }
        });
    }

    fetchEmployeeTasks(): void {
        if (!this.currentEmployeeId) {
            this.fetchAllTasksAndFilter();
            return;
        }

        this.isLoading = true;
        this.personnelService.getTasksByEmployee(this.currentEmployeeId).subscribe({
            next: (backendTaches) => {
                this.tasks = backendTaches.map(tache => this.mapBackendTacheToTask(tache));
                this.updateStats();
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Erreur lors de la récupération des tâches:', err);
                this.isLoading = false;
            }
        });
    }

    fetchAllTasksAndFilter(): void {
        // Fallback method - get all tasks and we'll filter by what's available
        this.isLoading = true;
        this.personnelService.getTasks().subscribe({
            next: (backendTaches) => {
                this.tasks = backendTaches.map(tache => this.mapBackendTacheToTask(tache));
                this.updateStats();
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Erreur lors de la récupération des tâches:', err);
                this.isLoading = false;
            }
        });
    }

    mapBackendTacheToTask(tache: Tache): Task {
        const statusMap: { [key in StatutTache]: 'attente' | 'cours' | 'done' } = {
            [StatutTache.A_FAIRE]: 'attente',
            [StatutTache.EN_COURS]: 'cours',
            [StatutTache.TERMINE]: 'done'
        };

        const status = statusMap[tache.statut || StatutTache.A_FAIRE];
        const badgeMap: { [key: string]: { badge: string; badgeClass: string } } = {
            'attente': { badge: 'En attente', badgeClass: 'badge-yellow' },
            'cours': { badge: 'En cours', badgeClass: 'badge-blue' },
            'done': { badge: 'Terminé ✓', badgeClass: 'badge-green' }
        };

        const badges = badgeMap[status] || { badge: 'En attente', badgeClass: 'badge-yellow' };

        return {
            id: `t${tache.idTache}`,
            icon: this.getIconForShift(tache.typeShift),
            title: tache.titre,
            room: '',
            type: tache.typeShift || 'Standard',
            assignedBy: 'Admin',
            assignedAt: new Date(tache.dateDebut).toLocaleDateString('fr-FR'),
            description: tache.description,
            location: 'Lieu assigné',
            deadline: new Date(tache.dateFin).toLocaleDateString('fr-FR'),
            status: status,
            badge: badges.badge,
            badgeClass: badges.badgeClass,
            opacity: status === 'done',
            backendTache: tache
        };
    }

    getIconForShift(shift?: string): string {
        if (!shift) return '☀️';
        switch (shift.toUpperCase()) {
            case 'MATIN': return '☀️';
            case 'SOIR': return '🌤️';
            case 'NUIT': return '🌙';
            default: return '☀️';
        }
    }

    getDisplayDate(): string {
        if (this.tasks[0]?.backendTache?.dateDebut) {
            return this.tasks[0].backendTache.dateDebut;
        }
        return new Date().toISOString();
    }

    updateStats(): void {
        const stats = {
            attente: this.tasks.filter(t => t.status === 'attente').length,
            cours: this.tasks.filter(t => t.status === 'cours').length,
            done: this.tasks.filter(t => t.status === 'done').length
        };
        
        this.stats[0] = { ...this.stats[0], value: stats.attente.toString() };
        this.stats[1] = { ...this.stats[1], value: stats.cours.toString() };
        this.stats[2] = { ...this.stats[2], value: stats.done.toString() };
        this.stats[3] = { ...this.stats[3], value: (stats.attente + stats.cours + stats.done).toString() };
    }

    get filteredTasks(): Task[] {
        // Show all tasks (attente, cours, and done)
        if (this.filter === 'all') return this.tasks;
        return this.tasks.filter(t => t.status === this.filter);
    }

    setFilter(f: string) { this.filter = f; }

    openModal(task: Task) {
        this.selectedTask = task;
        this.modalOpen = true;
    }

    onStatusSaved(payload: { task: Task; newStatus: StatutTache }) {
        const t = this.tasks.find(x => x.id === payload.task.id);
        if (!t || !t.backendTache?.idTache) return;

        console.log('Updating task status:', t.backendTache.idTache, payload.newStatus);

        this.personnelService.updateTaskStatus(t.backendTache.idTache, payload.newStatus).subscribe({
            next: (updatedTache) => {
                const statusMap: { [key in StatutTache]: 'attente' | 'cours' | 'done' } = {
                    [StatutTache.A_FAIRE]: 'attente',
                    [StatutTache.EN_COURS]: 'cours',
                    [StatutTache.TERMINE]: 'done'
                };

                t.status = statusMap[payload.newStatus];
                t.backendTache = updatedTache;

                const badgeMap: { [key in StatutTache]: { badge: string; badgeClass: string } } = {
                    [StatutTache.A_FAIRE]: { badge: 'En attente', badgeClass: 'badge-yellow' },
                    [StatutTache.EN_COURS]: { badge: 'En cours', badgeClass: 'badge-blue' },
                    [StatutTache.TERMINE]: { badge: 'Terminé ✓', badgeClass: 'badge-green' }
                };

                const badges = badgeMap[payload.newStatus];
                t.badge = badges.badge;
                t.badgeClass = badges.badgeClass;
                if (payload.newStatus === StatutTache.TERMINE) {
                    t.opacity = true;
                }

                this.updateStats();
                this.modalOpen = false;
            },
            error: (err) => {
                console.error('Erreur lors de la mise à jour du statut:', err);
                alert('Erreur lors de la mise à jour du statut: ' + (err.message || 'Erreur inconnue'));
            }
        });
    }

    onModalClosed() { this.modalOpen = false; }
}
