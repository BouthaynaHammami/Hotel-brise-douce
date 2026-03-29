import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Task } from '../personnel-tasks/personnel-tasks.component';

@Component({ selector: 'app-personnel-task-modal', templateUrl: './personnel-task-modal.component.html', styleUrls: ['./personnel-task-modal.component.css'] })
export class PersonnelTaskModalComponent {
    @Input() task!: Task;
    @Output() saved = new EventEmitter<{ task: Task; status: string }>();
    @Output() closed = new EventEmitter<void>();

    selectedStatus: string = '';
    comment: string = '';
    showToast = false;

    save() {
        if (!this.selectedStatus) { alert('Veuillez sélectionner un statut.'); return; }
        this.saved.emit({ task: this.task, status: this.selectedStatus });
        this.showToast = true;
        setTimeout(() => { this.showToast = false; this.closed.emit(); }, 1500);
    }

    close() { this.closed.emit(); }
}
