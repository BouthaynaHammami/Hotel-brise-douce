import { Component, EventEmitter, Input, Output } from '@angular/core';
import { InterventionResponse, StatusIntervention } from '../../../core/models/nettoyage-maintenance.model';

@Component({ selector: 'app-personnel-task-modal', templateUrl: './personnel-task-modal.component.html', styleUrls: ['./personnel-task-modal.component.css'] })
export class PersonnelTaskModalComponent {
    @Input() task!: InterventionResponse;
    @Output() saved = new EventEmitter<{ task: InterventionResponse; newStatus: StatusIntervention }>();
    @Output() closed = new EventEmitter<void>();

    selectedStatus: StatusIntervention | null = null;
    comment: string = '';
    showToast = false;

    StatusIntervention = StatusIntervention;

    save() {
        if (!this.selectedStatus) { alert('Veuillez sélectionner un statut.'); return; }
        this.saved.emit({ task: this.task, newStatus: this.selectedStatus });
        this.showToast = true;
        setTimeout(() => { this.showToast = false; this.closed.emit(); }, 1500);
    }

    close() { this.closed.emit(); }
}
