import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Task } from '../personnel-tasks/personnel-tasks.component';
import { StatutTache } from '../../../core/models/personnel.model';

@Component({ selector: 'app-personnel-task-modal', templateUrl: './personnel-task-modal.component.html', styleUrls: ['./personnel-task-modal.component.css'] })
export class PersonnelTaskModalComponent {
    @Input() task!: Task;
    @Output() saved = new EventEmitter<{ task: Task; newStatus: StatutTache }>();
    @Output() closed = new EventEmitter<void>();

    selectedStatus: string = '';
    comment: string = '';
    showToast = false;

    save() {
        if (!this.selectedStatus) { alert('Veuillez sélectionner un statut.'); return; }
        
        // Map frontend status to backend StatutTache enum
        const statusMap: { [key: string]: StatutTache } = {
            'attente': StatutTache.A_FAIRE,
            'cours': StatutTache.EN_COURS,
            'termine': StatutTache.TERMINE
        };

        const newStatus = statusMap[this.selectedStatus];
        this.saved.emit({ task: this.task, newStatus });
        this.showToast = true;
        setTimeout(() => { this.showToast = false; this.closed.emit(); }, 1500);
    }

    close() { this.closed.emit(); }
}
