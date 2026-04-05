import { Component, OnInit, inject } from '@angular/core';
import { NettoyageMaintenanceService } from '../../../core/services/nettoyage-maintenance.service';
import { AuthService } from '../../../core/services/auth.service';
import { NettoyageMaintenance, StatusIntervention, TypeIntervention, UtilisateurDTO } from '../../../core/models/nettoyage-maintenance.model';

@Component({
  selector: 'app-admin-cleaning',
  templateUrl: './admin-cleaning.component.html',
  styleUrls: ['./admin-cleaning.component.css']
})
export class AdminCleaningComponent implements OnInit {
  showModal = false;
  tasks: NettoyageMaintenance[] = [];
  personnels: UtilisateurDTO[] = [];
  
  // For the modal form
  newTask: Partial<NettoyageMaintenance> = {
    type: TypeIntervention.NETTOYAGE,
    priorite: 'Normal'
  };

  private cleaningService = inject(NettoyageMaintenanceService);
  private authService = inject(AuthService);

  ngOnInit() {
    this.loadTasks();
    this.loadPersonnels();
  }

  loadTasks() {
    this.cleaningService.getAll().subscribe({
      next: (data) => this.tasks = data,
      error: (err) => console.error('Error fetching tasks', err)
    });
  }

  loadPersonnels() {
    const token = this.authService.getToken();
    if (token) {
      this.cleaningService.getAllPersonnel(`Bearer ${token}`).subscribe({
        next: (data) => this.personnels = data,
        error: (err) => console.error('Error fetching personnel', err)
      });
    }
  }

  openModal() {
    this.newTask = { type: TypeIntervention.NETTOYAGE, priorite: 'Normal' };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  assignTask() {
    this.newTask.status = StatusIntervention.EN_ATTENTE;
    this.newTask.dateIntervention = new Date().toISOString().split('T')[0];
    
    this.cleaningService.create(this.newTask as NettoyageMaintenance).subscribe({
      next: (created) => {
        if (this.newTask.personnelId) {
          const token = this.authService.getToken();
          this.cleaningService.setPersonnelToIntervention(created.id!, Number(this.newTask.personnelId), `Bearer ${token}`).subscribe({
            next: () => {
              this.loadTasks();
              this.closeModal();
            },
            error: (err) => {
              console.error('Error assigning personnel', err);
              this.loadTasks();
              this.closeModal();
            }
          });
        } else {
          this.loadTasks();
          this.closeModal();
        }
      },
      error: (err) => console.error('Error creating task', err)
    });
  }

  deleteTask(id?: number) {
    if (id && confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      this.cleaningService.delete(id).subscribe({
        next: () => this.loadTasks(),
        error: (err) => console.error('Error deleting task', err)
      });
    }
  }

  getBadgeClassForPriority(priority?: string): string {
    return priority === 'Urgent' ? 'badge-red' : 'badge-yellow';
  }

  getBadgeClassForStatus(status?: StatusIntervention): string {
    switch(status) {
      case StatusIntervention.EN_ATTENTE: return 'badge-yellow';
      case StatusIntervention.EN_COURS: return 'badge-blue';
      case StatusIntervention.TERMINE: return 'badge-green';
      default: return 'badge-gray';
    }
  }
}
