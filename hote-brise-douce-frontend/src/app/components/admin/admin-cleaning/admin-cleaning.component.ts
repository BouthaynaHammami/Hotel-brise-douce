import { Component, OnInit, inject } from '@angular/core';
import { NettoyageMaintenanceService } from '../../../core/services/nettoyage-maintenance.service';
import {
  InterventionRequest,
  InterventionResponse,
  Priorite,
  StatusIntervention,
  TypeIntervention,
  UtilisateurDTO
} from '../../../core/models/nettoyage-maintenance.model';

@Component({
  selector: 'app-admin-cleaning',
  templateUrl: './admin-cleaning.component.html',
  styleUrls: ['./admin-cleaning.component.css']
})
export class AdminCleaningComponent implements OnInit {

  // ─── View state ───────────────────────────────────────────────────────────
  showModal = false;
  editMode = false;
  editId: number | null = null;

  tasks: InterventionResponse[] = [];
  personnels: UtilisateurDTO[] = [];

  // ─── Enum references (used in the template) ───────────────────────────────
  TypeIntervention = TypeIntervention;
  Priorite = Priorite;
  StatusIntervention = StatusIntervention;

  /** Options for the type dropdown */
  typeOptions = Object.values(TypeIntervention);

  /** Options for the priority dropdown */
  prioriteOptions = Object.values(Priorite);

  /** Options for the status dropdown (admin can set any status) */
  statusOptions = Object.values(StatusIntervention);

  // ─── Form model ───────────────────────────────────────────────────────────
  newTask: InterventionRequest = this.emptyForm();

  private cleaningService = inject(NettoyageMaintenanceService);

  ngOnInit() {
    this.loadTasks();
    this.loadPersonnels();
  }

  // ─── Data loading ─────────────────────────────────────────────────────────

  loadTasks() {
    this.cleaningService.getAll().subscribe({
      next: (data) => this.tasks = data,
      error: (err) => console.error('Error fetching tasks', err)
    });
  }

  loadPersonnels() {
    this.cleaningService.getAllPersonnel().subscribe({
      next: (data) => this.personnels = data,
      error: (err) => console.error('Error fetching personnel', err)
    });
  }

  // ─── Modal open / close ───────────────────────────────────────────────────

  openModal() {
    this.editMode = false;
    this.editId = null;
    this.newTask = this.emptyForm();
    this.showModal = true;
  }

  openEditModal(task: InterventionResponse) {
    this.editMode = true;
    this.editId = task.idIntervention;
    this.newTask = {
      typeIntervention: task.typeIntervention,
      description: task.description,
      chambreNumero: task.chambreNumero,
      priorite: task.priorite,
      note: task.note,
      datePlanification: task.datePlanification,
      dateDebut: task.dateDebut,
      dateFin: task.dateFin,
      status: task.status,
      personnelId: task.personnelId ?? null
    };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  // ─── Save (create or update) ──────────────────────────────────────────────

  saveTask() {
    const payload: InterventionRequest = {
      ...this.newTask,
      personnelId: this.newTask.personnelId ? Number(this.newTask.personnelId) : null
    };

    if (this.editMode && this.editId !== null) {
      this.cleaningService.update(this.editId, payload).subscribe({
        next: () => { this.loadTasks(); this.closeModal(); },
        error: (err) => console.error('Error updating task', err)
      });
    } else {
      this.cleaningService.create(payload).subscribe({
        next: () => { this.loadTasks(); this.closeModal(); },
        error: (err) => console.error('Error creating task', err)
      });
    }
  }

  // ─── Delete ───────────────────────────────────────────────────────────────

  deleteTask(id?: number) {
    if (id && confirm('Êtes-vous sûr de vouloir supprimer cette intervention ?')) {
      this.cleaningService.delete(id).subscribe({
        next: () => this.loadTasks(),
        error: (err) => console.error('Error deleting task', err)
      });
    }
  }

  // ─── Badge helpers ────────────────────────────────────────────────────────

  getBadgeClassForPriority(p?: Priorite): string {
    switch (p) {
      case Priorite.URGENTE: return 'badge-red';
      case Priorite.HAUTE:   return 'badge-orange';
      case Priorite.NORMALE: return 'badge-yellow';
      case Priorite.BASSE:   return 'badge-gray';
      default:               return 'badge-gray';
    }
  }

  getBadgeClassForStatus(s?: StatusIntervention): string {
    switch (s) {
      case StatusIntervention.A_FAIRE:  return 'badge-yellow';
      case StatusIntervention.EN_COURS: return 'badge-blue';
      case StatusIntervention.TERMINE:  return 'badge-green';
      default:                          return 'badge-gray';
    }
  }

  labelForStatus(s?: StatusIntervention): string {
    switch (s) {
      case StatusIntervention.A_FAIRE:  return 'À faire';
      case StatusIntervention.EN_COURS: return 'En cours';
      case StatusIntervention.TERMINE:  return 'Terminé';
      default:                          return s ?? '—';
    }
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private emptyForm(): InterventionRequest {
    return {
      typeIntervention: TypeIntervention.NETTOYAGE,
      chambreNumero: undefined,
      description: '',
      priorite: Priorite.NORMALE,
      note: '',
      status: StatusIntervention.A_FAIRE,
      personnelId: null,
      datePlanification: new Date().toISOString().split('T')[0]
    };
  }
}
