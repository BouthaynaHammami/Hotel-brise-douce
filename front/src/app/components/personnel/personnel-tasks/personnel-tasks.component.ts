import { Component } from '@angular/core';

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
    status: 'urgent' | 'cours' | 'attente' | 'done';
    badge: string;
    badgeClass: string;
    opacity?: boolean;
}

@Component({ selector: 'app-personnel-tasks', templateUrl: './personnel-tasks.component.html', styleUrls: ['./personnel-tasks.component.css'] })
export class PersonnelTasksComponent {
    filter: string = 'all';
    modalOpen = false;
    selectedTask: Task | null = null;

    stats = [
        { value: '3', color: 'text-yellow-500', label: 'En attente' },
        { value: '1', color: 'text-blue-500', label: 'En cours' },
        { value: '5', color: 'text-green-500', label: 'Terminées aujourd\'hui' },
        { value: '9', color: 'text-navy', label: 'Total ce mois' }
    ];

    tasks: Task[] = [
        {
            id: 't1', icon: '🔧', title: 'Maintenance — Chambre 202', room: '202', type: 'Maintenance',
            assignedBy: 'Admin', assignedAt: '28/03 08:30',
            description: 'Fuite d\'eau signalée dans la salle de bain. Vérifier la robinetterie et joints.',
            location: 'Chambre 202, 2e étage', deadline: 'Avant 11h00',
            status: 'urgent', badge: 'En attente', badgeClass: 'badge-yellow'
        },
        {
            id: 't2', icon: '🧹', title: 'Nettoyage — Chambre 305', room: '305', type: 'Nettoyage',
            assignedBy: 'Admin', assignedAt: '28/03 09:00',
            description: 'Nettoyage complet suite au départ client. Changer literie et réapprovisionner minibar.',
            location: 'Chambre 305, 3e étage', deadline: 'Avant 12h00',
            status: 'cours', badge: 'En cours', badgeClass: 'badge-blue'
        },
        {
            id: 't3', icon: '🧹', title: 'Nettoyage — Chambre 412', room: '412', type: 'Nettoyage',
            assignedBy: 'Admin', assignedAt: '28/03 09:15',
            description: 'Nettoyage standard avant arrivée client à 14h. Vérifier la terrasse.',
            location: 'Chambre 412, 4e étage', deadline: 'Avant 13h30',
            status: 'attente', badge: 'En attente', badgeClass: 'badge-yellow'
        },
        {
            id: 't4', icon: '✅', title: 'Nettoyage — Chambre 103', room: '103', type: 'Nettoyage',
            assignedBy: 'Admin', assignedAt: '28/03 07:00',
            description: 'Nettoyage complet effectué. Literie changée, minibar réapprovisionné.',
            location: 'Chambre 103, 1er étage', deadline: '08:45',
            status: 'done', badge: 'Terminé ✓', badgeClass: 'badge-green', opacity: true
        }
    ];

    get filteredTasks(): Task[] {
        if (this.filter === 'all') return this.tasks;
        return this.tasks.filter(t => t.status === this.filter);
    }

    setFilter(f: string) { this.filter = f; }

    openModal(task: Task) {
        this.selectedTask = task;
        this.modalOpen = true;
    }

    onStatusSaved(payload: { task: Task; status: string }) {
        const t = this.tasks.find(x => x.id === payload.task.id);
        if (!t) return;
        if (payload.status === 'attente') { t.badge = 'En attente'; t.badgeClass = 'badge-yellow'; }
        if (payload.status === 'cours') { t.badge = 'En cours'; t.badgeClass = 'badge-blue'; }
        if (payload.status === 'termine') { t.badge = 'Terminé ✓'; t.badgeClass = 'badge-green'; }
        this.modalOpen = false;
    }

    onModalClosed() { this.modalOpen = false; }
}
